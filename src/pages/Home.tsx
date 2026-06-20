import { useEffect, useState } from 'react'
import type { Match, Standing } from '../types'

interface Scorer {
    player: { name: string }
    team: { name: string; shortName: string; crest: string }
    goals: number
}

const SLIDES = [
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/e87e04d68606a91d06bbcc0b0e40c619992e01b9.jpg',
        caption: '🏟️ MetLife Stadium — New Jersey'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/1def98a5168ec304234e7848a36bc8e982d4d7e5.jpg',
        caption: '🏟️ Estadio Azteca — Mexico City'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4418af1370208e48c42603f549e4f088b8cb1d0b.jpg',
        caption: '⚽ Official Ball — Adidas Trionda'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9af200ec22a572eac1b90fddbb57e1604d7efb8c.jpg',
        caption: '🏆 FIFA World Cup 2026 Official Logo'
    },
    {
        url: 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/b0b2915cd2b0fa35b5d5785cb27b5b798a974409.jpg',
        caption: '🏟️ BC Place — Vancouver, Canada'
    },
]

export default function Home() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [recentMatches, setRecentMatches] = useState<Match[]>([])
    const [nextMatch, setNextMatch] = useState<Match | null>(null)
    const [scorers, setScorers] = useState<Scorer[]>([])
    const [totalMatches, setTotalMatches] = useState(0)
    const [playedMatches, setPlayedMatches] = useState(0)
    const [loading, setLoading] = useState(true)

    // Carousel state
    const [slideIndex, setSlideIndex] = useState(0)
    const [slideVisible, setSlideVisible] = useState(true)

    useEffect(() => {
        const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

        Promise.all([
            fetch('/api/v4/competitions/WC/standings', { headers }).then(r => r.json()),
            fetch('/api/v4/competitions/WC/matches?status=FINISHED', { headers }).then(r => r.json()),
            fetch('/api/v4/competitions/WC/matches?status=SCHEDULED', { headers }).then(r => r.json()),
            fetch('/api/v4/competitions/WC/scorers?season=2026&limit=5', { headers }).then(r => r.json()),
            fetch('/api/v4/competitions/WC/matches', { headers }).then(r => r.json()),
        ]).then(([standingsData, finishedData, scheduledData, scorersData, allMatchesData]) => {
            setStandings(standingsData.standings?.[0]?.table?.slice(0, 5) || [])
            setRecentMatches(finishedData.matches?.slice(-6).reverse() || [])
            setNextMatch(scheduledData.matches?.[0] || null)
            setScorers(scorersData.scorers || [])
            setTotalMatches(allMatchesData.resultSet?.count || 104)
            setPlayedMatches(finishedData.matches?.length || 0)
            setLoading(false)
        })
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
                    <h3 className="home-card__title">🥇 Group A Standings</h3>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Team</th>
                                <th>P</th>
                                <th>W</th>
                                <th>D</th>
                                <th>L</th>
                                <th>GD</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((s, i) => (
                                <tr key={s.team.id} className="mini-table__row">
                                    <td className="mini-table__pos">{i + 1}</td>
                                    <td className="mini-table__team">
                                        <img src={s.team.crest} alt={s.team.name} width={20} height={20} />
                                        {s.team.shortName}
                                    </td>
                                    <td>{s.playedGames}</td>
                                    <td>{s.won}</td>
                                    <td>{s.draw}</td>
                                    <td>{s.lost}</td>
                                    <td className="mini-table__gd">
                                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                                    </td>
                                    <td className="mini-table__pts">{s.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="home-card slide-up delay-02">
                    <h3 className="home-card__title">📅 Next Match</h3>
                    {nextMatch ? (
                        <div className="next-match">
                            <div className="next-match__teams">
                                <div className="next-match__team">
                                    <img src={nextMatch.homeTeam.crest} alt={nextMatch.homeTeam.name} width={48} height={48} />
                                    <span>{nextMatch.homeTeam.shortName}</span>
                                </div>
                                <div className="next-match__middle">
                                    <span className="next-match__vs">VS</span>
                                    <span className="badge">Matchday {nextMatch.matchday}</span>
                                </div>
                                <div className="next-match__team">
                                    <img src={nextMatch.awayTeam.crest} alt={nextMatch.awayTeam.name} width={48} height={48} />
                                    <span>{nextMatch.awayTeam.shortName}</span>
                                </div>
                            </div>
                            <p className="next-match__date">
                                {new Date(nextMatch.utcDate).toLocaleDateString('en-GB', {
                                    weekday: 'long', day: 'numeric', month: 'long'
                                })}
                                {' · '}
                                {new Date(nextMatch.utcDate).toLocaleTimeString('en-GB', {
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    ) : (
                        <p className="no-data">No upcoming matches</p>
                    )}
                </div>

            </div>

            {/* Row 2 — Top Scorers + Progress + Carousel */}
            <div className="home-mid">

                <div className="home-card slide-up delay-03">
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

                <div className="home-card slide-up delay-04">
                    <h3 className="home-card__title">📊 Tournament Progress</h3>
                    <div className="progress-section">
                        <div className="progress-label">
                            <span>Group Stage</span>
                            <span>{playedMatches} of {totalMatches} played</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar__fill" data-progress={Math.round(progressPercent)} />
                        </div>
                        <p className="progress-remaining">{totalMatches - playedMatches} matches remaining</p>
                    </div>
                </div>

                {/* Image Carousel */}
                <div className="home-card carousel-card slide-up delay-05">
                    <h3 className="home-card__title">📸 WC 2026</h3>
                    <div className="carousel">
                        <img
                            src={SLIDES[slideIndex].url}
                            alt={SLIDES[slideIndex].caption}
                            className={`carousel__img ${slideVisible ? 'carousel__img--visible' : 'carousel__img--hidden'}`}
                        />
                        <div className="carousel__caption">{SLIDES[slideIndex].caption}</div>
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
