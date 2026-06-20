import '../styles/About.css';

export default function About() {
    return (
        <div className="about">

            <div className="about-hero">
                <img
                    src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9af200ec22a572eac1b90fddbb57e1604d7efb8c.jpg"
                    alt="FIFA World Cup 2026 Logo"
                    className="about-hero__img"
                />
                <h2>FIFA World Cup 2026</h2>
                <p>The 23rd edition of the FIFA World Cup, hosted across the United States, Canada, and Mexico.</p>
            </div>

            <div className="about-grid">

                <div className="about-card">
                    <span className="about-card__icon">🗓️</span>
                    <h3>Tournament Dates</h3>
                    <p>11 June – 19 July 2026</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🌎</span>
                    <h3>Host Nations</h3>
                    <p>United States, Canada & Mexico</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🏟️</span>
                    <h3>Stadiums</h3>
                    <p>16 venues across 3 countries</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🌍</span>
                    <h3>Teams</h3>
                    <p>48 nations competing for the first time in this expanded format</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">⚽</span>
                    <h3>Format</h3>
                    <p>12 groups of 4 teams, top 2 + 8 best 3rd place teams advance</p>
                </div>

                <div className="about-card">
                    <span className="about-card__icon">🏆</span>
                    <h3>Defending Champion</h3>
                    <p>Argentina (winners of Qatar 2022)</p>
                </div>

            </div>

            <div className="about-facts">
                <h3 className="about-facts__title">⚡ Did You Know?</h3>
                <div className="about-facts__grid">
                    {[
                        {
                            emoji: "🏆",
                            fact: "Brazil holds the record for most World Cup wins with 5 titles."
                        },
                        {
                            emoji: "⚽",
                            fact: "This is the first World Cup with 48 teams — up from 32 in previous editions."
                        },
                        {
                            emoji: "📏",
                            fact: "The 2026 World Cup will be the largest ever, with 104 matches played in total."
                        },
                        {
                            emoji: "🌎",
                            fact: "It's only the second time 3 nations co-host the World Cup — the first was 2002 (Japan & South Korea)."
                        },
                        {
                            emoji: "🥇",
                            fact: "Argentina are the reigning champions, having beaten France in a penalty shootout in Qatar 2022."
                        },
                        {
                            emoji: "👟",
                            fact: "Just Fontaine holds the record for most goals in a single World Cup — 13 goals in 1958."
                        },
                    ].map(({ emoji, fact }, i) => (
                        <div key={i} className="fact-card">
                            <span className="fact-card__emoji">{emoji}</span>
                            <p className="fact-card__text">{fact}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="about-links">
                <h3>External Resources</h3>
                <div className="about-links__grid">
                    <a href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener noreferrer" className="about-link">
                        🌐 Official FIFA Website
                    </a>
                    <a href="https://www.bbc.com/sport/football/world-cup" target="_blank" rel="noopener noreferrer" className="about-link">
                        📰 BBC Sport Coverage
                    </a>
                    <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" className="about-link">
                        🔌 Data powered by football-data.org
                    </a>
                </div>
            </div>

        </div>
    )
}