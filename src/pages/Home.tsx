import { useEffect, useRef, useState } from 'react'
import type { Match, Scorer } from '../types'
import type { AIInsight } from '../types/ai'
import { getAIInsight } from '../services/geminiService'
import { fetchFootballJson, FootballApiError } from '../api/football'
import { buildMatchInsightPrompt, matchInsightCacheKey } from '../utils/matchInsightPrompt'
import { SLIDES } from '../utils/slides.ts'
import AIResultCard from '../components/ai/AIResultCard'
import MatchInsightButton from '../components/ai/MatchInsightButton'
import KnockoutBracket from '../components/KnockoutBracket'
import '../styles/Home.css'
import '../styles/AIStyles.css'
import '../styles/KnockoutBracket.css'

const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'LIVE'])

function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getLiveMatchDateRange() {
  const from = new Date()
  from.setDate(from.getDate() - 1)
  const to = new Date()
  to.setDate(to.getDate() + 1)
  return { dateFrom: toDateParam(from), dateTo: toDateParam(to) }
}

export default function Home() {
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [liveMatches, setLiveMatches] = useState<Match[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [knockoutRounds, setKnockoutRounds] = useState({
    round32: [] as Match[],
    round16: [] as Match[],
    quarterFinals: [] as Match[],
    semiFinals: [] as Match[],
    thirdPlace: null as Match | null,
    final: null as Match | null,
  })
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
      const sortByDate = (matches: Match[]) =>
        [...matches].sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())

      const [
        round32Data,
        round16Data,
        quarterFinalsData,
        semiFinalsData,
        thirdPlaceData,
        finalData,
        finishedData,
        scheduledData,
        scorersData,
      ] = await Promise.all([
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=LAST_32'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=LAST_16'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=QUARTER_FINALS'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=SEMI_FINALS'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=THIRD_PLACE'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?stage=FINAL'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?status=FINISHED&stage=LAST_32'),
        fetchFootballJson<{ matches?: Match[] }>('/competitions/WC/matches?status=SCHEDULED&stage=LAST_32'),
        fetchFootballJson<{ scorers?: Scorer[] }>('/competitions/WC/scorers?season=2026&limit=10'),
        fetchFootballJson<{ resultSet?: { count: number } }>('/competitions/WC/matches'),
      ])

      if (cancelledRef.current) return

      setDataError(null)
      setKnockoutRounds({
        round32: sortByDate(round32Data.matches || []),
        round16: sortByDate(round16Data.matches || []),
        quarterFinals: sortByDate(quarterFinalsData.matches || []),
        semiFinals: sortByDate(semiFinalsData.matches || []),
        thirdPlace: sortByDate(thirdPlaceData.matches || [])[0] ?? null,
        final: sortByDate(finalData.matches || [])[0] ?? null,
      })
      setRecentMatches(finishedData.matches?.slice(-6).reverse() || [])
      setUpcomingMatches(scheduledData.matches?.slice(0, 2) || [])
      setScorers(scorersData.scorers || [])
    } catch (error) {
      if (cancelledRef.current) return
      const message = error instanceof FootballApiError ? error.message : 'Could not load tournament data. Please try again later.'
      setDataError(message)
    }
  }

  const syncLiveMatches = async (cancelledRef: { current: boolean }) => {
    const blockedUntil = liveRefreshBlockedUntilRef.current
    if (blockedUntil && Date.now() < blockedUntil) return

    const headers = { 'X-Auth-Token': import.meta.env.VITE_API_KEY }

    try {
      const { dateFrom, dateTo } = getLiveMatchDateRange()
      const response = await fetch(`/api/football/competitions/WC/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, { headers })

      if (response.status === 429) {
        if (!cancelledRef.current) {
          setLiveFeedNotice('Live feed is rate-limited right now. Showing the latest cached update.')
          liveRefreshBlockedUntilRef.current = Date.now() + 5 * 60_000
        }
        return
      }

      const liveData = await response.json()
      if (cancelledRef.current) return

      const matches = (liveData.matches as Match[] | undefined)?.filter((match) =>
        LIVE_STATUSES.has(match.status)
      ).sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()) || []

      setLiveMatches(matches)
      setLiveFeedNotice(null)
    } catch {
      if (!cancelledRef.current) {
        setLiveFeedNotice('Live feed is temporarily unavailable. Showing the latest cached update.')
      }
    }
  }

  const handleAskAI = async (match: Match) => {
    setSelectedMatchId(match.id)
    setAiLoading(true)
    setAiInsight(null)
    setAiError(null)

    try {
      const data = await getAIInsight(buildMatchInsightPrompt(match), matchInsightCacheKey(match))
      setAiInsight(data)
    } catch (error: unknown) {
      const previewError = error as { status?: number; message?: string } | null
      const errorMessage = previewError?.message?.trim() || 'Match insight failed. Please try again.'
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
      if (!cancelledRef.current) setLoading(false)
    }

    refresh()

    const interval = window.setInterval(() => {
      if (!document.hidden) syncLiveMatches(cancelledRef)
    }, 90_000)

    const handleVisibilityChange = () => {
      if (!document.hidden) syncLiveMatches(cancelledRef)
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

  if (loading) return <p className="loading">Loading...</p>

  return (
    <div className="home">
      {dataError ? (
        <p className="home-api-error" role="alert">
          {dataError}
        </p>
      ) : null}

      <div className="home-top">
        <div className="home-second">
          <div className="home-card slide-up delay-02">
            <div className="live-match-card__header">
              <h3 className="home-card__title">🔴 Live Matches</h3>
              <div className="live-match__pill-row">
                <span className="live-match__pill live-match__pill--live">LIVE TRACKER</span>
                <span className="live-match__pill live-match__pill--delay">Delayed feed</span>
              </div>
            </div>
            {liveFeedNotice ? <p className="live-match__status live-match__status--notice">{liveFeedNotice}</p> : null}
            {liveMatches.length > 0 ? (
              <div className="live-match-list">
                {liveMatches.map(match => (
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
                    <div className="next-match__teams">
                      <div className="next-match__team">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
                        <span>{match.homeTeam.shortName}</span>
                      </div>
                      <div className="next-match__middle">
                        <span className="live-match__score">
                          {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
                        </span>
                      </div>
                      <div className="next-match__team">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
                        <span>{match.awayTeam.shortName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No matches are live at the moment</p>
            )}
          </div>
        </div>

        <div className="home-second">
          <div className="home-card slide-up delay-02">
            <h3 className="home-card__title">📅 Upcoming Matches</h3>
            {upcomingMatches.length > 0 ? (
              <div className="next-match">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`next-match__item ${match.id === selectedMatchId ? 'next-match__item--active' : ''}`}
                  >
                    <div className="next-match__teams">
                      <div className="next-match__team">
                        <img src={match.homeTeam.crest} alt={match.homeTeam.name} width={24} height={24} />
                        <span>{match.homeTeam.shortName}</span>
                      </div>
                      <div className="next-match__middle">
                        <span className="next-match__vs">VS</span>
                      </div>
                      <div className="next-match__team">
                        <img src={match.awayTeam.crest} alt={match.awayTeam.name} width={24} height={24} />
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
                    <MatchInsightButton
                      loading={aiLoading && selectedMatchId === match.id}
                      disabled={aiLoading}
                      onClick={() => handleAskAI(match)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No upcoming matches</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="home-card slide-up delay-1">
        <h3 className="home-card__title">🏆 Knockout Matches</h3>
        <KnockoutBracket
          round32={knockoutRounds.round32}
          round16={knockoutRounds.round16}
          quarterFinals={knockoutRounds.quarterFinals}
          semiFinals={knockoutRounds.semiFinals}
          thirdPlace={knockoutRounds.thirdPlace}
          final={knockoutRounds.final}
        />
      </div>

      <div className="home-mid">
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
