import { useEffect } from "react";

const WinnerModal = ({
  winner,
  closeModal,
}: {
  winner: string;
  closeModal: () => void;
}) => {
  useEffect(() => {
    // Prevent scrolling when the modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    closeModal(); // Call the close function passed from the parent
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {/* Modal Content */}
        <h2 className="text-xl font-bold text-center mb-4">Game Over!</h2>
        <p className="text-lg text-center mb-6 text-black">
          🎉 {winner} has won the game! 🎉
        </p>
      </div>
    </div>
  );
};

export default WinnerModal;
