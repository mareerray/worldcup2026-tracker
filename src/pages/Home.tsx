import { useEffect, useState } from 'react'
import type { Match, Standing } from '../types'
import '../styles/Home.css'

interface Scorer {
    player: { name: string }
    team: { name: string; shortName: string; crest: string }
    goals: number
}

const SLIDES = [
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/e87e04d68606a91d06bbcc0b0e40c619992e01b9.jpg',
        caption: 'MetLife Stadium — New Jersey',
        credit: '© Getty Images / Dustin Satloff'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/1def98a5168ec304234e7848a36bc8e982d4d7e5.jpg',
        caption: 'Estadio Azteca — Mexico City',
        credit: '© Reuters'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/b0b2915cd2b0fa35b5d5785cb27b5b798a974409.jpg',
        caption: 'BC Place — Vancouver, Canada',
        credit: '© Xinhua / Liang Sen'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/137bc51fd41e17aa828a9b62595d92415dcca003.jpg',
        caption: '🇲🇽 Opening Ceremony — Estadio Azteca, Mexico City',
        credit: '© Getty Images / FIFA'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/8e134d66f88f13db106b32ee1dda70f34ebf50cd.jpg',
        caption: '🇲🇽 Opening Ceremony — Full Stadium View',
        credit: '© AP / ABC News'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a8b479364ea438820dc98598bf9760e10032223a.jpg',
        caption: '🇲🇽 Fan Fest — Mexico City',
        credit: '© PanamericanWorld'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/2ecc4ea01fce21d11df3d2b87b531137d2d823f6.jpg',
        caption: '🇨🇦 Opening Ceremony — BMO Field, Toronto',
        credit: '© AC13 / FIFA'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/58f06837bf76391363897ed8fcd4e39268c5a456.jpg',
        caption: '🇨🇦 Canada Fans — Pre-Game Gathering, Vancouver',
        credit: '© Daily Hive / Offside'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/3a47aa9af260c3d9e0b6d4a4f4b586e7a4e36305.jpg',
        caption: '🇺🇸 Opening Ceremony — SoFi Stadium, Los Angeles',
        credit: '© Getty Images / FIFA'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/af3cddd7d05e5267b90208e637e10ba1640fcd92.jpg',
        caption: '🇺🇸 Opening Ceremony — Los Angeles, USA',
        credit: '© Getty Images / FIFA'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5b3ba9c0d5647e8b172a6832f60e38cd6257c532.jpg',
        caption: '🇺🇸 USA Fans — Seattle, Washington',
        credit: '© Reuters'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4418af1370208e48c42603f549e4f088b8cb1d0b.jpg',
        caption: '⚽ Official Ball — Adidas Trionda',
        credit: '© Getty Images / Juan Manuel Serrano Arce'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9af200ec22a572eac1b90fddbb57e1604d7efb8c.jpg',
        caption: '🏆 FIFA World Cup 2026 Official Logo',
        credit: '© FIFA / Shutterstock'
    },
]

