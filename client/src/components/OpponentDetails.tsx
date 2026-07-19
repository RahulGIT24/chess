import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { UserDetailsProps } from "../lib/types";

const OpponentDetails = ({
  name,
  timer,
  opponentProfilePicture,
  opponentRating,
  active = false,
}: UserDetailsProps) => {

  const { user } = useSelector((state: RootState) => state.user);

  const formatTime = (timeInMs?: number) => {
    if (typeof timeInMs !== "number") return "--:--";
    if (isNaN(timeInMs)) return "--:--";
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img
          src={opponentProfilePicture ? opponentProfilePicture : "/user.png"}
          alt="player avatar"
          className="h-10 w-10 rounded-xl border border-white/10 bg-ink-800 object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-cream">
            {name ? name : user?.name}
          </p>
          <p className="text-xs font-medium text-gold-400">
            {opponentRating ?? 0} <span className="text-cream/30">elo</span>
          </p>
        </div>
      </div>
      <div
        className={`rounded-xl px-4 py-2 font-mono text-lg font-semibold tabular-nums transition-all ${
          active
            ? "bg-gold-500 text-ink-950 shadow-glow-sm"
            : "border border-white/[0.07] bg-white/[0.03] text-cream/60"
        }`}
      >
        {formatTime(timer)}
      </div>
    </div>
  );
};

export default OpponentDetails;
