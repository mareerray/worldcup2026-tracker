import type { AIInsight } from '../types/ai'

type GeminiError = Error & { status?: number }

const GEMINI_MODEL = 'gemini-2.5-flash'

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

export async function getAIInsight(prompt: string): Promise<AIInsight> {
    const cached = cache.get(prompt)
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
        throwGeminiError('Gemini returned an empty response')
    }

    try {
        const insight = JSON.parse(text) as AIInsight
        cache.set(prompt, insight)
        blockedUntil = 0
        return insight
    } catch {
        throwGeminiError('Gemini returned invalid JSON')
    }
}
