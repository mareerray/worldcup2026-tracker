import { useEffect, useState } from 'react'
import type { Standing } from '../types'
import GroupTable from '../components/GroupTable'

export default function Standings() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [loading, setLoading] = useState(true)

    const API_BASE = 'https://api.football-data.org/v4'

    useEffect(() => {
        fetch(`${API_BASE}/competitions/WC/standings`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(r => r.json())
            .then(data => setStandings(data.standings || []))
            .catch(err => console.error('Standings error:', err))
            .finally(() => setLoading(false))
    }, [])
    if (loading) return <p className="loading">Loading standings...</p>

    return (
        <div>
            <div className="groups-grid">
                {standings.map((standing) => (
                    <GroupTable key={standing.group} standing={standing} />
                ))}
            </div>
        </div>
    )
}