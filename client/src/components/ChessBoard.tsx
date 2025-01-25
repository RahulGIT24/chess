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

  const isMyPiece = (square: Square | null) => {
    const piece = board.flat().find((cell) => cell?.square === square);
    return piece && piece.color === (myColor === "white" ? "w" : "b");
  };

  useEffect(()=>{
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log(data);
      if(data.type===ERROR){
        const message = data.payload.message;
        toast.error(message ?? "Server Error")
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  },[socket])

  return (
    <div className={`text-black w-full ${myColor === 'black' ? "rotate-180" : ""}`}>
      {board.map((row, i) => {
        return <div key={i} className={`flex justify-center items-center`}>
          {
            row.map((square, j) => {
              const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square
              return <div key={j} className={`w-20  flex justify-center items-center h-20 ${(i + j) % 2 === 0 ? 'bg-zinc-500' : 'bg-green-500'}`}
                onClick={() => {
                  if (!from) {
                    if (isMyPiece(squareRepresentation)) {
                      setFrom(squareRepresentation);
                    } else {
                      return;
                    }
                  } else {
                    socket.send(JSON.stringify({
                      type: MOVE,
                      payload: {
                        move: {
                          from: from,
                          to: squareRepresentation
                        }
                      }
                    }))
                    try {
                      chess.move({
                        from: from,
                        to: squareRepresentation
                      });
                      setBoard(chess.board())
                    } catch (error) {
                      return;
                    } finally {
                      setFrom(null)
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
    </div>
  )
}

export default ChessBoard