import { useEffect, useState } from "react";
import { TIME_UP } from "../constants/messages";

export default function Timer({
  time,
  color,
  myTurn,
  socket,
  gameLocked
}: {
  time: number | null;
  color: string;
  myTurn: boolean;
  socket?: WebSocket;
  gameLocked:boolean
}) {
  const [timer, setTimer] = useState<number | null>(time);

  useEffect(() => {
    if (time) {
      setTimer(time);
    }
  }, [time]);

  useEffect(() => {
    if(gameLocked) {
      return ; 
    }
    if (timer !== null && myTurn) {
      if (timer === 0 && socket && myTurn) {
        socket.send(
          JSON.stringify({
            type: TIME_UP,
            payload: { color },
          })
        );
        return;
      }

      const interval = setInterval(() => {
        setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, myTurn, socket]);

  return (
    <div className="text-black bg-white w-32 p-2 z-10 rounded-md right-[10%] top-[0%]">
      {
        Math.floor(timer ? timer / 60 : 0)
          .toString()
          .padStart(2, "0")
      }
      :{
        timer ?
        (timer % 60).toString().padStart(2, "0"):"00"
      }
    </div>
  );
}
