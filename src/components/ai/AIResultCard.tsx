import type { AIInsight } from '../../types/ai'
import { useLanguage } from '../../i18n/LanguageContext'

type Props = {
    insight: AIInsight | null
    loading: boolean
    error: string | null
    onClose: () => void
}

export default function AIResultCard({ insight, loading, error, onClose }: Props) {
    const { t } = useLanguage()

    if (!loading && !error && !insight) return null

    return (
        <div className="ai-result-card">
            <div className="ai-result-card__header">
                <div className="ai-result-card__heading">
                    <h3>{t('ai.matchInsight')}</h3>
                    <span className="ai-badge">AI</span>
                </div>
                <button
                    type="button"
                    className="ai-result-card__close"
                    onClick={onClose}
                    aria-label={t('ai.close')}
                >
                    ×
                </button>
            </div>

            <div className="ai-result-card__body">
                {loading && <p className="ai-result-card__loading">{t('ai.generating')}</p>}
                {error && <p className="ai-result-card__error">{error}</p>}
                {insight && !loading && !error && (
                    <>
                        <p className="ai-result-card__title">{insight.title}</p>
                        <p className="ai-result-card__text">{insight.summary}</p>
                        <p className="ai-result-card__key">
                            <span className="ai-result-card__key-label">{t('ai.keyFactor')}</span>
                            {insight.keyFactor}
                        </p>
                        <p className="ai-result-card__disclaimer">{t('ai.disclaimer')}</p>
                    </>
                )}
            </div>
        </div>
    )
}
