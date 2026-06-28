import type { Standing } from "../types";

interface Props {
    standing: Standing;
}

export default function GroupTable({ standing }: Props) {
        return (
        <div className="group-table">
            <h2>{standing.group}</h2>
            <h1>{`COMPLETED`}</h1>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GD</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standing.table.map((entry) => (
                        <tr key={entry.team.id}>
                            <td>{entry.position}</td>
                            <td>
                                <img
                                    src={entry.team.crest}
                                    alt={entry.team.name}
                                    width={20}
                                    height={20}
                                />
                                {entry.team.shortName}
                            </td>
                            <td>{entry.playedGames}</td>
                            <td>{entry.won}</td>
                            <td>{entry.draw}</td>
                            <td>{entry.lost}</td>
                            <td>{entry.goalDifference}</td>
                            <td>
                                <strong>{entry.points}</strong>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
