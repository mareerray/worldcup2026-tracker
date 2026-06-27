import { NavLink } from 'react-router-dom'
import SearchBar from './SearchBar'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'

export default function Header() {
    const { t } = useLanguage()

    return (
        <header className="header">
            <div className="header__top">
                <div className="header__left">
                    <img
                        src="/images/trionda-ball.jpg"
                        alt={t('header.ballAlt')}
                        className="header__ball"
                    />
                    <div>
                        <h1>{t('header.title')}</h1>
                        <p className="header__sub">{t('header.subtitle')}</p>
                    </div>
                </div>

                <SearchBar />
                <LanguageSwitcher />
            </div>

            <nav className="header__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.home')}</NavLink>
                <NavLink to="/standings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.standings')}</NavLink>
                <NavLink to="/results" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.results')}</NavLink>
                <NavLink to="/fixtures" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.fixtures')}</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.about')}</NavLink>
            </nav>
        </header>
    )
}
