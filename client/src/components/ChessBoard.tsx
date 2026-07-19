import { PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { useSoundEffects } from "../hooks/useSoundEffects";
import PromotionModal from "./PromotionModal";
import { ERROR, MOVE } from "../constants/messages";
import { ChessBoardProps } from "../lib/types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

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
      } catch {
        setFrom(null);
        setTo(null);
        return;
      }
    }
  };

  const rotate = myColor === "black" ? "rotate-180" : "";

  return (
    <div
      className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl shadow-board ${rotate}`}
    >
      <div className="grid h-full w-full grid-rows-8">
        {board.map((row, i) => {
          return (
            <div key={i} className="grid grid-cols-8">
              {row.map((square, j) => {
                const squareRepresentation = (String.fromCharCode(
                  97 + (j % 8)
                ) +
                  "" +
                  (8 - i)) as Square;
                const isLight = (i + j) % 2 === 0;
                const isSelected = from === squareRepresentation;
                return (
                  <div
                    key={j}
                    className={`relative flex cursor-pointer items-center justify-center ${
                      isLight ? "bg-board-light" : "bg-board-dark"
                    }`}
                    onClick={() => {
                      handlePieceMove(squareRepresentation);
                    }}
                  >
                    {/* Selection highlight */}
                    {isSelected && (
                      <span className="pointer-events-none absolute inset-0 bg-gold-500/50 ring-2 ring-inset ring-gold-600" />
                    )}

                    {/* Coordinates */}
                    {j === 0 && (
                      <span
                        className={`pointer-events-none absolute left-1 top-0.5 font-mono text-[0.6rem] font-semibold ${
                          isLight ? "text-board-dark" : "text-board-light"
                        } ${rotate}`}
                      >
                        {8 - i}
                      </span>
                    )}
                    {i === 7 && (
                      <span
                        className={`pointer-events-none absolute bottom-0.5 right-1 font-mono text-[0.6rem] font-semibold ${
                          isLight ? "text-board-dark" : "text-board-light"
                        } ${rotate}`}
                      >
                        {FILES[j]}
                      </span>
                    )}

                    {square && (
                      <img
                        src={`/${square.color === "b"
                            ? square.type
                            : square.type.toUpperCase() + " copy"
                          }.png`}
                        alt=""
                        className={`relative z-10 h-[82%] w-[82%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] ${rotate}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {promotion && (
        <PromotionModal myColor={myColor} handlePromotion={handlePromotion} />
      )}
    </div>
  );
};

export default ChessBoard;
