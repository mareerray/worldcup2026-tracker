import '../styles/Footer.css'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer__inner">
                <p className="footer__copy">
                    © {year} FIFA World Cup 2026 Tracker
                </p>

                <div className="footer__dev">
                    <span>Built by</span>
                    <a href="https://mayuree-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="footer__link">
                        Mayuree Reunsati
                    </a>
                    <div className="footer__socials">
                        <a href="https://github.com/mareerray" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
                            <GitHubIcon fontSize="small" />
                        </a>
                        <a href="https://www.linkedin.com/in/mayuree-reunsati" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="LinkedIn">
                            <LinkedInIcon fontSize="small" />
                        </a>
                    </div>
                </div>

                <p className="footer__credit">
                    Data by <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" className="footer__link">football-data.org</a>
                </p>
            </div>
        </footer>
    )
}