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
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left font-mono text-base font-medium text-cream transition-colors hover:border-gold-500/40 hover:bg-white/[0.07]"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
        <svg
          className={`h-4 w-4 text-gold-400 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
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
        <div className={`absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-panel backdrop-blur-xl`}>
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              className={`block w-full px-4 py-2.5 text-left font-mono text-sm transition-colors hover:bg-gold-500/10 hover:text-gold-300 focus:bg-gold-500/10 focus:outline-none ${option === selected ? "text-gold-400" : "text-cream/80"}`}
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
