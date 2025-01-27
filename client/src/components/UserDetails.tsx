import Timer from "./Timer"

type UserDetailsProps = {name: string ,time:number, setTime:any,color:string,currentTurn:string | null}

const UserDetails = ({ name  ,time,setTime,color,currentTurn}:UserDetailsProps) => {
    return (

        <div className="flex flex-row items-center gap-x-5 w-full bg-zinc-700 text-white p-2">
            <img src="/user.png" alt="" className="w-10 h-10 bg-white rounded-full border border-white" />
            <p className="font-serif font-semibold text-xl">{name}</p>
            <Timer time={time} setTime={setTime} color={color} currentTurn={currentTurn}/>
        </div>

    )
}

export default UserDetails