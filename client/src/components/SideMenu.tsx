import { useState } from "react"
import { INIT_GAME } from "../constants/messages"
import Button from "./Button"
import DropDown from "./DropDown"

type SideMenuProps = {
    waiting: null | boolean,
    setName: (name: string) => void,
    started: boolean,
    name: string,
    setWaiting: (a: boolean) => void,
    socket: WebSocket
}


const SideMenu = ({ waiting, setName, started, name, setWaiting, socket }: SideMenuProps) => {

    const [time, setTime] = useState<string>("10 M");
    const options = ["10 M", "20 M", "30 M", "60 M"];


    return (

        waiting === null &&
        <div className="w-full flex items-center justify-center flex-col gap-y-3 h-[93vh] bg-zinc-900 relative">
            <p className="absolute top-0 py-4 font-bold text-7xl">Chess Arena</p>
            <div className="flex flex-col gap-y-2">
                <p className="text-xl font-sans font-semibold">Enter Your Name</p>
                <input type="text" className="text-white py-1.5 px-2 rounded-md bg-transparent outline-none border border-white" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-y-2">
            <p className="text-xl font-sans font-semibold">Select Duration</p>
                <DropDown selected={time} setSelected={setTime} options={options}/>
            </div>
            {!started && <Button disabled={name && name.length > 3 ? false : true} classname={`w-64 mt-4 font-bold ${name.length > 3 && 'shadow-green-800 shadow-2xl transform transition-transform hover:-translate-y-1 hover:scale-105'} `} onClick={() => {
                socket.send(JSON.stringify({
                    type: INIT_GAME,
                    name: name,
                    time:time
                }))
                setWaiting(true)
            }}>Play</Button>}

        </div>

    )
}

export default SideMenu