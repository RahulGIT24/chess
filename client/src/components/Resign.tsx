import React from "react";
import Button from "./Button";

export default function Resign({
  setResignDialogBox,
  handleResign,
  setResigned,
}: any) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10"
      onClick={() => setResignDialogBox(false)}
    >
      <div
        className="bg-white w-80 md:w-96 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg md:text-xl font-semibold text-gray-800 text-center">
          Do you want to resign?
        </p>
        <div className="flex gap-4">
          <Button
            classname="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-all"
            onClick={() => {
              setResigned(true);
              handleResign();
            }}
          >
            Yes
          </Button>
          <Button
            classname="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-all"
            onClick={() => setResignDialogBox(false)}
          >
            No
          </Button>
        </div>
      </div>
    </div>
  );
}
