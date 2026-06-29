import type { Connect, Plugin } from 'vite'
import { callGeminiGenerateContent, getGeminiApiKey } from './lib/geminiUpstream'

function readJsonBody(req: Connect.IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8')
                resolve(raw ? JSON.parse(raw) : {})
            } catch (error) {
                reject(error)
            }
        })
        req.on('error', reject)
    })
}

export function geminiDevApiPlugin(apiKey?: string): Plugin {
    return {
        name: 'gemini-dev-api',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url?.startsWith('/api/gemini')) {
                    next()
                    return
                }

                if (req.method !== 'POST') {
                    res.statusCode = 405
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: { message: 'Method not allowed' } }))
                    return
                }

                const key = apiKey || getGeminiApiKey()
                if (!key || key === 'your_key_here') {
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    res.end(
                        JSON.stringify({
                            error: { message: 'Missing Gemini API key. Set GEMINI_API_KEY in your .env file.' },
                        })
                    )
                    return
                }

                try {
                    const body = (await readJsonBody(req)) as { prompt?: string }
                    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

                    if (!prompt) {
                        res.statusCode = 400
                        res.setHeader('Content-Type', 'application/json')
                        res.end(JSON.stringify({ error: { message: 'Missing prompt in request body.' } }))
                        return
                    }

                    const response = await callGeminiGenerateContent(prompt, key)
                    const text = await response.text()

                    res.statusCode = response.status
                    res.setHeader('Content-Type', 'application/json')
                    res.end(text)
                } catch {
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ error: { message: 'Server error' } }))
                }
            })
        },
    }
}
