import Button from "./Button"
import Timer from "./Timer"

type UserDetailsProps = { 
    name: string, time: number, setTime: any, color: string, myTurn:boolean,currentTurn: string | null,onResign?:any,offerDraw?:any,
    socket?:WebSocket
}

const UserDetails = ({ name, time, setTime, color, currentTurn,onResign,offerDraw ,myTurn,socket}: UserDetailsProps) => {
    return (

        <div className="flex flex-row items-center justify-between gap-x-5 w-full bg-zinc-700 text-white p-2">
            <div className="flex items-center gap-x-5">
                <img src="/user.png" alt="" className="w-10 h-10 bg-white rounded-full border border-white" />
                <p className="font-serif font-semibold text-xl">{name}</p>
                <Timer time={time} setTime={setTime} color={color} currentTurn={currentTurn} myTurn ={myTurn} socket={socket}/>
            </div>
            <div>
                {
                    offerDraw &&
                    <Button onClick={offerDraw} classname="mx-4">Offer Draw</Button>
                }
                {
                    onResign &&
                    <Button onClick={onResign}>Resign</Button>
                }
            </div>
        </div>

    )
}

export default UserDetails