import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Button from "./Button";
import Timer from "./Timer";
import { useEffect, useState } from "react";

type UserDetailsProps = {
  name?: string;
  time: number | null;
  color: string;
  myTurn: boolean;
  onResign?: any;
  offerDraw?: any;
  socket?: WebSocket;
  gameStart: boolean;
};

const UserDetails = ({
  name,
  time,
  color,
  onResign,
  offerDraw,
  myTurn,
  socket,
}: UserDetailsProps) => {
  const [myName, setMyname] = useState<string>("");
  const { user } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (user?.name) setMyname(user.name);
    console.log("zdfhzdh", myName)
    console.log("the name ",name)
  }, [user?.name,name]);
  return (
    <div className="flex flex-row items-center justify-between gap-x-5 w-full bg-zinc-700 text-white p-2">
      <div className="flex items-center gap-x-5">
        <img
          src="/user.png"
          alt=""
          className="w-10 h-10 bg-white rounded-full border border-white"
        />
        <p className="font-serif font-semibold text-xl">
          {name!=='' && name? name : myName}
        </p>
        <Timer time={time} color={color} myTurn={myTurn} socket={socket} />
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
