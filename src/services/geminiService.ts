import type { AIInsight } from '../types/ai'

type GeminiError = Error & { status?: number }

const GEMINI_MODEL = 'gemini-2.5-flash'

const INSIGHT_SCHEMA = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        keyFactor: { type: 'string' },
    },
    required: ['title', 'summary', 'keyFactor'],
} as const

const cache = new Map<string, AIInsight>()
let blockedUntil = 0

function throwGeminiError(message: string, status?: number): never {
    const error = new Error(message) as GeminiError
    if (status !== undefined) error.status = status
    throw error
}

function getRetryAfterMs(response: Response): number {
    const retryAfter = response.headers.get('Retry-After')
    if (!retryAfter) return 60_000

    const seconds = Number(retryAfter)
    if (!Number.isNaN(seconds)) return seconds * 1000

    const date = Date.parse(retryAfter)
    if (!Number.isNaN(date)) return Math.max(date - Date.now(), 1000)

    return 60_000
}

async function parseGeminiError(response: Response): Promise<string> {
    const text = (await response.text()).trim()

    try {
        const json = JSON.parse(text) as { error?: { message?: string } }
        return json.error?.message?.trim() || text
    } catch {
        return text || `Gemini API error (${response.status})`
    }
}

function isBillingError(message: string): boolean {
    const lower = message.toLowerCase()
    return lower.includes('billing') || lower.includes('credit') || lower.includes('depleted') || lower.includes('quota')
}

function isValidInsight(value: unknown): value is AIInsight {
    if (!value || typeof value !== 'object') return false

    const insight = value as Record<string, unknown>
    return (
        typeof insight.title === 'string' &&
        typeof insight.summary === 'string' &&
        typeof insight.keyFactor === 'string'
    )
}

function extractResponseText(data: {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
        finishReason?: string
    }>
    promptFeedback?: { blockReason?: string }
}): string {
    const candidate = data.candidates?.[0]
    const text = candidate?.content?.parts?.map((part) => part.text ?? '').join('').trim()

    if (text) return text

    const blockReason = data.promptFeedback?.blockReason
    if (blockReason) {
        throwGeminiError(`Gemini blocked the request: ${blockReason}`)
    }

    const finishReason = candidate?.finishReason
    if (finishReason === 'MAX_TOKENS') {
        throwGeminiError('Gemini ran out of output tokens. Please try again.')
    }

    throwGeminiError('Gemini returned an empty response')
}

export async function getAIInsight(prompt: string, cacheKey?: string): Promise<AIInsight> {
    const key = cacheKey ?? prompt
    const cached = cache.get(key)
    if (cached) return cached

    if (Date.now() < blockedUntil) {
        const seconds = Math.ceil((blockedUntil - Date.now()) / 1000)
        throwGeminiError(
            `Gemini rate limit reached. Try again in about ${seconds} seconds.`,
            429
        )
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || apiKey === 'your_key_here') {
        throwGeminiError('Missing Gemini API key. Add VITE_GEMINI_API_KEY to your .env file.')
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: INSIGHT_SCHEMA,
                    temperature: 0.7,
                    maxOutputTokens: 512,
                    thinkingConfig: { thinkingBudget: 0 },
                },
            }),
        }
    )

    if (!res.ok) {
        const message = await parseGeminiError(res)

        if (res.status === 429 && !isBillingError(message)) {
            blockedUntil = Date.now() + getRetryAfterMs(res)
        }

        throwGeminiError(message, res.status)
    }

    const data = await res.json()
    const text = extractResponseText(data)

    try {
        const insight = JSON.parse(text) as unknown
        if (!isValidInsight(insight)) {
            throwGeminiError('Gemini returned an incomplete insight')
        }

        cache.set(key, insight)
        blockedUntil = 0
        return insight
    } catch (error) {
        if (error instanceof Error && error.name === 'GeminiError') throw error
        throwGeminiError('Gemini returned invalid JSON')
    }
}
