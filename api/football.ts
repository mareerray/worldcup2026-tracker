type ApiRequest = {
    url?: string
}

type ApiResponse = {
    status: (code: number) => {
        send: (body: string) => void
        json: (body: { error: string }) => void
    }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
    try {
        const url = new URL(req.url || '/', 'https://worldcup2026-tracker-app.vercel.app')
        const path = url.pathname.replace(/^\/api\/football/, '') || '/competitions/WC/standings'

        const upstream = `https://api.football-data.org/v4${path}${url.search}`

        const response = await fetch(upstream, {
            headers: {
                'X-Auth-Token': process.env.VITE_API_KEY || process.env.API_KEY || ''
            }
        })

        const text = await response.text()
        res.status(response.status).send(text)
    } catch {
        res.status(500).json({ error: 'Server error' })
    }
}