import { useState } from "react";

type TimeDropdownProps = {
    selected:string,
    setSelected:(args:string)=>void,
    options:string[]
}

const DropDown = ({selected,setSelected,options}:TimeDropdownProps,) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleSelect = (option: string) => {
      setSelected(option);
      setIsOpen(false);
    };

    return (
      <div className="relative inline-block w-64">
        <button
          className="w-full bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
          type="button"
          onClick={() => setIsOpen(!isOpen)} // Toggle dropdown
        >
          {selected}
          <svg
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
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
          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option}
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
