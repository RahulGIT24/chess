import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { WinnerProps } from "../lib/types";
import { Handshake, Trophy } from "lucide-react";

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

    const iWon = ratingChange > 0;

    const formatChange = (change: number) =>
        change > 0 ? `+${change}` : `${change}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
            <div className="panel relative w-[90%] max-w-md animate-fade-up p-8">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-3 text-xl text-cream/40 transition-colors hover:text-cream"
                >
                    ✕
                </button>

                {/* Result icon */}
                <div className="mb-5 flex justify-center">
                    <span
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${draw
                            ? "border-gold-500/30 bg-gold-500/10 text-gold-400"
                            : iWon
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/30 bg-red-500/10 text-red-400"
                            }`}
                    >
                        {draw ? <Handshake className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
                    </span>
                </div>

                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.22em] text-cream/40">
                    Game over
                </p>

                {/* Main Result */}
                {draw ? (
                    <p className="heading-display mb-6 text-center text-4xl text-gold-400">
                        It's a draw
                    </p>
                ) : (
                    <>
                        {winner && (
                            <p className={`heading-display mb-6 text-center text-4xl ${winner === myColor ? "text-emerald-400" : "text-red-400"}`}>
                                {winner === myColor ? "You won" : "You lost"}
                            </p>
                        )}
                        {resignedColor && (
                            <p className={`heading-display mb-6 text-center text-4xl ${resignedColor === myColor ? "text-red-400" : "text-emerald-400"}`}>
                                {resignedColor === myColor ? "You lost" : "You won"}
                            </p>
                        )}
                    </>
                )}

                {/* Detail Messages */}
                {draw && (
                    <p className="mb-6 text-center text-sm text-cream/60">
                        The game ended in a draw.
                    </p>
                )}

                {winner && (
                    <p className="mb-4 text-center text-sm text-cream/60">
                        🎉 {winner === myColor ? user?.name : opponentName} has won the game! 🎉
                    </p>
                )}
                {resignedColor && (
                    <>
                        <p className="mb-2 text-center text-sm text-cream/60">
                            🎉 {resignedColor === myColor ? opponentName : user?.name} has won the game! 🎉
                        </p>
                        <p className="mb-6 text-center text-sm font-semibold text-red-400">
                            {resignedColor === myColor ? user?.name : opponentName} resigned
                        </p>
                    </>
                )}
                {timeUpColor && (
                    <p className="mb-6 text-center text-sm font-semibold text-red-400">
                        {timeUpColor === myColor ? user?.name : opponentName} timed out
                    </p>
                )}

                {/* Player Info with Rating Changes */}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                    {/* My Info */}
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.profilePicture || "/user.png"}
                            alt="Your Avatar"
                            className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                        />
                        <div>
                            <p className="text-sm font-semibold text-cream">{user?.name}</p>
                            <p className="font-mono text-xs text-cream/50">
                                {myRating}{" "}
                                <span className={ratingChange > 0 ? "text-emerald-400" : ratingChange < 0 ? "text-red-400" : "text-gold-400"}>
                                    ({formatChange(ratingChange)})
                                </span>
                            </p>
                        </div>
                    </div>

                    <span className="font-display text-lg italic text-cream/30">vs</span>

                    {/* Opponent Info */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-cream">{opponentName}</p>
                            <p className="font-mono text-xs text-cream/50">
                                {opponentRating}{" "}
                                <span className={opponentChange > 0 ? "text-emerald-400" : opponentChange < 0 ? "text-red-400" : "text-gold-400"}>
                                    ({formatChange(opponentChange)})
                                </span>
                            </p>
                        </div>
                        <img
                            src={opponentImage || "/user.png"}
                            alt="Opponent Avatar"
                            className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WinnerModal;
