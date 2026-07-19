import { NavLink } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                🏠 Home
            </NavLink>
            <NavLink to="/standings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                📊 Standings
            </NavLink>
            <NavLink to="/results" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                ✅ Results
            </NavLink>
            {/* <NavLink to="/fixtures" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                📅 Fixtures
            </NavLink> */}
            <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                ℹ️ About
            </NavLink>
        </nav>
    )
}