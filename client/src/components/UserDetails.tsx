import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type UserDetailsProps = {
  name?: string;
  color: string;
  opponentTimer?: number;
  myTimer?: number;
  rating: number | null;
  active?: boolean;
};

const UserDetails = ({
  name,
  opponentTimer,
  myTimer,
  rating,
  active = false,
}: UserDetailsProps) => {
  const { user } = useSelector((state: RootState) => state.user);

  const formatTime = (timeInMs?: number) => {
    if (typeof timeInMs !== "number") return "--:--";
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  // Display whichever timer is passed
  const displayTimer = myTimer ?? opponentTimer;

  return (
    <div className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img
          src={user?.profilePicture ? user.profilePicture : "/user.png"}
          alt="player avatar"
          className="h-10 w-10 rounded-xl border border-white/10 bg-ink-800 object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-cream">
            {name ? name : user?.name}
          </p>
          <p className="text-xs font-medium text-gold-400">
            {rating ?? "—"} <span className="text-cream/30">elo</span>
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
        {formatTime(displayTimer)}
      </div>
    </div>
  );
};

export default UserDetails;
