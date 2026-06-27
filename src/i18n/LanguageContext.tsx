import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
    LOCALE_MAP,
    TIMEZONE_LABEL_MAP,
    TIMEZONE_MAP,
    loadStoredLanguage,
    saveLanguage,
    translate,
    translations,
    type Language,
    type TranslationDict,
} from './index'

type LanguageContextValue = {
    language: Language
    setLanguage: (language: Language) => void
    dict: TranslationDict
    t: (path: string, params?: Record<string, string | number>) => string
    locale: string
    timeZone: string
    timeZoneLabel: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(loadStoredLanguage)

    const setLanguage = useCallback((next: Language) => {
        setLanguageState(next)
        saveLanguage(next)
    }, [])

    const dict = translations[language]
    const locale = LOCALE_MAP[language]
    const timeZone = TIMEZONE_MAP[language]
    const timeZoneLabel = TIMEZONE_LABEL_MAP[language]

    const t = useCallback(
        (path: string, params?: Record<string, string | number>) => translate(dict, path, params),
        [dict]
    )

    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    const value = useMemo(
        () => ({ language, setLanguage, dict, t, locale, timeZone, timeZoneLabel }),
        [language, setLanguage, dict, t, locale, timeZone, timeZoneLabel]
    )

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}

export { LanguageContext }
