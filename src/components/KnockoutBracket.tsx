import type { Match, MatchTeam } from '../types'

type KnockoutBracketProps = {
  round32: Match[]
  round16: Match[]
  quarterFinals: Match[]
  semiFinals: Match[]
  thirdPlace: Match | null
  final: Match | null
}

const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'LIVE'])

function formatKickoff(utcDate: string) {
  return new Date(utcDate).toLocaleString('en-GB', {
    timeZone: 'Europe/Helsinki',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Temporary: hardcoded R16 bracket order until Round of 32 is complete.
// Maps slot index (0–7) to the known API match ID.
const R16_SLOT_ORDER: Record<number, number> = {
  0: 537375, // M89 — PAR vs ?           → Jul 4, 22:00 EEST
  1: 537376, // M90 — CAN vs MAR         → Jul 4, 20:00 EEST
  2: 537379, // M93 — POR/CRO vs ESP/AUT → Jul 6, 22:00 EEST
  3: 537380, // M94 — USA/BIH vs BEL/SEN → Jul 7, 03:00 EEST
  4: 537377, // M91 — BRA vs ?           → Jul 5, 23:00 EEST
  5: 537378, // M92 — ? vs ?             → Jul 6, 03:00 EEST
  6: 537381, // M95 — ? vs ?             → Jul 7, 19:00 EEST
  7: 537382, // M96 — ? vs ?             → Jul 7, 23:00 EEST
}

function scoreText(match: Match) {
  if (LIVE_STATUSES.has(match.status) || match.status === 'FINISHED') {
    return `${match.score.fullTime.home ?? 0} – ${match.score.fullTime.away ?? 0}`
  }
  return null
}

function winnerName(match: Match) {
  if (match.status !== 'FINISHED') return null
  const home = match.score.fullTime.home ?? 0
  const away = match.score.fullTime.away ?? 0
  if (home === away) return null
  return home > away ? match.homeTeam.name : match.awayTeam.name
}

function winnerTeam(match: Match): MatchTeam | null {
  if (match.status !== 'FINISHED') return null
  const home = match.score.fullTime.home ?? 0
  const away = match.score.fullTime.away ?? 0
  if (home === away) return null
  return home > away ? match.homeTeam : match.awayTeam
}

function matchInvolvesTeam(match: Match, team: MatchTeam): boolean {
  if (team.id != null) {
    if (match.homeTeam.id === team.id || match.awayTeam.id === team.id) return true
  }
  if (team.name) {
    if (match.homeTeam.name === team.name || match.awayTeam.name === team.name) return true
  }
  return false
}

// Full World Cup knockout tree — every round must share the same flex total (8)
// so pair heights line up across columns.
const BRACKET_SLOT_COUNT = {
  round32: 16,
  round16: 8,
  quarterFinals: 4,
  semiFinals: 2,
} as const

function buildR32Slots(matches: Match[], targetSlots: number) {
  const sorted = [...matches].sort((a, b) => a.id - b.id)
  const slots: (Match | null)[] = sorted.slice(0, targetSlots)
  while (slots.length < targetSlots) slots.push(null)
  return slots
}

function participantTeam(feeder: Match | null): MatchTeam | null {
  if (!feeder) return null
  return winnerTeam(feeder)
}

// API match IDs are not in bracket-tree order. Place each fixture in the slot
// whose feeders (two previous-round matches) produced the teams involved.
function assignRoundSlots(
  previousSlots: (Match | null)[],
  matches: Match[],
  targetSlots: number
) {
  const slots: (Match | null)[] = Array.from({ length: targetSlots }, () => null)
  const remaining = [...matches]

  for (let slot = 0; slot < targetSlots; slot++) {
    const teamA = participantTeam(previousSlots[slot * 2] ?? null)
    const teamB = participantTeam(previousSlots[slot * 2 + 1] ?? null)
    if (!teamA && !teamB) continue

    const index = remaining.findIndex(
      (match) =>
        (teamA && matchInvolvesTeam(match, teamA)) ||
        (teamB && matchInvolvesTeam(match, teamB))
    )
    if (index >= 0) {
      slots[slot] = remaining[index]
      remaining.splice(index, 1)
    }
  }

  // Fallback: teams not yet known (previous round unfinished).
  // Use hardcoded slot order for R16 when all 8 slots are empty.
  if (targetSlots === 8) {
    const byId = Object.fromEntries(remaining.map(m => [m.id, m]))
    for (let i = 0; i < targetSlots; i++) {
      if (slots[i] !== null) continue // already filled by team-matching, skip this slot
      const id = R16_SLOT_ORDER[i]
      if (id && byId[id]) slots[i] = byId[id]
    }
    return slots
  }

  // remaining.sort((a, b) => a.id - b.id)
  // Generic Fallback: teams not yet known (previous round unfinished).
  // Sort by date as a best-effort guess — bracket position may be
  // incorrect until previous round results are available.
  remaining.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
  for (const match of remaining) {
    const emptyIndex = slots.findIndex((slot) => slot === null)
    if (emptyIndex < 0) break
    slots[emptyIndex] = match
  }

  return slots
}

function toPairs(slots: (Match | null)[]) {
  const pairs: [Match | null, Match | null][] = []
  for (let i = 0; i < slots.length; i += 2) {
    pairs.push([slots[i] ?? null, slots[i + 1] ?? null])
  }
  return pairs
}

function BracketCard({ match }: { match: Match }) {
  const live = LIVE_STATUSES.has(match.status)
  const finished = match.status === 'FINISHED'
  const winner = winnerName(match)
  const score = scoreText(match)

  return (
    <div
      className={`bracket-card ${live ? 'bracket-card--live' : ''} ${finished ? 'bracket-card--finished' : ''}`}
    >
      <div className="bracket-card__meta">
        <span className="bracket-card__date">
          {formatKickoff(match.utcDate)}
          <span className="timezone-label">EEST</span>
        </span>
        
      </div>
      <div className="bracket-card__matchup">
        <img src={match.homeTeam.crest} alt="" className="bracket-card__crest" aria-hidden />
        <span className={`bracket-card__team ${winner === match.homeTeam.name ? 'bracket-card__team--winner' : ''}`}>
          {match.homeTeam.name}
        </span>
        <span className="bracket-card__vs">vs</span>
        <span className={`bracket-card__team ${winner === match.awayTeam.name ? 'bracket-card__team--winner' : ''}`}>
          {match.awayTeam.name}
        </span>
        <img src={match.awayTeam.crest} alt="" className="bracket-card__crest" aria-hidden />
      </div>
      {score ? <span className="bracket-card__score">{score}</span> : <span className="bracket-card__score">TBD</span>}
    </div>
  )
}

function BracketPlaceholder() {
  return <div className="bracket-card bracket-card--placeholder">TBD</div>
}

function BracketSlot({ match }: { match: Match | null }) {
  return match ? <BracketCard match={match} /> : <BracketPlaceholder />
}

function BracketRound({
  title,
  pairs,
  pairFlex,
  showConnectors,
}: {
  title: string
  pairs: [Match | null, Match | null][]
  pairFlex: number
  showConnectors: boolean
}) {
  return (
    <div className={`bracket-round ${showConnectors ? 'bracket-round--connected' : ''}`}>
      <div className="bracket-round__title">{title}</div>
      <div className="bracket-round__pairs">
        {pairs.map((pair, index) => (
          <div key={index} className="bracket-pair" style={{ flex: pairFlex }}>
            <BracketSlot match={pair[0]} />
            <BracketSlot match={pair[1]} />
          </div>
        ))}
      </div>
    </div>
  )
}

function BracketSemiFinalsRound({
  semiMatches,
  thirdPlaceMatch,
  slotFlex,
}: {
  semiMatches: (Match | null)[]
  thirdPlaceMatch: Match | null
  slotFlex: number
}) {
  const semi1 = semiMatches[0] ?? null
  const semi2 = semiMatches[1] ?? null

  return (
    <div className="bracket-round bracket-round--semis bracket-round--connected">
      <div className="bracket-round__title">Semi-finals</div>
      <div className="bracket-round__pairs">
        <div className="bracket-pair bracket-pair--semis" style={{ flex: slotFlex }}>
          <div className="bracket-semi-anchor bracket-semi-anchor--top">
            <BracketSlot match={semi1} />
          </div>
          <div className="bracket-third-place">
            <span className="bracket-third-place__label">Match for third place</span>
            <BracketSlot match={thirdPlaceMatch} />
          </div>
          <div className="bracket-semi-anchor bracket-semi-anchor--bottom">
            <BracketSlot match={semi2} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BracketFinalRound({ match, slotFlex }: { match: Match | null; slotFlex: number }) {
  return (
    <div className="bracket-round bracket-round--final">
      <div className="bracket-round__title">Final</div>
      <div className="bracket-round__pairs">
        <div className="bracket-pair bracket-pair--single bracket-final-slot" style={{ flex: slotFlex }}>
          <div className="bracket-final">
            <span className="bracket-final__label">Final match</span>
            <BracketSlot match={match} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KnockoutBracket({
  round32,
  round16,
  quarterFinals,
  semiFinals,
  thirdPlace,
  final,
}: KnockoutBracketProps) {
  const r32Slots = buildR32Slots(round32, BRACKET_SLOT_COUNT.round32)
  const r16Slots = assignRoundSlots(r32Slots, round16, BRACKET_SLOT_COUNT.round16)
  const qfSlots = assignRoundSlots(r16Slots, quarterFinals, BRACKET_SLOT_COUNT.quarterFinals)
  const sfSlots = assignRoundSlots(qfSlots, semiFinals, BRACKET_SLOT_COUNT.semiFinals)

  const r32Pairs = toPairs(r32Slots)
  const r16Pairs = toPairs(r16Slots)
  const qfPairs = toPairs(qfSlots)
  const sfMatches = sfSlots.slice(0, 2)

  const knockoutMatchCount =
    round32.length +
    round16.length +
    quarterFinals.length +
    semiFinals.length +
    (thirdPlace ? 1 : 0) +
    (final ? 1 : 0)
  const showFullBracket = knockoutMatchCount > 2

  if (!showFullBracket) {
    return (
      <div className="bracket-shell">
        <div className="bracket-list">
          {round32.length > 0 ? (
            round32.map((match) => <BracketCard key={match.id} match={match} />)
          ) : (
            <BracketPlaceholder />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bracket-shell">
      <div className="bracket-scroll" tabIndex={0} role="region" aria-label="Knockout bracket — scroll horizontally">
        <div className="bracket-tree">
          <BracketRound title="Round of 32" pairs={r32Pairs} pairFlex={1} showConnectors />
          <BracketRound title="Round of 16" pairs={r16Pairs} pairFlex={2} showConnectors />
          <BracketRound title="Quarter-finals" pairs={qfPairs} pairFlex={4} showConnectors />
          <BracketSemiFinalsRound semiMatches={sfMatches} thirdPlaceMatch={thirdPlace} slotFlex={8} />
          <BracketFinalRound match={final} slotFlex={16} />
        </div>
      </div>
    </div>
  )
}
