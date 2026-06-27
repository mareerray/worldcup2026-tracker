import { useLanguage } from '../../i18n/LanguageContext'

type Props = {
    loading: boolean
    disabled?: boolean
    onClick: () => void
}

export default function MatchInsightButton({ loading, disabled, onClick }: Props) {
    const { t } = useLanguage()

    return (
        <button
            type="button"
            className="preview-action"
            onClick={onClick}
            disabled={disabled}
            aria-busy={loading}
            aria-label={t('ai.getInsight')}
        >
            {loading ? (
                <span className="preview-action__spinner" aria-hidden="true" />
            ) : (
                <svg
                    className="preview-action__icon"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M8 1.2l.9 2.8h2.9L9.4 6.4l.9 2.8L8 7.6 5.7 9.2l.9-2.8L4.2 4h2.9L8 1.2z"
                        fill="currentColor"
                    />
                    <circle cx="12.5" cy="3.5" r="0.9" fill="currentColor" opacity="0.7" />
                    <circle cx="3.2" cy="11.8" r="0.7" fill="currentColor" opacity="0.55" />
                </svg>
            )}
            <span className="preview-action__label">
                {loading ? '…' : t('ai.matchInsight')}
            </span>
            {!loading ? <span className="ai-badge" aria-hidden="true">AI</span> : null}
        </button>
    )
}
