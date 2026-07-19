import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setPage: (arg: number) => void
}

const pageButtonBase =
  "min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setPage }) => {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className={`${pageButtonBase} border border-white/10 bg-white/[0.04] text-cream/80 hover:bg-white/[0.08]`}
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`${pageButtonBase} ${currentPage === page
            ? "bg-gold-500 font-semibold text-ink-950 shadow-glow-sm"
            : "border border-white/10 bg-white/[0.04] text-cream/80 hover:bg-white/[0.08]"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        className={`${pageButtonBase} border border-white/10 bg-white/[0.04] text-cream/80 hover:bg-white/[0.08]`}
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
