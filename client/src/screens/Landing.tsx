import { useNavigate } from "react-router-dom"
import Button from "../components/Button"
import GoogleAuth from "../components/GoogleAuth"
import { useAuth } from "../hooks/useAuth"

const Landing = () => {
    const navigate = useNavigate()
    const [user,authenticated] = useAuth()

    if(authenticated){
        navigate("/game")
    }

    return (
        <div className="h-screen w-full flex justify-center items-center bg-zinc-800">
            <div>
                <div className="grid md:grid-cols-2 gap-4 sm:grid-cols-1">
                    <div>
                        <img src="/chess.png" />
                    </div>
                    <div className="flex justify-center items-center flex-col">
                        <h1 className="text-5xl text-center font-bold text-white mb-14">Play Chess Online</h1>
                        <div className="mt-4 flex justify-center items-center flex-col gap-y-4">
                            <Button onClick={()=>{navigate("/game")}} classname="w-full">
                                Play Online
                            </Button>
                            <p className="text-white">OR</p>
                            <GoogleAuth/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing