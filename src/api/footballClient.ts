export class FootballApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'FootballApiError'
        this.status = status
    }
}

function formatFootballApiError(status: number, message: string): string {
    const lower = message.toLowerCase()

    if (lower.includes('disabled')) {
        return 'Your football-data.org account is disabled. Log in at football-data.org to reactivate it, or register a new API key and update VITE_API_KEY in .env.'
    }

    if (status === 403) {
        return 'Football data access denied. Check your API key at football-data.org and update VITE_API_KEY in .env, then restart the dev server.'
    }

    if (status === 429) {
        return 'Football data rate limit reached. Please wait a minute and refresh.'
    }

    return message || `Football API error (${status})`
}

/** Browser helper — calls `/api/football` (Vite proxy in dev, `api/football.ts` on Vercel). */
export async function fetchFootballJson<T>(path: string): Promise<T> {
    const apiKey = import.meta.env.VITE_API_KEY

    if (!apiKey || apiKey === 'your_key_here') {
        throw new FootballApiError(
            'Missing API key. Add VITE_API_KEY to your .env file and restart the dev server.',
            401
        )
    }

    const response = await fetch(`/api/football${path}`, {
        headers: { 'X-Auth-Token': apiKey },
    })

    if (!response.ok) {
        const message = (await response.text()).trim()
        throw new FootballApiError(
            formatFootballApiError(response.status, message),
            response.status
        )
    }

    return response.json() as Promise<T>
}
