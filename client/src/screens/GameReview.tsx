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
        <div className="min-h-screen bg-zinc-800 py-8">
            {
                loading ? <div className='flex justify-center h-[85vh] flex-col text-2xl text-white gap-y-3 items-center'>
                    <Loader2 color='green' size={80} className='animate-spin' />
                    <p>Fetching Game Reviews.........</p>
                </div>
                    : (
                        !loading && gameReviewData ? (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <GameHeader game={gameReviewData.game} />
                                <AccuracyChart
                                    whiteAccuracy={gameReviewData.game.accuracyWhite}
                                    blackAccuracy={gameReviewData.game.accuracyBlack}
                                />
                                <MoveReviewTable moveReviews={gameReviewData.moveReviews} />
                            </div>
                        ):
                        <div className='flex justify-center items-center text-3xl text-green-500'>
                            <p className='text-white text-2xl text-center'>Game Review is in progress keep refreshing the page....</p>
                        </div>
                    )
            }
        </div>
    );
};