import { PieceSymbol } from 'chess.js'
import { PromotionProps } from '../lib/types'

const PromotionModal = ({ myColor, handlePromotion }: PromotionProps) => {
    return (
        <div className={`absolute inset-0 z-20 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm ${myColor === 'black' ? "rotate-180" : ""}`}>
            <div className="panel p-6">
                <p className="mb-4 text-center text-sm font-medium uppercase tracking-[0.18em] text-cream/60">Promote to</p>
                <div className="flex gap-3">
                    {['q', 'r', 'b', 'n'].map((piece) => (
                        <button
                            key={piece}
                            className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition-all hover:border-gold-500/50 hover:bg-gold-500/15 hover:shadow-glow-sm"
                            onClick={() => handlePromotion(piece as PieceSymbol)}
                        >
                            <img src={`/${myColor === "black" ? piece : piece.toUpperCase() + " copy"}.png`} alt={piece} className="h-11 w-11 object-contain drop-shadow" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PromotionModal
