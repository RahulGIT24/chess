import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

const ChessBoard = ({ board, socket, setBoard, chess,myColor='white' }: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]
  socket: WebSocket
  setBoard: any, chess: any,
  myColor:string
}) => {
  const [from, setFrom] = useState<Square | null>(null)
  const [to, setTo] = useState<Square | null>(null);
  return (
    <div className={`text-black w-full ${myColor==='black' ? "rotate-180" : ""}`}>
      {board.map((row, i) => {
        return <div key={i} className={`flex justify-center items-center`}>
          {
            row.map((square, j) => {
              const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square
              return <div key={j} className={`w-20  flex justify-center items-center h-20 ${(i + j) % 2 === 0 ? 'bg-zinc-500' : 'bg-green-500'}`} onClick={() => {
                if (!from) {
                  setFrom(squareRepresentation)
                } else {
                  setTo(squareRepresentation)
                  socket.send(JSON.stringify({
                    type: MOVE,
                    payload: {
                      move:{
                        from: from,
                        to: squareRepresentation
                      }
                    }
                  }))
                  chess.move({
                    from: from,
                    to: squareRepresentation
                  });
                  setBoard(chess.board())
                  setFrom(null)
                }
              }}>
                <p className={`text-center ${myColor === 'black' ? 'rotate-180' : ''}`}>
                  <img src={`/${square?.color === "b" ? square.type : square?.type.toUpperCase() + " copy"}.png`} alt="" />
                  {/* {square ? square.type : ""} */}
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