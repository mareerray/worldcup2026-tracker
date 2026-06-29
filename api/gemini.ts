import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callGeminiGenerateContent, getGeminiApiKey } from '../lib/geminiUpstream'

function readPrompt(req: VercelRequest): string {
    if (typeof req.body === 'string') {
        try {
            const parsed = JSON.parse(req.body) as { prompt?: string }
            return typeof parsed.prompt === 'string' ? parsed.prompt.trim() : ''
        } catch {
            return ''
        }
    }

    if (req.body && typeof req.body === 'object' && 'prompt' in req.body) {
        const prompt = (req.body as { prompt?: unknown }).prompt
        return typeof prompt === 'string' ? prompt.trim() : ''
    }

    return ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: { message: 'Method not allowed' } })
        return
    }

    const apiKey = getGeminiApiKey()
    if (!apiKey || apiKey === 'your_key_here') {
        res.status(500).json({
            error: { message: 'Missing Gemini API key. Set GEMINI_API_KEY in your environment.' },
        })
        return
    }

    const prompt = readPrompt(req)
    if (!prompt) {
        res.status(400).json({ error: { message: 'Missing prompt in request body.' } })
        return
    }

    try {
        const response = await callGeminiGenerateContent(prompt, apiKey)
        const text = await response.text()

        res.setHeader('Content-Type', 'application/json')
        res.status(response.status).send(text)
    } catch (error) {
        console.error('Gemini proxy error:', error)
        res.status(500).json({ error: { message: 'Server error' } })
    }
}
