import React from "react"

const Button = ({onClick,children,classname}:{onClick:()=>void,children:React.ReactNode,classname?:string}) => {
    return (
        <button onClick={onClick} className={`bg-green-700 p-3 rounded-lg hover:bg-green-500 text-white `+classname}>
            {children}
        </button>
    )
}

export default Button