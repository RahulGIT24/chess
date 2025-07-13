import { ButtonI } from "../lib/types"

const Button = ({onClick,children,classname,disabled=false}:ButtonI) => {
    return (
        <button onClick={onClick} disabled={disabled} className={`bg-green-700 p-3 rounded-lg hover:bg-green-500 text-white `+classname}>
            {children}
        </button>
    )
}

export default Button