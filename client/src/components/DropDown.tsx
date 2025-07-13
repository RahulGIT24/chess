import { useState } from "react";
import { TimeDropdownProps } from "../lib/types";

const DropDown = ({ selected, setSelected, options, classname }: TimeDropdownProps,) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ` + classname}>
      <button
        className="w-full bg-gray-200 border text-xl font-bold border-gray-300 text-gray-700 px-4 py-5 rounded-lg shadow-sm text-left flex items-center justify-between"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
            }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 `}>
          {options.map((option,i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;
