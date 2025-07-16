import { Flag, Handshake, Loader2 } from "lucide-react";
import { useState } from "react";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../lib/apiCall";
import toast from "react-hot-toast";
import { GET } from "../constants/methods";
import Button from "./Button";
import DropDown from "./DropDown";
import { INIT_GAME } from "../constants/messages";
import { MoveHistoryComponent } from "../lib/types";

const MoveHistory = ({ moveHistory, offerDraw, onResign, waiting, gameStarted, setWaiting, socket, viewGame }: MoveHistoryComponent) => {

    const [time, setTime] = useState<string>("10 M");
    const options = ["1 M", "10 M", "20 M", "30 M", "60 M"];

    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.user);
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
        <>
            <p className="text-white font-semibold text-center text-2xl mb-4">{gameStarted ? "Move History" : "Chess Arena"}</p>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {
                    moveHistory.map((_: any, index: number) => {
                        if (index % 2 !== 0) return null;
                        return (
                            <div key={index} className="flex justify-between items-center text-white font-medium">
                                <p className="text-gray-400">{index / 2 + 1}.</p>
                                <p className="bg-white text-black px-2 py-1 rounded-md">{moveHistory[index]}</p>
                                <p className="bg-black text-white px-2 py-1 rounded-md">
                                    {moveHistory[index + 1] ?? ""}
                                </p>
                            </div>
                        );
                    })
                }
            </div>
            {
                !viewGame &&
                <>
                    {
                        !waiting && !gameStarted &&
                        <div className="h-full w-full flex justify-center flex-col items-center">
                            <div className="flex w-full flex-col gap-y-2 top-60">
                                <p className=" text-xl font-sans font-semibold">Select Duration</p>
                                <DropDown classname="w-full" selected={time} setSelected={setTime} options={options} />
                            </div>
                            <Button disabled={user?.name && user?.name.length > 3 ? false : true} classname={`mt-4 font-bold w-full py-4 text-4xl ${user?.name && user?.name?.length > 3 && 'shadow-green-800 shadow-2xl transform transition-transform hover:-translate-y-1 hover:scale-105 '} `} onClick={() => {
                                socket?.send(JSON.stringify({
                                    type: INIT_GAME,
                                    name: user?.name,
                                    time: time,
                                    id: user?.id,
                                    profilePicture: user?.profilePicture
                                }))
                                if (setWaiting)
                                    setWaiting(true)
                            }}>Play</Button>
                        </div>
                    }
                    {
                        waiting && <div className="h-full w-full gap-y-4 flex justify-center flex-col items-center">
                            <Loader2 className="animate-spin" size={40} />
                            <p>Searching For Players....</p>
                        </div>
                    }
                    {/* Buttons */}
                    {
                        gameStarted &&
                        <div className="mt-4 flex justify-between gap-4">
                            <button
                                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md w-full justify-center transition"
                                onClick={offerDraw}
                            >
                                <Handshake size={18} />
                                Offer Draw
                            </button>
                            <button
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md w-full justify-center transition"
                                onClick={onResign}
                            >
                                <Flag size={18} />
                                Resign
                            </button>
                        </div>
                    }
                    <div className="flex  flex-col gap-y-4">
                        {
                            gameStarted === false &&
                            <Button onClick={() => { navigate("/mygames") }} classname="w-full">Game History</Button>

                        }
                        {
                            gameStarted === false &&
                            <Button onClick={() => { logout() }} classname="w-full bg-transparent border border-green-700">Log Out</Button>

                        }
                    </div>
                </>
            }
        </>
    )
}

export default MoveHistory