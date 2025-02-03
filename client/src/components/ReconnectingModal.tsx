
const ReconnectingModal = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-zinc-800 flex flex-col justify-center items-center rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
                <h2 className="text-xl font-bold text-center mb-4 text-white">Reconnecting to Game.......</h2>
            </div>
        </div>
    );
};

export default ReconnectingModal;