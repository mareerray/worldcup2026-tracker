const cache = new Map<string, string>()

export async function getMatchPreview(home: string, away: string): Promise<string> {
    const cacheKey = `${home}-${away}`
    if (cache.has(cacheKey)) return cache.get(cacheKey)!

    const fallbackPreviews = [
        `${home} and ${away} are set for a tense World Cup meeting with little margin for error.`,
        `${home} vs ${away} feels like a match where one moment of quality could decide everything.`,
        `${home} and ${away} should bring plenty of intensity in a game that could swing either way.`,
    ]
    const fallback = fallbackPreviews[Math.abs((home + away).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % fallbackPreviews.length]

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) return fallback

    const prompt = `In one punchy sentence (max 20 words), preview ${home} vs ${away} at FIFA World Cup 2026. Sound like an excited football fan, mention something specific about one team.`

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        )

        if (!res.ok) return fallback

        const data = await res.json()
        const preview = data?.candidates?.[0]?.content?.parts?.[0]?.text
        const result = typeof preview === 'string' && preview.trim() ? preview : fallback

        cache.set(cacheKey, result) // save it so it never calls the API again for same match
        return result
    } catch {
        return fallback
    }
}