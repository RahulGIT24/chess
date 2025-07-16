import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { apiCall } from "../lib/apiCall"
import { GET } from "../constants/methods"
import toast from "react-hot-toast"
import { Chess } from "chess.js"
import ChessBoard from "../components/ChessBoard"
import { useAuth } from "../hooks/useAuth"
import { Game } from "../lib/types"
import MoveHistory from "../components/MoveHistory"
import { useSoundEffects } from "../hooks/useSoundEffects"
import { Loader2 } from "lucide-react"

const ViewGame = () => {
    const params = useParams()
    const navigate = useNavigate()
    const [user] = useAuth();
    const [color, setColor] = useState<"white" | "black">("white")
    const [loading, setLoading] = useState(false)
    const [game, setGame] = useState<Game>()
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(1000)

    const chessRef = useRef<Chess>(new Chess())
    const [board, setBoard] = useState(chessRef.current.board())
    const movesRef = useRef<any[]>([])
    const moveIndexRef = useRef(0)
    const intervalRef = useRef<any>(null)

    const {
        move: pieceMove, capture, gameend, gamestart
    } = useSoundEffects();

    const getGame = async (gameId: string) => {
        try {
            setLoading(true)
            const res = await apiCall({
                url: `/game?gameId=${gameId}`,
                method: GET
            })
            chessRef.current.load(res.data.fen)
            setBoard(chessRef.current.board())
            setGame(res.data)

            if (user && typeof user !== "boolean") {
                setColor(res.data.whiteId === user.id ? "white" : "black")
            }

            const moves: { from: string; to: string; promotion?: string }[] =
                JSON.parse(res.data.moveHistory) || [];
            movesRef.current = moves;
            moveIndexRef.current = 0;
            gamestart()
        } catch (error: any) {
            if (error.status === 404) {
                toast.error("Game not found")
                navigate("/")
            }
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const playMoves = () => {
        if (intervalRef.current) return;
        setIsPlaying(true)
        intervalRef.current = setInterval(() => {
            const move = movesRef.current[moveIndexRef.current];
            const moveRes = chessRef.current.move(move);
            setBoard(chessRef.current.board());
            moveIndexRef.current += 1;
            if (moveIndexRef.current >= movesRef.current.length) {
                gameend()
                clearInterval(intervalRef.current!)
                intervalRef.current = null
                setIsPlaying(false)
                return;
            }
            if (moveRes.captured) {
                capture()
            } else {
                pieceMove()
            }
        }, speed);
    }

    const pauseMoves = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsPlaying(false);
        }
    }

    const resetMoves = () => {
        pauseMoves();
        chessRef.current.reset();
        setBoard(chessRef.current.board());
        moveIndexRef.current = 0;
    }

    useEffect(() => {
        if (!params.id) {
            navigate("/game")
        }
        getGame(params.id as string)
        return pauseMoves;
    }, [params, params.id, user])

    if (loading || !game) return <div className="bg-zinc-800 w-full h-screen flex justify-center items-center flex-col gap-y-3">
        <Loader2 className="animate-spin" size={90} color="green" />
        <p className="text-3xl font-semibold text-white">Loading Game...</p>
    </div>;

    return (
        <div className="p-4 bg-zinc-900 min-h-screen text-white gap-x-2 flex items-center justify-center">
            <div className="flex flex-col items-center gap-y-2">
                {/* Black Player Info (Top) */}
                <div className="flex items-center justify-between min-w-full p-2 bg-zinc-800 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <img
                            src={game.blackRef.profilePicture}
                            alt={game.blackRef.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-semibold">{game.blackRef.name}</p>
                            <p className="text-sm text-gray-400">Rating: {game.blackRef.rating[0]?.rating ?? "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Chess Board */}
                <ChessBoard
                    board={board}
                    chess={chessRef.current}
                    gamelocked={true}
                    myColor={color}
                />

                {/* White Player Info (Bottom) */}
                <div className="flex items-center justify-between min-w-full p-2 bg-zinc-800 rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <img
                            src={game.whiteRef.profilePicture}
                            alt={game.whiteRef.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-semibold">{game.whiteRef.name}</p>
                            <p className="text-sm text-gray-400">Rating: {game.whiteRef.rating[0]?.rating ?? "N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[50vw] h-full flex flex-col items-center">
                <div className="w-[20vw] h-[85vh] bg-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <MoveHistory viewGame={true} moveHistory={JSON.parse(game?.moveHistory as string)} gameStarted={true} waiting={false} />

                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={isPlaying ? pauseMoves : playMoves}
                            className="bg-blue-500 px-4 py-2 rounded"
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        <button
                            onClick={resetMoves}
                            className="bg-red-500 px-4 py-2 rounded"
                        >
                            Reset
                        </button>
                        <select
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="bg-zinc-800 text-white p-2 rounded"
                        >
                            <option value={2000}>Slow (2s)</option>
                            <option value={1000}>Normal (1s)</option>
                            <option value={500}>Fast (0.5s)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewGame
