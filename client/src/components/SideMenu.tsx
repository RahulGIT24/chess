import { useState } from "react"
import { INIT_GAME } from "../constants/messages"
import Button from "./Button"
import DropDown from "./DropDown"
import { apiCall } from "../lib/apiCall"
import { GET } from "../constants/methods"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

type SideMenuProps = {
    waiting: null | boolean,
    setName: (name: string) => void,
    started: boolean,
    // name: string,
    setWaiting: (a: boolean) => void,
    socket: WebSocket
}

const SideMenu = ({ waiting, started, setWaiting, socket }: SideMenuProps) => {

    const [time, setTime] = useState<string>("10 M");
    const options = ["10 M", "20 M", "30 M", "60 M"];

    const { user } = useSelector((state: RootState) => state.user);

    const name = user?.name

    const navigate = useNavigate();

    const logout = async () => {
        try {
            const res = await apiCall({ data: {}, url: "/auth/logout", method: GET })
            toast.success(res.message)
            navigate("/")
            return;
        } catch (error) {
            return error
        }
    }

    return (
        waiting === null &&
        <div className="w-full flex items-center justify-center flex-col gap-y-3 h-[93vh] bg-zinc-900 relative">
            <p className="absolute top-0 py-4 font-bold text-7xl">Chess Arena</p>
            {/* <div className="flex flex-col gap-y-2">
                <p className="text-xl font-sans font-semibold">Enter Your Name</p>
                <input type="text" className="text-white py-1.5 px-2 rounded-md bg-transparent outline-none border border-white" onChange={(e) => setName(e.target.value)} />
            </div> */}
            <div className="flex flex-col gap-y-2 absolute top-60">
                <p className="w-full text-xl font-sans font-semibold">Select Duration</p>
                <DropDown classname="w-[30vw]" selected={time} setSelected={setTime} options={options} />
            </div>
            {!started && <Button disabled={name && name.length > 3 ? false : true} classname={`w-64 mt-4 font-bold ${name && name?.length > 3 && 'shadow-green-800 shadow-2xl transform transition-transform hover:-translate-y-1 hover:scale-105 w-[30vw] py-4 text-4xl'} `} onClick={() => {
                socket.send(JSON.stringify({
                    type: INIT_GAME,
                    name: name,
                    time: time
                }))
                setWaiting(true)
            }}>Play</Button>}
            <div className="absolute bottom-0 w-full">
                <Button onClick={() => { logout() }} classname="w-full">Log Out</Button>
            </div>
        </div>
    )
}

export default SideMenu