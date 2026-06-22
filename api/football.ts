import type { VercelRequest, VercelResponse } from '@vercel/node'

const cache: Record<string, { time: number; data: string; status: number }> = {}
const CACHE_MS = 60_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const url = new URL(req.url || '/', 'https://worldcup2026-tracker-app.vercel.app')
        const path = url.pathname.replace(/^\/api\/football/, '') || '/competitions/WC/standings'
        const key = path + url.search

        const hit = cache[key]
        if (hit && Date.now() - hit.time < CACHE_MS) {
            res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
            res.status(hit.status).send(hit.data)
            return
        }

        const upstream = `https://api.football-data.org/v4${path}${url.search}`
        const response = await fetch(upstream, {
            headers: {
                'X-Auth-Token': process.env.VITE_API_KEY || process.env.API_KEY || ''
            }
        })

        const text = await response.text()

        if (response.ok) {
            cache[key] = { time: Date.now(), data: text, status: response.status }
        }

        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
        res.status(response.status).send(text)
    } catch {
        res.status(500).json({ error: 'Server error' })
    }
}


// import type { VercelRequest, VercelResponse } from '@vercel/node'

// const cache: Record<string, { time: number; data: string; status: number }> = {}
// const CACHE_MS = 60_000

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     try {
//         const url = new URL(req.url || '/', 'https://worldcup2026-tracker-app.vercel.app')
//         const path = url.pathname.replace(/^\/api\/football/, '') || '/competitions/WC/standings'
//         const key = path + url.search

//         const hit = cache[key]
//         if (hit && Date.now() - hit.time < CACHE_MS) {
//             res.status(hit.status).send(hit.data)
//             return
//         }

//         const upstream = `https://api.football-data.org/v4${path}${url.search}`
//         const response = await fetch(upstream, {
//             headers: {
//                 'X-Auth-Token': process.env.VITE_API_KEY || process.env.API_KEY || ''
//             }
//         })

//         const text = await response.text()
//         cache[key] = { time: Date.now(), data: text, status: response.status }
//         res.status(response.status).send(text)
//     } catch {
//         res.status(500).json({ error: 'Server error' })
//     }
// }
// type ApiRequest = {
//     url?: string
// }

// type ApiResponse = {
//     status: (code: number) => {
//         send: (body: string) => void
//         json: (body: { error: string }) => void
//     }
// }

//     const cache: Record<string, { time: number; data: string; status: number }> = {}
//     const CACHE_MS = 60_000

// export default async function handler(req: ApiRequest, res: ApiResponse) {
//     try {
//         const url = new URL(req.url || '/', 'https://worldcup2026-tracker-app.vercel.app')
//         const path = url.pathname.replace(/^\/api\/football/, '') || '/competitions/WC/standings'

//         const key = path + url.search

//         const hit = cache[key]
//         if (hit && Date.now() - hit.time < CACHE_MS) {
//             res.status(hit.status).send(hit.data)
//             return
//         }

//         const upstream = `https://api.football-data.org/v4${path}${url.search}`

//         const response = await fetch(upstream, {
//             headers: {
//                 'X-Auth-Token': process.env.VITE_API_KEY || process.env.API_KEY || ''
//             }
//         })

//         const text = await response.text()
//         cache[key] = { time: Date.now(), data: text, status: response.status }
//         res.status(response.status).send(text)
//     } catch {
//         res.status(500).json({ error: 'Server error' })
//     }
// }