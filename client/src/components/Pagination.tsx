import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setPage:(arg:number)=>void
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setPage }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage-1)}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`px-4 py-2 rounded ${
            currentPage === page
              ? "bg-white text-black font-semibold"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage+1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
