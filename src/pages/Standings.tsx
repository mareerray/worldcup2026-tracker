import { useEffect, useState } from 'react'
import { loadCsv } from '../lib/localData'
import type { GroupStandingRow } from '../types/db'
import type { Standing, TableEntry } from '../types'
import GroupTable from '../components/GroupTable'


export default function Standings() {
    const [standings, setStandings] = useState<Standing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        let ignore = false


        async function load() {
            try {
                const rows = await loadCsv<GroupStandingRow>(
                    'group-standings.csv'
                )


                if (ignore) return


                const byGroup = new Map<string, TableEntry[]>()


                for (const r of rows) {
                    const entry: TableEntry = {
                        position: Number(r.group_position),
                        team: {
                            id: Number(r.team_id),
                            name: r.team_name,
                            shortName: r.short_name ?? r.team_name,
                            tla: r.tla ?? '',
                            crest: r.crest_url ?? '',
                        },
                        playedGames: Number(r.played),
                        won: Number(r.won),
                        draw: Number(r.draw),
                        lost: Number(r.lost),
                        points: Number(r.points),
                        goalsFor: Number(r.goals_for),
                        goalsAgainst: Number(r.goals_against),
                        goalDifference: Number(r.goal_difference),
                    }


                    byGroup.set(
                        r.group_name,
                        [...(byGroup.get(r.group_name) ?? []), entry]
                    )
                }


                const groups: Standing[] = [...byGroup.entries()].map(
                    ([name, table]) => ({
                        group: name.replace('GROUP_', 'Group '),
                        table,
                    })
                )


                if (ignore) return


                setStandings(groups)
                setLoading(false)
            } catch (loadError) {
                console.error('Error loading standings:', loadError)


                if (ignore) return


                setError(
                    'Failed to load standings. Please try again.'
                )
                setLoading(false)
            }
        }


        load()


        return () => {
            ignore = true
        }
    }, [])


    if (loading) return <p className="loading">Loading standings...</p>
    if (error) return <p className="error-message">⚠️ {error}</p>


    return (
        <div>
            <div className="groups-grid">
                {standings.map((standing) => (
                    <GroupTable
                        key={standing.group}
                        standing={standing}
                    />
                ))}
            </div>
        </div>
    )
}