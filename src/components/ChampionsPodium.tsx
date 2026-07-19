import '../styles/ChampionsPodium.css'

type PodiumPlace = {
  place: 1 | 2 | 3
  team: string
  shortName: string
  label: string
  crest: string
}

const PODIUM: PodiumPlace[] = [
  {
    place: 2,
    team: 'Argentina',
    shortName: 'Argentina',
    label: 'Second Place',
    crest: 'https://crests.football-data.org/762.svg',
  },
  {
    place: 1,
    team: 'Spain',
    shortName: 'Spain',
    label: 'Champion',
    crest: 'https://crests.football-data.org/760.svg',
  },
  {
    place: 3,
    team: 'England',
    shortName: 'England',
    label: 'Third Place',
    crest: 'https://crests.football-data.org/770.svg',
  },
]

function TrophyIcon() {
  return (
    <svg className="podium__trophy" viewBox="0 0 64 64" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 8h28v6c0 8.5-5.2 15.6-12.5 18.4L32 34l-1.5-1.6C23.2 29.6 18 22.5 18 14V8z"
      />
      <path
        fill="currentColor"
        opacity="0.85"
        d="M10 10h8v4c0 4.4-2.4 8.2-6 10.2C9.4 20.8 8 17.6 8 14v-2c0-1.1.9-2 2-2zm36 0h8c1.1 0 2 .9 2 2v2c0 3.6-1.4 6.8-3.9 9.2-3.6-2-6.1-5.8-6.1-10.2v-4z"
      />
      <rect x="28" y="34" width="8" height="8" rx="1" fill="currentColor" />
      <path fill="currentColor" d="M22 48h20l-2 8H24l-2-8z" />
      <rect x="18" y="56" width="28" height="4" rx="2" fill="currentColor" />
    </svg>
  )
}

function Fireworks() {
  return (
    <div className="podium__fireworks" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} className={`podium__spark podium__spark--${i + 1}`} />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <span key={`burst-${i}`} className={`podium__burst podium__burst--${i + 1}`} />
      ))}
    </div>
  )
}

export default function ChampionsPodium() {
  return (
    <div className="home-card podium-card slide-up delay-02">
      <div className="podium-card__header">
        <h3 className="home-card__title">World Cup 2026 Champions</h3>
        <span className="podium-card__badge">Final results</span>
      </div>

      <div className="podium">
        <Fireworks />

        <div className="podium__stands">
          {PODIUM.map((entry) => (
            <div
              key={entry.place}
              className={`podium__place podium__place--${entry.place}`}
            >
              {entry.place === 1 ? (
                <div className="podium__trophy-wrap">
                  <TrophyIcon />
                  <span className="podium__trophy-glow" />
                </div>
              ) : (
                <span className="podium__medal" aria-hidden="true">
                  {entry.place === 2 ? '🥈' : '🥉'}
                </span>
              )}

              <img
                src={entry.crest}
                alt={`${entry.team} crest`}
                className="podium__crest"
                width={entry.place === 1 ? 48 : 36}
                height={entry.place === 1 ? 48 : 36}
              />

              <p className="podium__team">{entry.shortName}</p>
              <p className="podium__label">{entry.label}</p>

              <div className={`podium__block podium__block--${entry.place}`}>
                <span className="podium__rank">{entry.place}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
