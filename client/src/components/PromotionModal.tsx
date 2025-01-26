import { PieceSymbol } from 'chess.js'
type PromotionProps = {
    myColor:string,
    handlePromotion: (piece:PieceSymbol) => void
}

const PromotionModal = ({myColor,handlePromotion}:PromotionProps) => {
    return (
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center ${myColor === 'black' ? "rotate-180" : ""}`}>
            <div className="bg-white p-4 rounded-lg">
                <p className="mb-2">Choose promotion piece:</p>
                <div className="flex space-x-2">
                    {['q', 'r', 'b', 'n'].map((piece) => (
                        <button
                            key={piece}
                            className={`p-2 border rounded ${myColor === "black" ? "bg-white" : "bg-black"}`}
                            onClick={() => handlePromotion(piece as PieceSymbol)}
                        >
                            <img src={`/${myColor === "black" ? piece : piece.toUpperCase() + " copy"}.png`} alt="" className="w-8 h-9" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PromotionModal