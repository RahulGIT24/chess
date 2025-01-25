import React from "react"

const Button = ({onClick,children,classname,disabled=false}:{onClick:()=>void,children:React.ReactNode,classname?:string,disabled?:boolean}) => {
    return (
        <button onClick={onClick} disabled={disabled} className={`bg-green-700 p-3 rounded-lg hover:bg-green-500 text-white `+classname}>
            {children}
        </button>
    )
}

export default Button