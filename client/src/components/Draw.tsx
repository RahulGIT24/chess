
const Draw = ({ onClose }:{onClose:()=>void}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white flex flex-col justify-center items-center rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
        <button
          className="absolute top-3 text-2xl right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-xl font-bold text-center mb-4 text-black">Game Drawn</h2>
      </div>
    </div>
  );
};

export default Draw;