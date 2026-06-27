import type { Standing } from '../types'
import { formatGroupName } from '../i18n'
import { useLanguage } from '../i18n/LanguageContext'

interface Props {
    standing: Standing
}

export default function GroupTable({ standing }: Props) {
    const { dict, t } = useLanguage()

    return (
        <div className="group-table">
            <h2>{formatGroupName(dict, standing.group)}</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>{t('table.team')}</th>
                        <th>{t('table.played')}</th>
                        <th>{t('table.won')}</th>
                        <th>{t('table.draw')}</th>
                        <th>{t('table.lost')}</th>
                        <th>{t('table.goalDiff')}</th>
                        <th>{t('table.points')}</th>
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
    )
}
