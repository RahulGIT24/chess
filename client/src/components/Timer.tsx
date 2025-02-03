import { useEffect } from "react";
import { TIME_UP } from "../constants/messages";
import { useDispatch } from "react-redux";


export default function Timer({
  timer,
  color,
  myTurn,
  socket,
  decrementTimer
}: {
  timer: number | null;
  color: string;
  myTurn: boolean;
  socket?: WebSocket;
  decrementTimer:any
}) {

  const dispatch = useDispatch()

  useEffect(() => {
    // if(gameLocked) {
    //   return ; 
    // }
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
        dispatch(decrementTimer())
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
