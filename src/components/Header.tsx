import { NavLink } from 'react-router-dom'

interface Props {
    matchday: number | null
}

export default function Header({ matchday }: Props) {
    return (
        <header className="header">
            <div className="header__left">
                <img
                    src="/images/trionda-ball.jpg"
                    alt="FIFA World Cup 2026 Ball"
                    className="header__ball"
                />
                {/* <span className="header__trophy">🏆</span> */}
                <div>
                    <h1>FIFA World Cup 2026</h1>
                    <p className="header__sub">USA · Canada · Mexico · 11 Jun – 19 Jul</p>
                </div>
            </div>

            <nav className="header__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                <NavLink to="/standings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Standings</NavLink>
                <NavLink to="/results" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Results</NavLink>
                <NavLink to="/fixtures" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Fixtures</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About</NavLink>
            </nav>

            {matchday && (
                <div className="header__matchday">
                    Matchday <strong>{matchday}</strong>
                </div>
            )}
        </header>
    )
}
// interface Props {
//     matchday: number | null
// }

// export default function Header({ matchday }: Props) {
//     return (
//         <header className="header">
//             <div className="header__logo">
//                 <span className="header__trophy">🏆</span>
//                 <div>
//                     <h1>FIFA World Cup 2026</h1>
//                     <p className="header__sub">USA · Canada · Mexico</p>
//                 </div>
//             </div>
//             {matchday && (
//                 <div className="header__matchday">
//                     Matchday <strong>{matchday}</strong>
//                 </div>
//             )}
//         </header>
//     )
// }