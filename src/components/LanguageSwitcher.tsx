import { LANGUAGES } from '../i18n'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/LanguageSwitcher.css'

export default function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="language-switcher">
            <label className="language-switcher__label" htmlFor="language-select">
                {t('language.label')}
            </label>
            <select
                id="language-select"
                className="language-switcher__select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                aria-label={t('language.label')}
            >
                {LANGUAGES.map(({ code, label }) => (
                    <option key={code} value={code}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    )
}
