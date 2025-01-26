import { useEffect, useState } from "react"
import Button from "../components/Button"
import ChessBoard from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js"

export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const ERROR = "error"

const UserDetails = ({ name }: { name: string }) => {
    return (
        <div className="flex flex-row items-center gap-x-5 w-full bg-zinc-700 text-white p-2">
            <img src="/user.png" alt="" className="w-12 h-12 bg-white rounded-full border border-white" />
            <p className="font-serif font-semibold text-xl">{name}</p>
        </div>
    )
}

const Game = () => {
    const socket = useSocket()
    const [chess, setChess] = useState(new Chess())
    const [board, setBoard] = useState(chess.board())
    const [started, setStarted] = useState(false)
    const [name, setName] = useState("");
    const [waiting, setWaiting] = useState<null | boolean>(null);
    const [opponentName, setOpponentName] = useState("");
    const [opponentColor, setOpponentColor] = useState("");
    const [myColor, setMyColor] = useState("")

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data as string);

            switch (message.type) {
                case INIT_GAME:
                    const name = message.payload.name
                    const color = message.payload.color;
                    setWaiting(false);
                    setBoard(chess.board())
                    setStarted(true);
                    setOpponentName(name)
                    setOpponentColor(color);
                    if (color == "white") {
                        setMyColor("black")
                    } else {
                        setMyColor("white")
                    }
                    break;
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board())
                    break;
                case GAME_OVER:
                    console.log("Game over")
                    break;

                default:
                    break;
            }
        }

    }, [socket])

    if (!socket) return <div>Connecting......</div>
    return (
        <div className="h-screen w-full bg-zinc-800 text-white">
            <div className="justify-center flex">
                <div className="pt-8 w-full flex justify-center items-center">
                    <div className="flex justify-center items-center w-full">
                        <div className="flex justify-center items-start flex-col px-12">
                            <UserDetails name={opponentName ? opponentName : "Opponent"} />
                            <ChessBoard setBoard={setBoard} chess={chess} board={board} socket={socket} myColor={myColor} />
                            <UserDetails name={name ? name : "Your Name"} />
                        </div>
                        {
                            waiting === null &&
                            <div className="w-full flex justify-center items-center flex-col gap-y-3">
                                <div className="flex flex-col gap-y-2">
                                    <p className="text-xl font-sans font-semibold">Enter Your Name</p>
                                    <input type="text" className="text-white py-1.5 px-2 rounded-md bg-transparent outline-none border border-white" onChange={(e) => setName(e.target.value)} />
                                </div>
                                {!started && <Button disabled={name && name.length > 3 ? false : true} classname="w-60 font-bold" onClick={() => {
                                    socket.send(JSON.stringify({
                                        type: INIT_GAME,
                                        name: name
                                    }))
                                    setWaiting(true)
                                }}>Play</Button>}
                            </div>
                        }
                        {
                            waiting &&
                            <div className="w-full flex justify-center items-center flex-col gap-y-5">
                                <img src="/waiting.gif" alt="waiting" />
                                <p className="font-bold text-2xl">Finding Players......</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game