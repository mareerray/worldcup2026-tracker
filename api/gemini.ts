import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callGeminiGenerateContent, getGeminiApiKey } from './geminiShared'

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

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
    if (!prompt) {
        res.status(400).json({ error: { message: 'Missing prompt in request body.' } })
        return
    }

    try {
        const response = await callGeminiGenerateContent(prompt, apiKey)
        const text = await response.text()

        res.setHeader('Content-Type', 'application/json')
        res.status(response.status).send(text)
    } catch {
        res.status(500).json({ error: { message: 'Server error' } })
    }
}
