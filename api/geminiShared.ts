export const GEMINI_MODEL = 'gemini-2.5-flash'

const INSIGHT_SCHEMA = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        keyFactor: { type: 'string' },
    },
    required: ['title', 'summary', 'keyFactor'],
} as const

export function getGeminiApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || undefined
}

export async function callGeminiGenerateContent(prompt: string, apiKey: string): Promise<Response> {
    return fetch(
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
}
