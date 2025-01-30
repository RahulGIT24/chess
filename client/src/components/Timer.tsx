import { useEffect, useState } from "react";
import { TIME_UP } from "../constants/messages";

export default function Timer({
  time,
  setTime,
  color,
  currentTurn,
  myTurn,
  socket,
  timeUp,
}: {
  time: number;
  setTime: (update: (prev: number) => number) => void;
  color: string;
  currentTurn: string | null;
  myTurn: boolean;
  socket?: WebSocket;
  timeUp: () => void;
}) {
  const [timer, setTimer] = useState<number>(time);

  useEffect(() => {
    setTimer(time);
  }, [time]);
  useEffect(() => {
    if (timer === 0 || !myTurn) return;

    if (timer == 0 && myTurn && socket) {
      timeUp();
    }

    const interval = setInterval(() => {
      console.log(color, "time", timer, time);
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval); // Clear interval when unmounting or dependencies change
  }, [timer, color, currentTurn, setTime, myTurn]);

  return (
    <div className="text-black bg-white w-32 p-2 z-10 rounded-md right-[10%] top-[0%]">
      {Math.floor(timer / 60)
        .toString()
        .padStart(2, "0")}
      :{(timer % 60).toString().padStart(2, "0")}
    </div>
  );
}
