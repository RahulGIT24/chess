import { Loader2 } from "lucide-react";

const ReconnectingModal = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
            <div className="panel flex w-[90%] max-w-md animate-fade-up flex-col items-center justify-center gap-4 p-10">
                <span className="relative flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/20" />
                    <Loader2 className="h-7 w-7 animate-spin text-gold-400" />
                </span>
                <h2 className="heading-display text-2xl text-cream">Reconnecting to game…</h2>
                <p className="text-sm text-cream/50">Hold tight — your clock is safe.</p>
            </div>
        </div>
    );
};

export default ReconnectingModal;
