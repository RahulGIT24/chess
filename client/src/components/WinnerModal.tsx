import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { WinnerProps } from "../lib/types";

const WinnerModal = ({
    winner,
    closeModal,
    myColor,
    opponentName, resignedColor, timeUpColor
}: WinnerProps) => {
    useEffect(() => {
        // Prevent scrolling when the modal is open
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleClose = () => {
        closeModal();
    };

    const { user } = useSelector((state: RootState) => state.user);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-zinc-700 rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✖
                </button>
                <h2 className="text-xl font-bold text-center mb-4">Game Over!</h2>
                {
                    winner && (winner === myColor ?
                        <p className="text-green-700 font-semibold text-3xl text-center mb-6">You Won!</p> :
                        <p className="text-red-500 font-semibold text-3xl text-center mb-6">You Lose!</p>)
                }
                {
                    resignedColor && (resignedColor === myColor ?
                        <p className="text-red-500 font-semibold text-3xl text-center mb-6">You Lose!</p> :
                        <p className="text-green-700 font-semibold text-3xl text-center mb-6">You Won!</p>)
                }
                {
                    winner &&
                    <p className="text-lg text-center mb-6 text-white">
                        🎉 {winner === myColor ? user?.name : opponentName} has won the game! 🎉
                    </p>
                }
                {
                    resignedColor &&
                    <>
                        <p className="text-lg text-center mb-6 text-white">
                            🎉 {resignedColor === myColor ? opponentName : user?.name} has won the game! 🎉
                        </p>
                        <p className="text-lg text-center mb-6 text-red-600 font-black">
                            {resignedColor === myColor ?  user?.name : opponentName} Resigned
                        </p>
                    </>
                }
                {
                    timeUpColor &&
                    <p className="text-lg text-center mb-6 text-red-600 font-black">
                        {timeUpColor === myColor ? user?.name : opponentName} Timed Out!
                    </p>
                }
            </div>
        </div>
    );
};

export default WinnerModal;
