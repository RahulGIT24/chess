import React, { useEffect } from "react";

export default function Timer({ 
  time,
  setTime,
  myTurn
}: {
  time: number;
  setTime: any;
  myTurn:boolean
}) {
  console.log(time);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("here");
      if (time === 0) return;
      if(myTurn)
      return setTime((prev: number) => prev - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className=" text-black bg-white w-32 p-2 z-10 rounded-md right-[10%] top-[0%]">
        {" "}
        {Math.floor(time / 60) || "00"}:{time % 60 || "00"}
      </div>
    </>
  );
}
