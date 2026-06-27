import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFootballJson } from '../api/football'
import '../styles/SearchBar.css'

type Team = {
    id: number
    name: string
    shortName: string
    crest: string
}

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [teams, setTeams] = useState<Team[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchFootballJson<{ teams?: Team[] }>('/competitions/WC/teams')
            .then(data => setTeams(data.teams || []))
            .catch(() => setTeams([]))
    }, [])

    const filtered = useMemo(() => {
        if (!query.trim()) return []
        const q = query.toLowerCase()
        return teams
            .filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.shortName.toLowerCase().includes(q)
            )
            .slice(0, 5)
    }, [query, teams])

    const handleSelect = (team: Team) => {
        setQuery('')
        navigate(`/team/${team.id}`)
    }

    return (
        <div className="search-bar">
            <input
                type="text"
                className="search-bar__input"
                placeholder="Search for a team..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            {filtered.length > 0 && (
                <ul className="search-bar__dropdown">
                    {filtered.map(team => (
                        <li
                            key={team.id}
                            className="search-bar__item"
                            onClick={() => handleSelect(team)}
                        >
                            <img src={team.crest} alt={team.name} width={20} height={20} />
                            {team.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}