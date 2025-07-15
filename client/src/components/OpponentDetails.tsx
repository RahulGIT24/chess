import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { UserDetailsProps } from "../lib/types";

const OpponentDetails = ({
  name,
  timer,
  opponentProfilePicture
}: UserDetailsProps) => {
  const { user } = useSelector((state: RootState) => state.user);

  const formatTime = (timeInMs?: number) => {
    if (typeof timeInMs !== "number") return "--:--";
    if(isNaN(timeInMs)) return "--:--";
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-row items-center justify-between gap-x-5  bg-zinc-700 text-white p-2">
      <div className="flex items-center gap-x-5">
        <img
          src={opponentProfilePicture ? opponentProfilePicture : "/user.png"}
          alt="player avatar"
          className="w-10 h-10 bg-white rounded-full border border-white"
        />
        <div>
          <p className="font-serif font-semibold text-xl">
            {name ? name : user?.name}
          </p>
          <p className="text-sm text-gray-300 font-mono">⏱ {formatTime(timer)}</p>
        </div>
      </div>
    </div>
  );
};

export default OpponentDetails;
