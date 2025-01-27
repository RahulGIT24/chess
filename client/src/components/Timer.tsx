import { useEffect } from "react";

export default function Timer({
  time,
  setTime,
  color,
  currentTurn,
}: {
  time: number;
  setTime: (update: (prev: number) => number) => void;
  color: string;
  currentTurn: string | null;
}) {
  useEffect(() => {
    // Run timer only if the current player's color matches the turn
    if (time === 0 || color !== currentTurn) return;

    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval); // Clear interval when unmounting or dependencies change
  }, [time, color, currentTurn, setTime]);

  return (
    <div className="text-black bg-white w-32 p-2 z-10 rounded-md right-[10%] top-[0%]">
      {Math.floor(time / 60).toString().padStart(2, "0")}:
      {(time % 60).toString().padStart(2, "0")}
    </div>
  );
}
