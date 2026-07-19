import { ButtonI } from "../lib/types"

const Button = ({ onClick, children, classname, disabled = false }: ButtonI) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-5 py-3 font-semibold text-ink-950 transition-all duration-200 hover:from-gold-300 hover:to-gold-500 hover:shadow-glow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none ` + classname}
        >
            {children}
        </button>
    )
}

export default Button
