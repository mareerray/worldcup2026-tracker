import type { Match } from '../types'

type KnockoutBracketProps = {
  round32: Match[]
  round16: Match[]
  quarterFinals: Match[]
  semiFinals: Match[]
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

function padToEven(count: number) {
  return count % 2 === 0 ? count : count + 1
}

function buildSlots(matches: Match[], minSlots: number) {
  // Sort by match ID so bracket order matches FIFA's official structure
  const sorted = [...matches].sort((a, b) => a.id - b.id)
  const slots: (Match | null)[] = sorted.map((m) => m)
  const target = padToEven(Math.max(minSlots, slots.length))
  while (slots.length < target) slots.push(null)
  return slots
}
// function buildSlots(matches: Match[], minSlots: number) {
//   const slots: (Match | null)[] = matches.map((m) => m)
//   const target = padToEven(Math.max(minSlots, slots.length))
//   while (slots.length < target) slots.push(null)
//   return slots
// }

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

function BracketFinalRound({ title, match, slotFlex }: { title: string; match: Match | null; slotFlex: number }) {
  return (
    <div className="bracket-round bracket-round--final">
      <div className="bracket-round__title">{title}</div>
      <div className="bracket-round__pairs">
        <div className="bracket-pair bracket-pair--single" style={{ flex: slotFlex }}>
          <BracketSlot match={match} />
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
  final,
}: KnockoutBracketProps) {
  const r32Slots = buildSlots(round32, round32.length || 2)
  const r16Min = Math.max(round16.length, r32Slots.length / 2, 2)
  const r16Slots = buildSlots(round16, r16Min)
  const qfMin = Math.max(quarterFinals.length, r16Slots.length / 2, 2)
  const qfSlots = buildSlots(quarterFinals, qfMin)
  const sfMin = Math.max(semiFinals.length, qfSlots.length / 2, 2)
  const sfSlots = buildSlots(semiFinals, sfMin)

  const r32Pairs = toPairs(r32Slots)
  const r16Pairs = toPairs(r16Slots)
  const qfPairs = toPairs(qfSlots)
  const sfPairs = toPairs(sfSlots)

  const showFullBracket = r32Pairs.length > 1

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
          <BracketRound title="Semi-finals" pairs={sfPairs} pairFlex={8} showConnectors />
          <BracketFinalRound title="Final" match={final} slotFlex={16} />
        </div>
      </div>
    </div>
  )
}
