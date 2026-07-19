import { ConfimationProps } from "../lib/types"
import Button from "./Button"

const ConfirmationModal = ({ text, buttons }: ConfimationProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
            <div className="panel relative w-[90%] max-w-md animate-fade-up p-8">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
                <h2 className="heading-display mb-8 text-center text-3xl">{text}</h2>
                <div className="flex items-center justify-center gap-x-4">
                    {
                        buttons.map((b, i) => (
                            <Button
                                key={i}
                                onClick={b.func}
                                classname={`w-40 ${i > 0 ? "!bg-none !bg-white/[0.04] border border-white/10 !text-cream/80 hover:!bg-white/[0.08]" : ""} ` + (b.className ?? "")}
                            >
                                {b.text}
                            </Button>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal
