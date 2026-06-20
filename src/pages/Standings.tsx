import { useEffect, useState } from 'react'
import type { Standing } from '../types'
import GroupTable from '../components/GroupTable'

export default function Standings() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/v4/competitions/WC/standings', {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY }
        })
            .then(res => res.json())
            .then(json => {
                setStandings(json.standings)
                setLoading(false)
            })
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