import { useSelector } from "react-redux";
import Button from "./Button";
import { RootState } from "../redux/store";

type UserDetailsProps = {
  name?: string;
  color: string;
  onResign?: () => void;
  offerDraw?: () => void;
  opponentTimer?: number;
  myTimer?: number;
};

const UserDetails = ({
  name,
  color,
  onResign,
  opponentTimer,
  myTimer,
  offerDraw,
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
    <div className="flex flex-row items-center justify-between gap-x-5 w-full bg-zinc-700 text-white p-2">
      <div className="flex items-center gap-x-5">
        <img
          src="/user.png"
          alt="player avatar"
          className="w-10 h-10 bg-white rounded-full border border-white"
        />
        <div>
          <p className="font-serif font-semibold text-xl">
            {name ? name : user?.name}
          </p>
          <p className="text-sm text-gray-300 font-mono">⏱ {formatTime(displayTimer)}</p>
        </div>
      </div>
      <div>
        {offerDraw && (
          <Button onClick={offerDraw} classname="mx-4">
            Offer Draw
          </Button>
        )}
        {onResign && <Button onClick={onResign}>Resign</Button>}
      </div>
    </div>
  );
};

export default UserDetails;
