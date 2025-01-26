import { Color, PieceSymbol, Square } from "chess.js";
import { SetStateAction, useEffect, useState } from "react";
import { ERROR, MOVE, UserMoves } from "../screens/Game";
import toast from "react-hot-toast";
import { useSoundEffects } from "../hooks/useSoundEffects";
import PromotionModal from "./PromotionModal";

const ChessBoard = ({ board, socket, setBoard, chess, myColor = 'white',setMyMoves }: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]
  socket: WebSocket
  setBoard: any, chess: any,
  myColor: string,
  setMyMoves: any
}) => {
  const [from, setFrom] = useState<Square | null>(null)
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null)
  const [to, setTo] = useState<Square | null>(null);

  const {castle, move: pieceMove, promote: piecePromote, error: errSound, capture } = useSoundEffects();

  const isMyPiece = (square: Square | null) => {
    const piece = board.flat().find((cell) => cell?.square === square);
    return piece && piece.color === (myColor === "white" ? "w" : "b");
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.type === ERROR) {
        const message = data.payload.message;
        errSound();
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
    const moveRes = chess.move({ from: from, to: to, promotion: piece })
    setMyMoves((prev:any)=>[{piece:moveRes.piece, place:to},...prev])
    setBoard(chess.board())
    piecePromote()
    setPromotion(null);
    setFrom(null);
    setTo(null);
  }

  const handlePieceMove = (squareRepresentation: Square) => {
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
          const moveRes = chess.move({
            from: from,
            to: squareRepresentation,
          });
          setMyMoves((prev:any)=>[{piece:moveRes.piece ,place:squareRepresentation},...prev])
          setBoard(chess.board())

          const destinationsq = board.flat().find((cell) => cell?.square === squareRepresentation)
          const isCapture = destinationsq && destinationsq.color !== (myColor === "white" ? 'w' : 'b')

          if (isCapture) {
            capture();
          }else {
            pieceMove()
          }
          setFrom(null);
          setTo(null);
        }
      } catch (error) {
        setFrom(null);
        setTo(null);
        return;
      }
    }
  }

  return (
    <div className={`text-black w-full ${myColor === 'black' ? "rotate-180" : ""}`}>
      {board.map((row, i) => {
        return <div key={i} className={`flex justify-center items-center`}>
          {
            row.map((square, j) => {
              const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square
              return <div key={j} className={`w-[6.4rem]  flex justify-center items-center h-[9vh] ${(i + j) % 2 === 0 ? 'bg-zinc-500' : 'bg-green-500'}`}
                onClick={() => {
                  handlePieceMove(squareRepresentation)
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
        <PromotionModal myColor={myColor} handlePromotion={handlePromotion}/>
      )}
    </div>
  );
}

export default ChessBoard