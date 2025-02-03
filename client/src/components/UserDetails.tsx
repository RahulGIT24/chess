import { useSelector } from "react-redux";
import Button from "./Button";
import Timer from "./Timer";
import { RootState } from "../redux/store";


type UserDetailsProps = {
  name?: string;
  color: string;
  timer:number | null,
  myTurn: boolean;
  onResign?: any;
  offerDraw?: any;
  socket?: WebSocket;
  gameStart: boolean;
  setTimer: any,
  decrementTimer:any
};

const UserDetails = ({
  name,
  color,
  timer,
  onResign,
  offerDraw,
  myTurn,
  socket,
  setTimer,
  decrementTimer
}: UserDetailsProps) => {
  const { user } = useSelector((state: RootState) => state.user);
  return (
    <div className="flex flex-row items-center justify-between gap-x-5 w-full bg-zinc-700 text-white p-2">
      <div className="flex items-center gap-x-5">
        <img
          src="/user.png"
          alt=""
          className="w-10 h-10 bg-white rounded-full border border-white"
        />
        <p className="font-serif font-semibold text-xl">
          {name ? name : user?.name}
        </p>
        <Timer timer={timer} color={color} myTurn={myTurn} socket={socket} decrementTimer={decrementTimer}/>
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
