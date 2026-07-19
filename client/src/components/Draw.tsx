
const Draw = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
      <div className="panel relative flex w-[90%] max-w-md animate-fade-up flex-col items-center justify-center p-10">
        <button
          className="absolute right-4 top-3 text-xl text-cream/40 transition-colors hover:text-cream"
          onClick={onClose}
        >
          ✕
        </button>
        <span className="mb-4 text-5xl">🤝</span>
        <h2 className="heading-display text-center text-3xl text-cream">Game drawn</h2>
      </div>
    </div>
  );
};

export default Draw;
