import { GameHeader } from '../components/Reviews/GameHeader';
import { AccuracyChart } from '../components/Reviews/AccuracyChart';
import { MoveReviewTable } from '../components/Reviews/MoveReviewTable';
import { GameReview } from '../lib/types';
import { useEffect, useState } from 'react';
import { apiCall } from '../lib/apiCall';
import { GET } from '../constants/methods';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const GameReviewScreen = () => {
    const [loading, setLoading] = useState(true);
    const [gameReviewData, setGameReviewData] = useState<GameReview | null>(null)
    const params = useParams();
    const navigate = useNavigate();

    const getGameReviewData = async (gameId: string) => {
        try {
            setLoading(true);
            const res = await apiCall({
                url: `/game/analyze-game?id=${gameId}`,
                method: GET
            })
            setGameReviewData(res.data);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (params.id) {
            getGameReviewData(params.id)
        } else {
            navigate("/game")
        }
    }, [params])

    return (
        <div className="board-grid-bg relative min-h-screen bg-ink-950 py-10 text-cream">
            {/* Ambient light */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-gold-500/[0.08] blur-[130px]" />
            </div>
            {
                loading ? <div className='relative z-10 flex h-[85vh] flex-col items-center justify-center gap-y-5'>
                    <span className="relative flex h-20 w-20 items-center justify-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/20" />
                        <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
                    </span>
                    <p className="heading-display text-3xl">Fetching game review…</p>
                </div>
                    : (
                        !loading && gameReviewData ? (
                            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <GameHeader game={gameReviewData.game} />
                                <AccuracyChart
                                    whiteAccuracy={gameReviewData.game.accuracyWhite}
                                    blackAccuracy={gameReviewData.game.accuracyBlack}
                                />
                                <MoveReviewTable moveReviews={gameReviewData.moveReviews} />
                            </div>
                        ) :
                            <div className='relative z-10 flex h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center'>
                                <span className="text-5xl">♟</span>
                                <p className='heading-display text-3xl'>Review in progress</p>
                                <p className='text-sm text-cream/50'>Stockfish is still crunching this game — refresh in a moment.</p>
                            </div>
                    )
            }
        </div>
    );
};
