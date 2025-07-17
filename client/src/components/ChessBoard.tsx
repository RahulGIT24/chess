import { PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { useSoundEffects } from "../hooks/useSoundEffects";
import PromotionModal from "./PromotionModal";
import { ERROR, MOVE } from "../constants/messages";
import { ChessBoardProps } from "../lib/types";

const ChessBoard = ({
  board,
  socket,
  chess,
  myColor = "white",
  gamelocked,
}: ChessBoardProps) => {
  const [from, setFrom] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [to, setTo] = useState<Square | null>(null);
  const {
    promote: piecePromote,
    error: errSound,
  } = useSoundEffects();

  const isMyPiece = (square: Square | null) => {
    const piece = board.flat().find((cell) => cell?.square === square);
    return piece && piece.color === (myColor === "white" ? "w" : "b");
  };

  useEffect(() => {
    if(!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === ERROR) {
        // const message = data.payload.message;
        errSound();
        // toast.error(message ?? "Server Error");
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handlePromotion = (piece: PieceSymbol) => {
    if(gamelocked) return;
    if (!promotion) return;

    socket?.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          move: {
            from: from,
            to: to,
            promotion: piece,
          },
        },
      })
    );
    piecePromote();
    setPromotion(null);
    setFrom(null);
    setTo(null);
  };

  const handlePieceMove = (squareRepresentation: Square) => {
    if(gamelocked) return;
    if (promotion) return;

    if (!from) {
      if (isMyPiece(squareRepresentation)) {
        setFrom(squareRepresentation);
      } else {
        return;
      }
    } else {
      setTo(squareRepresentation);
      const move = {
        from,
        to: squareRepresentation,
      };

      try {
        // Check if the move is a promotion (pawn reaching last rank)
        const piece = chess.get(from);
        const isPawn = piece?.type === "p";
        const isLastRank =
          squareRepresentation[1] === (myColor === "white" ? "8" : "1");

        if (isPawn && isLastRank) {
          // If it's a pawn and reaches the last rank, set promotion
          setPromotion(move);
        } else {
          console.log('moving')
          // Regular move logic
          socket?.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                move: move,
              },
            })
          );
          setFrom(null);
          setTo(null);
        }
      } catch (error) {
        setFrom(null);
        setTo(null);
        return;
      }
    }
  };

  return (
    <>
      <div
        className={`text-black w-full ${myColor === "black" ? "rotate-180" : ""
          }`}
      >
        {board.map((row, i) => {
          return (
            <div key={i} className={`flex justify-center items-center`}>
              {row.map((square, j) => {
                const squareRepresentation = (String.fromCharCode(
                  97 + (j % 8)
                ) +
                  "" +
                  (8 - i)) as Square;
                return (
                  <div
                    key={j}
                    className={`w-[6.4rem]  flex justify-center items-center h-[9vh] ${(i + j) % 2 === 0 ? "bg-zinc-500" : "bg-green-500"
                      }`}
                    onClick={() => {
                      handlePieceMove(squareRepresentation);
                    }}
                  >
                    <p
                      className={`text-center ${myColor === "black" ? "rotate-180" : ""
                        }`}
                    >
                      <img
                        src={`/${square?.color === "b"
                            ? square.type
                            : square?.type.toUpperCase() + " copy"
                          }.png`}
                        alt=""
                      />
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
        {promotion && (
          <PromotionModal myColor={myColor} handlePromotion={handlePromotion} />
        )}
      </div>
    </>
  );
};

export default ChessBoard;
