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
import { Loader2, Pause, Play, RotateCcw } from "lucide-react"

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

    if (loading || !game) return <div className="board-grid-bg flex h-screen w-full flex-col items-center justify-center gap-y-5 bg-ink-950">
        <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/20" />
            <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
        </span>
        <p className="heading-display text-3xl text-cream">Loading game…</p>
    </div>;

    const playerCard = (ref: typeof game.blackRef, label: string) => (
        <div className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <img
                    src={ref.profilePicture}
                    alt={ref.name}
                    className="h-10 w-10 rounded-xl border border-white/10 bg-ink-800 object-cover"
                />
                <div>
                    <p className="text-sm font-semibold text-cream">{ref.name}</p>
                    <p className="text-xs font-medium text-gold-400">
                        {ref.rating[0]?.rating ?? "N/A"} <span className="text-cream/30">elo</span>
                    </p>
                </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-cream/60">
                {label}
            </span>
        </div>
    );

    return (
        <div className="board-grid-bg relative min-h-screen w-full overflow-hidden bg-ink-950 text-cream">
            {/* Ambient light */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/3 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[130px]" />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-wrap items-center justify-center gap-6 px-6 py-6">
                {/* Board column */}
                <div className="flex w-[min(76vh,600px)] flex-col gap-y-3">
                    {playerCard(game.blackRef, "Black")}
                    <ChessBoard
                        board={board}
                        chess={chessRef.current}
                        gamelocked={true}
                        myColor={color}
                    />
                    {playerCard(game.whiteRef, "White")}
                </div>

                {/* Side panel */}
                <div className="panel flex h-[calc(min(76vh,600px)_+_7.5rem)] w-[24rem] max-w-full flex-col p-5">
                    <MoveHistory viewGame={true} moveHistory={JSON.parse(game?.moveHistory as string)} gameStarted={true} waiting={false} messages={[]} setMessages={() => { }} />

                    <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4">
                        <button
                            onClick={isPlaying ? pauseMoves : playMoves}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:from-gold-300 hover:to-gold-500 active:scale-[0.98]"
                        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        <button
                            onClick={resetMoves}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-cream/80 transition-colors hover:border-red-500/40 hover:text-red-300"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                        <select
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="rounded-xl border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold-500/50"
                        >
                            <option value={2000}>Slow</option>
                            <option value={1000}>Normal</option>
                            <option value={500}>Fast</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewGame
