type Props = {
    onClick: () => void
}

export default function AIFloatingButton({ onClick }: Props) {
    return (
        <button className="ai-fab" onClick={onClick} aria-label="Ask AI">
            🤖
        </button>
    )
}