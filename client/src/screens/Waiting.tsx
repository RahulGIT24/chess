const Waiting = ({ waiting }: { waiting: boolean | null }) => {
    return (
        <div>
            {waiting === true && (
                <div className="flex w-full flex-col items-center justify-center gap-y-5">
                    <img src="/waiting.gif" alt="waiting" className="rounded-2xl border border-white/10" />
                    <p className="heading-display text-2xl text-cream">Finding players…</p>
                </div>
            )}
        </div>
    )
}

export default Waiting
