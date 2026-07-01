import { useEffect, useState } from 'react'
import type { Standing } from '../types'
import GroupTable from '../components/GroupTable'

export default function Standings() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false // flag to detect if this effect is stale

        fetch(`/api/football/competitions/WC/standings`, {
            headers: { 'X-Auth-Token': import.meta.env.VITE_API_KEY },
            signal: AbortSignal.timeout(10000) // 10 seconds timeout
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`)
                }
                return res.json()
            })
            .then(json => {
                if (ignore) return // if this effect is stale, do nothing
                setStandings(json.standings || [])
                setLoading(false)
            })
            .catch(err => {
                if (ignore) return
                console.error('Error fetching standings:', err)
                if (err.name === 'TimeoutError') {
                    setError('Request timed out. Check your connection and try again.')
                } else if (err.message.includes('429')) {
                    setError('Too many requests — please wait a minute and refresh.')
                } else {
                    setError('Failed to load standings. Please try again.')
                }
                setLoading(false)
            })
        return () => { ignore = true } // cleanup function to mark this effect as stale
    }, [])

    if (loading) return <p className="loading">Loading standings...</p>
    if (error) return <p className="error-message">⚠️ {error}</p>

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