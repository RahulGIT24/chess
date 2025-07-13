const Waiting = ({ waiting }: { waiting: boolean | null }) => {
    return (
        <div>
            {waiting === true && (
                <div className="w-full flex justify-center items-center flex-col gap-y-5">
                    <img src="/waiting.gif" alt="waiting" />
                    <p className="font-bold text-2xl">Finding Players......</p>
                </div>
            )}
        </div>
    )
}

export default Waiting