export default function Home() {
    const [recentMatches, setRecentMatches] = useState<Match[]>([])
    const [liveMatches, setLiveMatches] = useState<Match[]>([])
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
    const [scorers, setScorers] = useState<Scorer[]>([])
    const [totalMatches, setTotalMatches] = useState(0)
    const [playedMatches, setPlayedMatches] = useState(0)
    const [loading, setLoading] = useState(true)
    const [groupLeaders, setGroupLeaders] = useState<{ group: string; team: Standing }[]>([])

    // Carousel state
    const [slideIndex, setSlideIndex] = useState(0)
    const [slideVisible, setSlideVisible] = useState(true)

    useEffect(() => {
        let cancelled = false
        const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }


        Promise.all([
            fetch(`/api/football/competitions/WC/standings`, { headers }).then(r => r.json()),
            fetch(`/api/football/competitions/WC/matches?status=LIVE`, { headers }).then(r => r.json()),
            fetch(`/api/football/competitions/WC/matches?status=FINISHED`, { headers }).then(r => r.json()),
            fetch(`/api/football/competitions/WC/matches?status=SCHEDULED`, { headers }).then(r => r.json()),
            fetch(`/api/football/competitions/WC/scorers?season=2026&limit=10`, { headers }).then(r => r.json()),
            fetch(`/api/football/competitions/WC/matches`, { headers }).then(r => r.json()),
        ]).then(([standingsData, liveData, finishedData, scheduledData, scorersData, allMatchesData]) => {
            if (cancelled) return
            // setStandings(standingsData.standings?.[0]?.table?.slice(0, 5) || [])
            setLiveMatches(liveData.matches?.slice(0, 1) || [])
            setRecentMatches(finishedData.matches?.slice(-6).reverse() || [])
            setUpcomingMatches(scheduledData.matches?.slice(0, 3) || [])
            setScorers(scorersData.scorers || [])
            setTotalMatches(allMatchesData.resultSet?.count || 104)
            setPlayedMatches(finishedData.matches?.length || 0)
            setLoading(false)
            const leaders = standingsData.standings
                .filter((g: { type: string }) => g.type === 'TOTAL')
                .map((g: { group: string; table: Standing[] }) => ({
                    group: g.group.replace('GROUP_', 'Group '),
                    team: g.table[0]  // top team
                }))
            setGroupLeaders(leaders)
        })
        return () => { cancelled = true }
    }, [])

    const goToSlide = (index: number) => {
        setSlideVisible(false)
        setTimeout(() => {
            setSlideIndex(index)
            setSlideVisible(true)
        }, 300)
    }

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => goToSlide((slideIndex + 1) % SLIDES.length), 4000)
        return () => clearInterval(interval)
    }, [slideIndex])

    if (loading) return <p className="loading">Loading...</p>

    const progressPercent = Math.round((playedMatches / totalMatches) * 100)

    return (
        <div className="home">

            {/* Row 1 — Standings + Next Match */}
            <div className="home-top">

                <div className="home-card slide-up delay-1">
                    <h3 className="home-card__title">🥇 Group Leaders</h3>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Team</th>
                                <th>P</th>
                                <th>W</th>
                                <th>D</th>
                                <th>L</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupLeaders.map(({ group, team }) => (
                                <tr key={group} className="mini-table__row">
                                    <td className="mini-table__pos">{group}</td>
                                    <td className="mini-table__team">
                                        <img src={team.team.crest} alt={team.team.name} width={20} height={20} />
                                        {team.team.shortName}
                                    </td>
                                    <td>{team.playedGames}</td>
                                    <td>{team.won}</td>
                                    <td>{team.draw}</td>
                                    <td>{team.lost}</td>
                                    <td className="mini-table__pts">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="home-second">
                    <div className="home-second">
                        <div className="home-card slide-up delay-02">
                            <h3 className="home-card__title">🔴 Live Match</h3>
                            {liveMatches.length > 0 ? (
                                liveMatches.map(match => (
                                    <div key={match.id} className="live-match">

                                        <p className="live-match__info">
                                            Matchday {match.matchday} ·{' '}
                                            {new Date(match.utcDate).toLocaleString('en-GB', {
                                                timeZone: 'Europe/Helsinki',
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            <span className="timezone-label">EEST</span>
                                        </p>

                                        <div className="live-match__teams">
                                            <div className="live-match__team">
                                                <img
                                                    src={match.homeTeam.crest}
                                                    alt={match.homeTeam.name}
                                                    width={28}
                                                    height={28}
                                                />
                                                <span>{match.homeTeam.shortName}</span>
                                            </div>

                                            <span className="live-match__vs">VS</span>

                                            <div className="live-match__team">
                                                <img
                                                    src={match.awayTeam.crest}
                                                    alt={match.awayTeam.name}
                                                    width={28}
                                                    height={28}
                                                />
                                                <span>{match.awayTeam.shortName}</span>
                                            </div>
                                        </div>

                                        <div className="live-match__score">
                                            {match.score.fullTime.home} - {match.score.fullTime.away}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No match is live at the moment</p>
                            )}
                        </div>
                    </div>

                    <div className="home-card slide-up delay-02">
                        <h3 className="home-card__title">📅 Upcoming Matches</h3>
                        {upcomingMatches.length > 0 ? (
                            <div className="next-match">
                                {upcomingMatches.map(match => (
                                    <div key={match.id} className="next-match__item">
                                        <div className="next-match__teams">
                                            <div className="next-match__team">
                                                <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={32} height={32} />
                                                <span>{match.homeTeam.shortName}</span>
                                            </div>

                                            <div className="next-match__middle">
                                                <span className="next-match__vs">VS</span>
                                            </div>

                                            <div className="next-match__team">
                                                <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={32} height={32} />
                                                <span>{match.awayTeam.shortName}</span>
                                            </div>
                                        </div>

                                        <p className="next-match__date">
                                            Matchday {match.matchday} ·{' '}
                                            {new Date(match.utcDate).toLocaleDateString('en-GB', {
                                                timeZone: 'Europe/Helsinki',
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                            {' · '}
                                            {new Date(match.utcDate).toLocaleTimeString('en-GB', {
                                                timeZone: 'Europe/Helsinki',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            <span className="timezone-label">EEST</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">No upcoming matches</p>
                        )}
                    </div>
                </div>

            </div>

            {/* Row 2 — Tournament Progress + Carousel & Scorers */}
            <div className="home-mid">

                {/* Tournament Progress — full width */}
                <div className="home-card slide-up delay-03 home-mid__full">
                    <h3 className="home-card__title">📊 Tournament Progress</h3>
                    <div className="progress-section">
                        <div className="progress-label">
                            <span>Group Stage</span>
                            <span>{playedMatches} of {totalMatches} played</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar__fill"
                                style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
                            />
                        </div>
                        <p className="progress-remaining">{totalMatches - playedMatches} matches remaining</p>
                    </div>
                </div>

                {/* Image Carousel */}
                <div className="home-card carousel-card slide-up delay-04">
                    <h3 className="home-card__title">📸 World Cup 2026</h3>
                    <div className="carousel">
                        <img
                            src={SLIDES[slideIndex].url}
                            alt={SLIDES[slideIndex].caption}
                            className={`carousel__img ${slideVisible ? 'carousel__img--visible' : 'carousel__img--hidden'}`}
                        />
                        <div className="carousel__caption">{SLIDES[slideIndex].caption}</div>
                        <div className="carousel__credit">📷 {SLIDES[slideIndex].credit}</div>
                        <div className="carousel__controls">
                            <button className="carousel__arrow" onClick={() => goToSlide((slideIndex - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
                            <div className="fact-dots">
                                {SLIDES.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`fact-dot ${i === slideIndex ? 'fact-dot--active' : ''}`}
                                        onClick={() => goToSlide(i)}
                                    />
                                ))}
                            </div>
                            <button className="carousel__arrow" onClick={() => goToSlide((slideIndex + 1) % SLIDES.length)}>›</button>
                        </div>
                    </div>
                </div>

                {/* Top Scorers */}
                <div className="home-card slide-up delay-05">
                    <h3 className="home-card__title">🥅 Top Scorers</h3>
                    <div className="scorers-list">
                        {scorers.map((s, i) => (
                            <div key={i} className="scorer-row">
                                <span className="scorer-row__rank">{i + 1}</span>
                                <img src={s.team.crest} alt={s.team.shortName} width={20} height={20} />
                                <span className="scorer-row__name">{s.player.name}</span>
                                <span className="scorer-row__team">{s.team.shortName}</span>
                                <span className="scorer-row__goals">{s.goals} ⚽</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Row 3 — Latest Results full width */}
            <div className="home-card slide-up delay-06">
                <h3 className="home-card__title">⚽ Latest Results</h3>
                <div className="results-list">
                    {recentMatches.map(match => (
                        <div key={match.id} className="result-row">
                            <div className="result-row__team result-row__team--home">
                                <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
                                <span>{match.homeTeam.shortName}</span>
                            </div>
                            <div className="result-row__score">
                                <span className={match.score.fullTime.home! > match.score.fullTime.away! ? 'score--winner' : ''}>
                                    {match.score.fullTime.home}
                                </span>
                                <span className="score--divider">–</span>
                                <span className={match.score.fullTime.away! > match.score.fullTime.home! ? 'score--winner' : ''}>
                                    {match.score.fullTime.away}
                                </span>
                            </div>
                            <div className="result-row__team result-row__team--away">
                                <span>{match.awayTeam.shortName}</span>
                                <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
