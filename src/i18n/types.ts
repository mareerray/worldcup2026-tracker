export type Language = 'en' | 'th' | 'fi'

export type AboutFact = {
    emoji: string
    fact: string
}

export type SlideTranslation = {
    caption: string
}

export type TranslationDict = {
    nav: {
        home: string
        standings: string
        results: string
        fixtures: string
        about: string
    }
    header: {
        title: string
        subtitle: string
        ballAlt: string
    }
    language: {
        label: string
    }
    common: {
        loading: string
        liveBadge: string
        vs: string
        vsLower: string
        matchday: string
        group: string
        noData: string
        notAvailable: string
    }
    table: {
        team: string
        played: string
        won: string
        draw: string
        lost: string
        goalDiff: string
        points: string
    }
    home: {
        groupLeaders: string
        liveMatch: string
        liveRefresh: string
        updatedAt: string
        refreshingLive: string
        liveTracker: string
        delayedFeed: string
        noLiveMatch: string
        upcomingMatches: string
        noUpcomingMatches: string
        tournamentProgress: string
        groupStage: string
        playedOf: string
        matchesRemaining: string
        worldCupCarousel: string
        topScorers: string
        latestResults: string
    }
    standings: {
        loading: string
    }
    results: {
        loading: string
        matchday: string
    }
    fixtures: {
        loading: string
        matchdayShort: string
    }
    about: {
        heroTitle: string
        heroText: string
        tournamentDates: string
        hostNations: string
        stadiums: string
        teams: string
        format: string
        defendingChampion: string
        datesValue: string
        hostValue: string
        stadiumsValue: string
        teamsValue: string
        formatValue: string
        championValue: string
        didYouKnow: string
        externalResources: string
        linkFifa: string
        linkBbc: string
        linkData: string
        facts: AboutFact[]
    }
    team: {
        loading: string
        notFound: string
        upcomingMatch: string
        recentResults: string
        scorers: string
        noScorers: string
        coach: string
        nationality: string
        born: string
        squad: string
    }
    formation: {
        title: string
        subtitle: string
    }
    footer: {
        builtBy: string
    }
    search: {
        placeholder: string
    }
    ai: {
        matchInsight: string
        getInsight: string
        generating: string
        keyFactor: string
        disclaimer: string
        close: string
        failed: string
    }
    errors: {
        loadData: string
        liveRateLimited: string
        liveUnavailable: string
        somethingWrong: string
    }
    slides: SlideTranslation[]
}

export const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'th', label: 'ไทย' },
    { code: 'fi', label: 'Suomi' },
]

export const LOCALE_MAP: Record<Language, string> = {
    en: 'en-GB',
    th: 'th-TH',
    fi: 'fi-FI',
}

export const TIMEZONE_MAP: Record<Language, string> = {
    en: 'Europe/Helsinki',
    th: 'Asia/Bangkok',
    fi: 'Europe/Helsinki',
}

export const TIMEZONE_LABEL_MAP: Record<Language, string> = {
    en: 'EEST',
    th: 'ICT',
    fi: 'EEST',
}

const STORAGE_KEY = 'wc2026-language'

export function loadStoredLanguage(): Language {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'en' || stored === 'th' || stored === 'fi') return stored
    } catch {
        // ignore
    }
    return 'en'
}

export function saveLanguage(language: Language): void {
    try {
        localStorage.setItem(STORAGE_KEY, language)
    } catch {
        // ignore
    }
}
