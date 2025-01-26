import { Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { ERROR, MOVE } from "../screens/Game";
import toast from "react-hot-toast";

const ChessBoard = ({ board, socket, setBoard, chess, myColor = 'white' }: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]
  socket: WebSocket
  setBoard: any, chess: any,
  myColor: string
}) => {
  const [from, setFrom] = useState<Square | null>(null)
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null)
  const [to,setTo] = useState<Square|null>(null);

  const isMyPiece = (square: Square | null) => {
    const piece = board.flat().find((cell) => cell?.square === square);
    return piece && piece.color === (myColor === "white" ? "w" : "b");
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log(data);
      if (data.type === ERROR) {
        const message = data.payload.message;
        toast.error(message ?? "Server Error")
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket])

  const handlePromotion = (piece: PieceSymbol) => {
    if (!promotion) return;
    console.log('From',from)
    console.log('to',to)
    socket.send(JSON.stringify({
      type: MOVE,
      payload: {
        move: {
          from: from,
          to: to,
          promotion: piece
        }
      }
    }))
    chess.move({ from: from, to: to, promotion: piece })
    setBoard(chess.board())
    setPromotion(null);
    setFrom(null);
    setTo(null);
  }

  return (
    <div className={`text-black w-full ${myColor === 'black' ? "rotate-180" : ""}`}>
      {board.map((row, i) => {
        return <div key={i} className={`flex justify-center items-center`}>
          {
            row.map((square, j) => {
              const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square
              return <div key={j} className={`w-[6.4rem]  flex justify-center items-center h-[10vh] ${(i + j) % 2 === 0 ? 'bg-zinc-500' : 'bg-green-500'}`}
                onClick={() => {
                  if (promotion) return;
                  if (!from) {
                    if (isMyPiece(squareRepresentation)) {
                      setFrom(squareRepresentation);
                      // console.log('From',squareRepresentation);
                    } else {
                      return;
                    }
                  } else {
                    setTo(squareRepresentation)
                    // console.log('To',squareRepresentation);
                    const move = {
                      from, to: squareRepresentation
                    }

                    try {
                      if (chess.get(from)?.type === 'p' && (squareRepresentation[1] === '8' || squareRepresentation[1] === '1')) {
                        setPromotion(move);
                      } else {
                        socket.send(JSON.stringify({
                          type: MOVE,
                          payload: {
                            move: move
                          }
                        }))
                        chess.move({
                          from: from,
                          to: squareRepresentation,
                        });
                        setBoard(chess.board())
                        setFrom(null);
                        setTo(null);
                      }
                    } catch (error) {
                      setFrom(null);
                      setTo(null);
                      console.log(error);
                      return;
                    }
                  }
                }}
              >
                <p className={`text-center ${myColor === 'black' ? 'rotate-180' : ''}`}>
                  <img src={`/${square?.color === "b" ? square.type : square?.type.toUpperCase() + " copy"}.png`} alt="" />
                </p>
              </div>
            })
          }
        </div>
      })}
      {promotion && (
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center ${myColor === 'black' ? "rotate-180" : ""}`}>
          <div className="bg-white p-4 rounded-lg">
            <p className="mb-2">Choose promotion piece:</p>
            <div className="flex space-x-2">
              {['q', 'r', 'b', 'n'].map((piece) => (
                <button
                  key={piece}
                  className="p-2 border rounded"
                  onClick={() => handlePromotion(piece as PieceSymbol)}
                >
                  {piece.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChessBoard