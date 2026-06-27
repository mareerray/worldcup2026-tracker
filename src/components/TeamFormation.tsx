import '../styles/TeamFormation.css'
import { useLanguage } from '../i18n/LanguageContext'

interface Player {
  name: string
  position: string
}

interface Props {
  players: Player[]
  team: { crest: string; name: string }
}

const POSITION_ROWS: Record<string, number> = {
  Goalkeeper: 84,
  Defence: 66,
  Midfield: 44,
  Offence: 22,
}

const POSITION_LABELS: Record<string, string> = {
  Goalkeeper: 'GK',
  Defence: 'DEF',
  Midfield: 'MID',
  Offence: 'FWD',
}

export default function TeamFormation({ players, team }: Props) {
  const { t } = useLanguage()

  const groups: Record<string, Player[]> = {
    Goalkeeper: [],
    Defence: [],
    Midfield: [],
    Offence: [],
  }

  players.forEach((p) => {
    if (groups[p.position]) groups[p.position].push(p)
  })

  return (
    <div className="formation-wrap">
      <div className="formation-title-wrap">
        <img
          src={team.crest}
          alt={team.name}
          className="formation-title-icon"
        />
        <h2 className="formation-title">{t('formation.title')}</h2>
      </div>
      <h3 className="formation-subtitle">{t('formation.subtitle')}</h3>

      <div className="formation-pitch">
        <PitchLines />
        {Object.entries(groups).map(([position, posPlayers]) => (
          <PositionRow
            key={position}
            players={posPlayers}
            topPercent={POSITION_ROWS[position]}
            label={POSITION_LABELS[position]}
          />
        ))}
      </div>
    </div>
  )
}

function PitchLines() {
  return (
    <>
      <div className="pitch-outline" />
      <div className="pitch-midline" />
      <div className="pitch-center-circle" />
      <div className="pitch-box pitch-box--top" />
      <div className="pitch-box pitch-box--bottom" />
    </>
  )
}

function PositionRow({ players, topPercent, label }: { players: Player[]; topPercent: number; label: string }) {
  if (players.length === 0) return null

  const laneWidth = Math.min(16, 100 / Math.max(players.length, 1))
  const totalWidth = Math.min(88, Math.max(28, players.length * laneWidth))
  const startLeft = (100 - totalWidth) / 2

  return (
    <>
      <div className="formation-label" style={{ top: `${topPercent}%` }}>{label}</div>
      {players.map((player, i) => {
        const leftPercent = startLeft + (i + 0.5) * (totalWidth / players.length)
        const [firstName, ...rest] = player.name.split(' ')
        const lastName = rest.length ? rest.join(' ') : ''
        return (
          <div
            key={player.name}
            className="formation-player"
            style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
          >
            <div className="formation-player__dot" />
            <div className="formation-player__name">
              <div>{firstName}</div>
              {lastName && <div>{lastName}</div>}
            </div>
          </div>
        )
      })}
    </>
  )
}
