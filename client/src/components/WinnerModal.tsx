import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { WinnerProps } from "../lib/types";

const WinnerModal = ({
    winner,
    closeModal,
    myColor,
    opponentName,
    resignedColor,
    timeUpColor,
    myRating,
    opponentImage,
    opponentRating,
    draw
}: WinnerProps) => {

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleClose = () => {
        closeModal();
    };

    const { user } = useSelector((state: RootState) => state.user);

    // ✅ Determine rating changes based on result
    let ratingChange = 0;
    let opponentChange = 0;

    if (draw) {
        ratingChange = 0;
        opponentChange = 0;
    } else if (winner) {
        ratingChange = winner === myColor ? 8 : -8;
        opponentChange = -ratingChange;
    } else if (resignedColor) {
        ratingChange = resignedColor === myColor ? -8 : 8;
        opponentChange = -ratingChange;
    } else if (timeUpColor) {
        ratingChange = timeUpColor === myColor ? -8 : 8;
        opponentChange = -ratingChange;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-zinc-800 rounded-2xl p-6 w-[90%] max-w-md shadow-lg text-white">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl"
                >
                    ✖
                </button>

                <h2 className="text-2xl font-bold text-center mb-4">Game Over!</h2>

                {/* Main Result */}
                {draw ? (
                    <p className="font-semibold text-3xl text-center mb-6 text-yellow-400">
                        It's a Draw!
                    </p>
                ) : (
                    <>
                        {winner && (
                            <p className={`font-semibold text-3xl text-center mb-6 ${winner === myColor ? "text-green-500" : "text-red-500"}`}>
                                {winner === myColor ? "You Won!" : "You Lose!"}
                            </p>
                        )}
                        {resignedColor && (
                            <p className={`font-semibold text-3xl text-center mb-6 ${resignedColor === myColor ? "text-red-500" : "text-green-500"}`}>
                                {resignedColor === myColor ? "You Lose!" : "You Won!"}
                            </p>
                        )}
                    </>
                )}

                {/* Detail Messages */}
                {draw && (
                    <p className="text-lg text-center mb-6">
                        🤝 The game ended in a draw.
                    </p>
                )}

                {winner && (
                    <p className="text-lg text-center mb-4">
                        🎉 {winner === myColor ? user?.name : opponentName} has won the game! 🎉
                    </p>
                )}
                {resignedColor && (
                    <>
                        <p className="text-lg text-center mb-2">
                            🎉 {resignedColor === myColor ? opponentName : user?.name} has won the game! 🎉
                        </p>
                        <p className="text-lg text-center mb-6 text-red-500 font-bold">
                            {resignedColor === myColor ? user?.name : opponentName} Resigned
                        </p>
                    </>
                )}
                {timeUpColor && (
                    <p className="text-lg text-center mb-6 text-red-500 font-bold">
                        {timeUpColor === myColor ? user?.name : opponentName} Timed Out!
                    </p>
                )}

                {/* Player Info with Rating Changes */}
                <div className="flex justify-between items-center bg-zinc-700 rounded-xl p-4 mt-4">
                    {/* My Info */}
                    <div className="flex items-center space-x-3">
                        <img
                            src={user?.profilePicture || "/default-avatar.png"}
                            alt="Your Avatar"
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                            <p className="font-semibold">{user?.name}</p>
                            <p className="text-gray-300 text-sm">
                                {myRating}{" "}
                                <span className={ratingChange > 0 ? "text-green-500" : ratingChange < 0 ? "text-red-500" : "text-yellow-400"}>
                                    {ratingChange > 0 ? `(+${ratingChange})` : ratingChange === 0 ? "(0)" : `(${ratingChange})`}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Opponent Info */}
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="font-semibold">{opponentName}</p>
                            <p className="text-gray-300 text-sm">
                                {opponentRating}{" "}
                                <span className={opponentChange > 0 ? "text-green-500" : opponentChange < 0 ? "text-red-500" : "text-yellow-400"}>
                                    {opponentChange > 0 ? `(+${opponentChange})` : opponentChange === 0 ? "(0)" : `(${opponentChange})`}
                                </span>
                            </p>
                        </div>
                        <img
                            src={opponentImage || "/default-avatar.png"}
                            alt="Opponent Avatar"
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinnerModal;
