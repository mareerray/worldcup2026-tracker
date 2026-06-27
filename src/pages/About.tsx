import '../styles/About.css'
import { useLanguage } from '../i18n/LanguageContext'

export default function About() {
    const { dict, t } = useLanguage()

    return (
        <div className="about">
            <div className="about-hero">
                <img
                    src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9af200ec22a572eac1b90fddbb57e1604d7efb8c.jpg"
                    alt={t('about.heroTitle')}
                    className="about-hero__img"
                />
                <h2>{t('about.heroTitle')}</h2>
                <p>{t('about.heroText')}</p>
            </div>

            <div className="about-grid">
                <div className="about-card">
                    <span className="about-card__icon">🗓️</span>
                    <h3>{t('about.tournamentDates')}</h3>
                    <p>{t('about.datesValue')}</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🌎</span>
                    <h3>{t('about.hostNations')}</h3>
                    <p>{t('about.hostValue')}</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🏟️</span>
                    <h3>{t('about.stadiums')}</h3>
                    <p>{t('about.stadiumsValue')}</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🌍</span>
                    <h3>{t('about.teams')}</h3>
                    <p>{t('about.teamsValue')}</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">⚽</span>
                    <h3>{t('about.format')}</h3>
                    <p>{t('about.formatValue')}</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🏆</span>
                    <h3>{t('about.defendingChampion')}</h3>
                    <p>{t('about.championValue')}</p>
                </div>
            </div>

            <div className="about-facts">
                <h3 className="about-facts__title">{t('about.didYouKnow')}</h3>
                <div className="about-facts__grid">
                    {dict.about.facts.map(({ emoji, fact }, i) => (
                        <div key={i} className="fact-card">
                            <span className="fact-card__emoji">{emoji}</span>
                            <p className="fact-card__text">{fact}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="about-links">
                <h3>{t('about.externalResources')}</h3>
                <div className="about-links__grid">
                    <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="about-link">
                        {t('about.linkFifa')}
                    </a>
                    <a href="https://www.bbc.com/sport/football/world-cup" target="_blank" rel="noopener noreferrer" className="about-link">
                        {t('about.linkBbc')}
                    </a>
                    <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" className="about-link">
                        {t('about.linkData')}
                    </a>
                </div>
            </div>
        </div>
    )
}
