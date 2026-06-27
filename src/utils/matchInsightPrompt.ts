import type { Match } from '../types'

function formatGroup(group: string): string {
    return group.replace(/^GROUP_/, 'Group ').replace(/_/g, ' ')
}

function formatKickoff(utcDate: string): string {
    return new Date(utcDate).toLocaleString('en-GB', {
        timeZone: 'Europe/Helsinki',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function buildMatchInsightPrompt(match: Match): string {
    const venue = match.venue?.trim() || 'TBC'
    const group = match.group ? formatGroup(match.group) : 'World Cup 2026'
    const home = match.homeTeam.shortName
    const away = match.awayTeam.shortName

    return `You are a sharp football analyst writing for FIFA World Cup 2026 fans.

Write a pre-match insight for this upcoming fixture:
- ${match.homeTeam.name} vs ${match.awayTeam.name}
- ${group} · Matchday ${match.matchday}
- Kick-off: ${formatKickoff(match.utcDate)} (EEST)
- Venue: ${venue}

Return ONLY valid JSON with exactly these keys:
- "title": punchy headline, max 8 words
- "summary": 2 short sentences, max 55 words total. Mention what is at stake for both teams and one plausible tactical storyline.
- "keyFactor": one short, casual sentence on what could decide the match. Max 18 words.

  keyFactor rules — follow strictly:
  - Name at least one team: use "${home}" or "${away}" (short names). Never use vague words like "they", "them", "whoever", or "the team".
  - Say something specific: what must that team do well? (e.g. defend corners, press high, finish chances)
  - Use simple words. Say "win" not "emerge victorious". Say "mistakes at the back" not "defensive lapses".
  - BAD: "Taking chances when they come will be huge." (who is they?)
  - BAD: "Whoever defends better should win it." (too vague)
  - GOOD: "${home} need to score from corners if ${away} sit deep."
  - GOOD: "${away} must stop ${home}'s fast breaks early on."

Rules:
- Sound like a normal football fan, not a betting tipster or TV pundit
- keyFactor must name a team and one clear thing that could decide the match
- Do not invent injuries, confirmed lineups, or past results unless widely known
- Do not mention JSON, AI, or that you are a model
- No markdown, bullet points, or extra keys`
}

export function matchInsightCacheKey(match: Match): string {
    return `insight-${match.id}`
}
