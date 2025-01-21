import { useNavigate } from "react-router-dom"
import Button from "../components/Button"

const Landing = () => {
    const navigate = useNavigate()
    return (
        <div className="h-screen w-full flex justify-center items-center bg-zinc-800">
            <div>
                <div className="grid md:grid-cols-2 gap-4 sm:grid-cols-1">
                    <div>
                        <img src="/chess.png" />
                    </div>
                    <div className="flex justify-center items-center flex-col">
                        <h1 className="text-4xl text-center font-bold text-white">Play Chess Online</h1>
                        <div className="mt-4 flex justify-center items-center">
                            <Button onClick={()=>{navigate("/game")}}>
                                Play Online
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing