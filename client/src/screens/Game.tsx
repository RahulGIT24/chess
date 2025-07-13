import { useEffect, useRef, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { useSoundEffects } from "../hooks/useSoundEffects";
import UserDetails from "../components/UserDetails";
import WinnerModal from "../components/WinnerModal";
import Draw from "../components/Draw";
import {
  DRAW,
  DRAW_OFFER_REPLY,
  DRAW_OFFERED,
  GAME_OVER,
  INIT_GAME,
  MOVE,
  OFFER_ACCEPTED,
  OFFER_DRAW,
  OFFER_REJECTED,
  RECONNECTED,
  RECONNECTING,
  RESIGN,
  TIME_UP,
} from "../constants/messages";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ReconnectingModal from "../components/ReconnectingModal";
import OpponentDetails from "../components/OpponentDetails";
import ResignModal from "../components/ResignModal";
import DrawModal from "../components/DrawModal";
import MoveHistory from "../components/MoveHistory";

const Game = () => {
  const [isAuthenticated] = useAuth();

  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated]);

  const socket = useSocket();
  const chessRef = useRef<Chess>(new Chess());
  const [board, setBoard] = useState(chessRef.current.board());
  const [waiting, setWaiting] = useState<boolean>(false);
  const [opponentName, setOpponentName] = useState("");
  const [myTurn, setMyturn] = useState<boolean>(false);
  const [resignModal, setResignModal] = useState<boolean>(false);
  const [resignedColor, setResignedColor] = useState("");
  const [draw, setDraw] = useState(false);
  const [timeUpColor, setTimeUpColor] = useState("");
  const myColor = useRef<string | null>(null)
  const [winner, setWinner] = useState<null | string>(null);
  const [winnerModal, setWinnerModal] = useState<boolean>(false);
  const [gameLocked, setGameLocked] = useState(false);
  const [drawModal, setDrawModal] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [myTimer, setMyTimer] = useState<number>();
  const [opponentTimer, setOpponentTimer] = useState<number>();
  const [reconnecting, setReconnecting] = useState(false);
  const [drawAccepted, setDrawAccepted] = useState(false);

  const closeWinnerModal = () => {
    setWinnerModal(false);
  };

  const onResign = () => {
    if (gameLocked) return;
    setResignModal(true);
  };

  const onResignConfirm = () => {
    if (gameLocked) return;
    socket?.send(
      JSON.stringify({
        type: RESIGN,
        payload: {
          color: myColor.current,
        },
      })
    );
    setResignModal(false);
  };

  const closeResignModal = () => {
    setResignModal(false);
  };

  const offerDraw = () => {
    if (gameLocked) return;
    if (!socket) return;
    socket.send(
      JSON.stringify({
        type: OFFER_DRAW,
      })
    );
  };
  const { gamestart, gameend, move: pieceMove } = useSoundEffects();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data as string);

      switch (message.type) {
        case RECONNECTED:
          setReconnecting(false);
          setWaiting(false);

          const recoveredGame = message.payload.game;
          console.log("Restored FEN:", recoveredGame.fen);
          console.log("Restored PGN:", recoveredGame.pgn);
          console.log("Move Count:", recoveredGame.moveCount);

          const newChess = new Chess();

          if (recoveredGame.pgn) {
            newChess.loadPgn(recoveredGame.pgn);
            console.log(newChess)
          } else if (recoveredGame.fen) {
            newChess.load(recoveredGame.fen);
          }

          chessRef.current = newChess;
          setBoard(newChess.board());

          if (user?.id === recoveredGame.player1.id) {
            myColor.current = recoveredGame.player1.color;
            setMyTimer(recoveredGame.player1.timeLeft);
            setOpponentTimer(recoveredGame.player2.timeLeft);
            setOpponentName(recoveredGame.player2.name);
          } else {
            myColor.current = recoveredGame.player2.color;
            setMyTimer(recoveredGame.player2.timeLeft)
            setOpponentTimer(recoveredGame.player1.timeLeft)
            setOpponentName(recoveredGame.player1.name);
          }
          const turn = newChess.turn();
          setMyturn((turn === "w" && myColor.current === "white") || (turn === "b" && myColor.current === "black"));
          setBoard(newChess.board());

          break;

        case INIT_GAME:
          const name = message.payload.name;
          const color = message.payload.color;
          console.log("Init game color: ", color)
          const timer = message.payload.timer;
          setWaiting(false);
          chessRef.current = new Chess();
          setBoard(chessRef.current.board());
          setOpponentName(name);
          setGameStart(true);
          gamestart();
          myColor.current = color
          setMyturn(color === "white")
          setMyTimer(timer)
          setOpponentTimer(timer)
          break;
        case MOVE:
          const move = message.payload.move;
          const whiteTime = message.payload.white
          const currentColor = message.payload.currentColor
          const blackTime = message.payload.black

          try {
            chessRef.current.move(move);
            if (myColor.current === "white") {
              setMyTimer(whiteTime)
              setOpponentTimer(blackTime)
            } else {
              setMyTimer(blackTime)
              setOpponentTimer(whiteTime)
            }
            pieceMove();
            setBoard(chessRef.current.board());
            setMyturn(currentColor === myColor.current);

          } catch (error) {
            console.log(error)
          }

          break;

        case GAME_OVER:
          const winner = message.payload.winner;
          setWinner(winner);
          setWinnerModal(true);
          setGameLocked(true);
          gameend();
          break;

        case RESIGN:
          setResignedColor(message.payload.color);
          setWinnerModal(true);
          setGameLocked(true);
          break;
        case DRAW:
          setDraw(true);
          setGameLocked(true);
          break;

        case OFFER_ACCEPTED:
          setDraw(true);
          setDrawAccepted(true);
          setGameLocked(true);
          setDrawModal(false);
          break;

        case OFFER_REJECTED:
          setDrawModal(false);
          break;

        case DRAW_OFFERED:
          setDrawModal(true);
          break;

        case TIME_UP:
          setGameLocked(true);
          setWinnerModal(true);
          setWinner(message.payload.color);
          setTimeUpColor(message.payload.color == "white" ? "black" : "white");
          break;
        case RECONNECTING:
          setReconnecting(true);
          break;
        default:
          break;
      }
    };
  }, [socket]);

  useEffect(() => {
    if (myTimer === 0) {
      if (!socket) return;
      setGameLocked(true);
      setWinnerModal(true);
      socket.send(
        JSON.stringify({
          type: TIME_UP,
          payload: {
            color: myColor.current,
          }
        })
      );
    }
  }, [myTimer])

  useEffect(() => {
    if (drawAccepted) return;
    if (winnerModal) return;
    const interval = setInterval(() => {
      if (myTurn) {
        setMyTimer((prev) => {
          const updated = Math.max(0, (prev as number) - 1000);
          return updated;
        });
      } else {
        setOpponentTimer((prev) => {
          const updated = Math.max(0, (prev as number) - 1000);
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myTurn, drawAccepted, winnerModal]);

  const drawAccept = () => {
    if (gameLocked) return;
    socket?.send(
      JSON.stringify({
        type: DRAW_OFFER_REPLY,
        payload: {
          draw: true,
        },
      })
    );
    setDrawAccepted(true);
  };

  const drawReject = () => {
    if (gameLocked) return;
    socket?.send(
      JSON.stringify({
        type: DRAW_OFFER_REPLY,
        payload: {
          draw: false,
        },
      })
    );
  }

  useEffect(() => {
    console.log(chessRef.current.history())
  }, [chessRef.current])

  if (!socket) return <div>Connecting......</div>;
  return (
    <div className="h-screen w-full bg-zinc-800 text-white">
      {
        reconnecting && <ReconnectingModal />
      }
      {((winner && winnerModal) ||
        (winnerModal && resignedColor) ||
        winnerModal) && (
          <WinnerModal
            winner={winner as string}
            closeModal={closeWinnerModal}
            myColor={myColor.current as string}
            opponentName={opponentName}
            resignedColor={resignedColor as string}
            timeUpColor={timeUpColor}
          />
        )}
      {draw && (
        <Draw
          onClose={() => {
            setDraw(false);
          }}
        />
      )}
      <ResignModal resignModal={resignModal} closeResignModal={closeResignModal} onResignConfirm={onResignConfirm} />
      <DrawModal drawModal={drawModal} drawAccept={drawAccept} drawReject={drawReject} />
      <div className="justify-center flex">
        <div className="pt-8 w-full flex justify-center items-center">
          <div className="flex justify-center items-center w-full h-[95vh]">
            <div className="flex justify-center items-start flex-col px-12">
              <div className="flex gap-x-5 h-full">
                <div className="w-full">
                  <OpponentDetails
                    name={opponentName ? opponentName : "Opponent"}
                    timer={opponentTimer}
                  />
                  <ChessBoard
                    gamelocked={gameLocked}
                    setBoard={setBoard}
                    chess={chessRef.current}
                    board={board}
                    socket={socket}
                    myColor={myColor.current as string}
                  />
                  <UserDetails
                    color={myColor.current === "white" ? "w" : "b"}
                    myTimer={myTimer}
                  />
                </div>

                <div className="w-full h-full flex flex-col items-center">
                  <div className="w-[20vw] h-[85vh] bg-zinc-900 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <MoveHistory setWaiting={setWaiting} socket={socket} gameStarted={gameStart} moveHistory={chessRef.current.history()} offerDraw={offerDraw} onResign={onResign} waiting={waiting}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
