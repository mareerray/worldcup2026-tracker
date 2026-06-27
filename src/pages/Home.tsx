import { useEffect, useRef, useState } from 'react'
import type { Match, Standing, Scorer } from '../types'
import type { AIInsight } from '../types/ai'
import { getAIInsight } from '../services/geminiService'
import { fetchFootballJson, FootballApiError } from '../api/football'
import { buildMatchInsightPrompt, matchInsightCacheKey } from '../utils/matchInsightPrompt'
import { SLIDES } from '../utils/slides.ts'
import { formatGroupName } from '../i18n'
import { useLanguage } from '../i18n/LanguageContext'
import { formatClockTime, formatDate, formatDateTime, formatTime } from '../i18n/format'
import AIResultCard from '../components/ai/AIResultCard'
import MatchInsightButton from '../components/ai/MatchInsightButton'
import '../styles/Home.css'
import '../styles/AIStyles.css'

function isTranslationKey(message: string): boolean {
    return message.startsWith('errors.')
}

export default function Home() {
    const { dict, t, locale, timeZone, timeZoneLabel } = useLanguage()
    const [recentMatches, setRecentMatches] = useState<Match[]>([])
    const [liveMatches, setLiveMatches] = useState<Match[]>([])
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
    const [scorers, setScorers] = useState<Scorer[]>([])
    const [totalMatches, setTotalMatches] = useState(0)
    const [playedMatches, setPlayedMatches] = useState(0)
    const [loading, setLoading] = useState(true)
    const [groupLeaders, setGroupLeaders] = useState<{ group: string; team: Standing }[]>([])
    const [lastUpdated, setLastUpdated] = useState<number | null>(null)
    const [liveFeedNotice, setLiveFeedNotice] = useState<string | null>(null)
    const [dataError, setDataError] = useState<string | null>(null)
    const liveRefreshBlockedUntilRef = useRef<number | null>(null)

    const [aiLoading, setAiLoading] = useState(false)
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)

    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

    const [slideIndex, setSlideIndex] = useState(0)
    const [slideVisible, setSlideVisible] = useState(true)

    const loadStaticHomeData = async (cancelledRef: { current: boolean }) => {
        try {
            const [standingsData, finishedData, scheduledData, scorersData, allMatchesData] = await Promise.all([
                fetchFootballJson<{ standings?: { type: string; group: string; table: Standing[] }[] }>('/competitions/WC/standings'),
                fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?status=FINISHED'),
                fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?status=SCHEDULED'),
                fetchFootballJson<{ scorers?: Scorer[] }>('/competitions/WC/scorers?season=2026&limit=10'),
                fetchFootballJson<{ resultSet?: { count: number } }>('/competitions/WC/matches'),
            ])

            if (cancelledRef.current) return

            setDataError(null)
            setRecentMatches(finishedData.matches?.slice(-6).reverse() || [])
            setUpcomingMatches(scheduledData.matches?.slice(0, 2) || [])
            setScorers(scorersData.scorers || [])
            setTotalMatches(allMatchesData.resultSet?.count || 104)
            setPlayedMatches(finishedData.matches?.length || 0)

            if (!standingsData.standings) return

            const leaders = standingsData.standings
                .filter((g) => g.type === 'TOTAL')
                .map((g) => ({
                    group: g.group,
                    team: g.table[0]
                }))
            setGroupLeaders(leaders)
        } catch (error) {
            if (cancelledRef.current) return

            const message = error instanceof FootballApiError
                ? error.message
                : 'errors.loadData'

            setDataError(message)
        }
    }

    const syncLiveMatches = async (cancelledRef: { current: boolean }) => {
        const blockedUntil = liveRefreshBlockedUntilRef.current
        if (blockedUntil && Date.now() < blockedUntil) return

        const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

        try {
            const response = await fetch(`/api/football/competitions/WC/matches?status=LIVE`, { headers })

            if (response.status === 429) {
                if (!cancelledRef.current) {
                    setLiveFeedNotice('errors.liveRateLimited')
                    liveRefreshBlockedUntilRef.current = Date.now() + 5 * 60_000
                }
                return
            }

            const liveData = await response.json()

            if (cancelledRef.current) return

            setLiveMatches(liveData.matches?.slice(0, 2) || [])
            setLastUpdated(Date.now())
            setLiveFeedNotice(null)
        } catch {
            if (!cancelledRef.current) {
                setLiveFeedNotice('errors.liveUnavailable')
            }
        }
    }

    const handleAskAI = async (match: Match) => {
        setSelectedMatchId(match.id)
        setAiLoading(true)
        setAiInsight(null)
        setAiError(null)

        try {
            const data = await getAIInsight(
                buildMatchInsightPrompt(match),
                matchInsightCacheKey(match)
            )
            setAiInsight(data)
        } catch (error: unknown) {
            const previewError = error as { status?: number; message?: string } | null
            const errorMessage = previewError?.message?.trim() || t('ai.failed')
            setAiError(errorMessage)
        } finally {
            setAiLoading(false)
        }
    }

    useEffect(() => {
        const cancelledRef = { current: false }

        const refresh = async () => {
            await loadStaticHomeData(cancelledRef)
            await syncLiveMatches(cancelledRef)

            if (!cancelledRef.current) {
                setLoading(false)
            }
        }

        refresh()

        const interval = window.setInterval(() => {
            if (!document.hidden) {
                syncLiveMatches(cancelledRef)
            }
        }, 90_000)

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                syncLiveMatches(cancelledRef)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            cancelledRef.current = true
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const goToSlide = (index: number) => {
        setSlideVisible(false)
        setTimeout(() => {
            setSlideIndex(index)
            setSlideVisible(true)
        }, 300)
    }

    useEffect(() => {
        const interval = setInterval(() => goToSlide((slideIndex + 1) % SLIDES.length), 4000)
        return () => clearInterval(interval)
    }, [slideIndex])

    if (loading) return <p className="loading">{t('common.loading')}</p>

    const progressPercent = Math.round((playedMatches / totalMatches) * 100)
    const refreshLabel = lastUpdated
        ? t('home.updatedAt', { time: formatClockTime(locale, lastUpdated, timeZone) })
        : t('home.refreshingLive')

    const slideCaption = dict.slides[slideIndex]?.caption ?? SLIDES[slideIndex].caption

    return (
        <div className="home">
            {dataError ? (
                <p className="home-api-error" role="alert">
                    {isTranslationKey(dataError) ? t(dataError) : dataError}
                </p>
            ) : null}
            <div className="home-top">
                <div className="home-card slide-up delay-1">
                    <h3 className="home-card__title">{t('home.groupLeaders')}</h3>
                    <table className="mini-table">
                        <thead>
                            <tr>
                                <th>{t('common.group')}</th>
                                <th>{t('table.team')}</th>
                                <th>{t('table.played')}</th>
                                <th>{t('table.won')}</th>
                                <th>{t('table.draw')}</th>
                                <th>{t('table.lost')}</th>
                                <th>{t('table.points')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupLeaders.map(({ group, team }) => (
                                <tr key={group} className="mini-table__row">
                                    <td className="mini-table__pos">{formatGroupName(dict, group)}</td>
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
                            <h3 className="home-card__title">{t('home.liveMatch')}</h3>
                            <p className="live-match__status">{t('home.liveRefresh')} {refreshLabel}</p>
                            {liveFeedNotice ? (
                                <p className="live-match__status live-match__status--notice">
                                    {t(liveFeedNotice)}
                                </p>
                            ) : null}
                            {liveMatches.length > 0 ? (
                                liveMatches.map(match => (
                                    <div key={match.id} className="live-match">
                                        <div className="live-match__pill-row">
                                            <span className="live-match__pill live-match__pill--live">{t('home.liveTracker')}</span>
                                            <span className="live-match__pill live-match__pill--delay">{t('home.delayedFeed')}</span>
                                        </div>

                                        <p className="live-match__info">
                                            {t('common.matchday')} {match.matchday} ·{' '}
                                            {formatDateTime(locale, match.utcDate, timeZone, {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            <span className="timezone-label">{timeZoneLabel}</span>
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

                                            <span className="live-match__vs">{t('common.vs')}</span>

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
                                <p className="no-data">{t('home.noLiveMatch')}</p>
                            )}
                        </div>
                    </div>

                    <div className="home-card slide-up delay-02">
                        <h3 className="home-card__title">{t('home.upcomingMatches')}</h3>

                        {upcomingMatches.length > 0 ? (
                            <div className="next-match">
                                {upcomingMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className={`next-match__item ${match.id === selectedMatchId ? 'next-match__item--active' : ''}`}
                                    >
                                        <div className="next-match__teams">
                                            <div className="next-match__team">
                                                <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={32} height={32} />
                                                <span>{match.homeTeam.shortName}</span>
                                            </div>

                                            <div className="next-match__middle">
                                                <span className="next-match__vs">{t('common.vs')}</span>
                                            </div>

                                            <div className="next-match__team">
                                                <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={32} height={32} />
                                                <span>{match.awayTeam.shortName}</span>
                                            </div>
                                        </div>

                                        <p className="next-match__date">
                                            {t('common.matchday')} {match.matchday} ·{' '}
                                            {formatDate(locale, match.utcDate, timeZone, {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                            {' · '}
                                            {formatTime(locale, match.utcDate, timeZone)}
                                            <span className="timezone-label">{timeZoneLabel}</span>
                                        </p>

                                        <MatchInsightButton
                                            loading={aiLoading && selectedMatchId === match.id}
                                            disabled={aiLoading}
                                            onClick={() => handleAskAI(match)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">{t('home.noUpcomingMatches')}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="home-mid">
                <div className="home-card slide-up delay-03 home-mid__full">
                    <h3 className="home-card__title">{t('home.tournamentProgress')}</h3>
                    <div className="progress-section">
                        <div className="progress-label">
                            <span>{t('home.groupStage')}</span>
                            <span>{t('home.playedOf', { played: playedMatches, total: totalMatches })}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar__fill"
                                style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
                            />
                        </div>
                        <p className="progress-remaining">
                            {t('home.matchesRemaining', { count: totalMatches - playedMatches })}
                        </p>
                    </div>
                </div>

                <div className="home-card carousel-card slide-up delay-04">
                    <h3 className="home-card__title">{t('home.worldCupCarousel')}</h3>
                    <div className="carousel">
                        <img
                            src={SLIDES[slideIndex].url}
                            alt={slideCaption}
                            className={`carousel__img ${slideVisible ? 'carousel__img--visible' : 'carousel__img--hidden'}`}
                        />
                        <div className="carousel__caption">{slideCaption}</div>
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

                <div className="home-card slide-up delay-05">
                    <h3 className="home-card__title">{t('home.topScorers')}</h3>
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

            <div className="home-card slide-up delay-06">
                <h3 className="home-card__title">{t('home.latestResults')}</h3>
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

            {aiInsight || aiLoading || aiError ? (
                <AIResultCard
                    insight={aiInsight}
                    loading={aiLoading}
                    error={aiError}
                    onClose={() => {
                        setAiInsight(null)
                        setAiError(null)
                        setAiLoading(false)
                        setSelectedMatchId(null)
                    }}
                />
            ) : null}
        </div>
    )
}
