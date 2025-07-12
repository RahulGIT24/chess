import { useEffect, useRef, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { useSoundEffects } from "../hooks/useSoundEffects";
import SideMenu from "../components/SideMenu";
import UserDetails from "../components/UserDetails";
import UserMovesSection from "../components/UserMovesSection";
import WinnerModal from "../components/WinnerModal";
import ConfirmationModal from "../components/ConfirmationModal";
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ReconnectingModal from "../components/ReconnectingModal";

export interface UserMoves {
  piece: string;
  place: string;
}

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
  // const [chess, setChess] = useState(new Chess());
  const chessRef = useRef<Chess>(new Chess());
  const [board, setBoard] = useState(chessRef.current.board());

  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [waiting, setWaiting] = useState<null | boolean>(null);
  const [opponentName, setOpponentName] = useState("");
  const [time, setTime] = useState<number | null>(null);
  const [myTurn, setMyturn] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<null | string>(null);

  const [resignModal, setResignModal] = useState<boolean>(false);
  const [resignedColor, setResignedColor] = useState("");
  const [draw, setDraw] = useState(false);
  const [timeUpColor, setTimeUpColor] = useState("");
  const [myColor, setMyColor] = useState("");
  const [opponentMoves, setOpponentMoves] = useState<UserMoves[]>([]);
  const [myMoves, setMyMoves] = useState<UserMoves[]>([]);
  const [winner, setWinner] = useState<null | string>(null);
  const [winnerModal, setWinnerModal] = useState<boolean>(false);
  const [gameLocked, setGameLocked] = useState(false);
  const [drawModal, setDrawModal] = useState(false);
  const [gameStart, setGameStart] = useState(false);

  const [myTimer, setMyTimer] = useState<number>();
  const [opponentTimer, setOpponentTimer] = useState<number>();

  const [reconnecting, setReconnecting] = useState(false);

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
          color: myColor,
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
            setMyColor(recoveredGame.player1.color);
            setMyTimer(recoveredGame.player1.timeLeft);
            setOpponentTimer(recoveredGame.player2.timeLeft);
            setOpponentName(recoveredGame.player2.name);
          } else {
            setMyColor(recoveredGame.player2.color);
            setMyTimer(recoveredGame.player2.timeLeft)
            setOpponentTimer(recoveredGame.player1.timeLeft)
            setOpponentName(recoveredGame.player1.name);
          }

          setTimeout(() => {
            const turn = newChess.turn();
            setMyturn((turn === "w" && myColor === "white") || (turn === "b" && myColor === "black"));
            setCurrentTurn(turn);
            setBoard(newChess.board());
          }, 100); // Give React some time to update

          break;

        case INIT_GAME:
          const name = message.payload.name;
          const color = message.payload.color;
          console.log("Init game color: ", color)
          const timer = message.payload.timer;
          setWaiting(false);
          chessRef.current = new Chess();
          setBoard(chessRef.current.board());
          setStarted(true);
          setOpponentName(name);
          setGameStart(true);
          gamestart();
          setMyColor(color)
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
            const moveRes = chessRef.current.move(move);
            setOpponentMoves((prev) => [
              { piece: moveRes.piece, place: move.to },
              ...prev,
            ]);
            if (myColor === "white") {
              setMyTimer(whiteTime)
              setOpponentTimer(blackTime)
            } else {
              setMyTimer(blackTime)
              setOpponentTimer(whiteTime)
            }
            pieceMove();
            setBoard(chessRef.current.board());
            setMyturn(currentColor === myColor);
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
    const interval = setInterval(() => {
      if (myTurn) {
        setMyTimer((prev) => {
          const updated = Math.max(0, prev - 1000);
          return updated;
        });
      } else {
        setOpponentTimer((prev) => {
          const updated = Math.max(0, prev - 1000);
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myTurn]);


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
  };

  useEffect(() => {
    setCurrentTurn(myTurn ? myColor : myColor === "white" ? "black" : "white");
  }, [myTurn]);


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
            myColor={myColor}
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
      {resignModal && (
        <ConfirmationModal
          text="Do You want to Resign?"
          buttons={[
            {
              text: "Yes",
              func: onResignConfirm,
            },
            {
              text: "No",
              func: closeResignModal,
            },
          ]}
        />
      )}
      {drawModal && (
        <ConfirmationModal
          text="Opponent Offered Draw"
          buttons={[
            {
              text: "Accept",
              func: drawAccept,
            },
            {
              text: "Reject",
              func: drawReject,
            },
          ]}
        />
      )}
      <div className="justify-center flex">
        <div className="pt-8 w-full flex justify-center items-center">
          <div className="flex justify-center items-center w-full h-[95vh]">
            <div className="flex justify-center items-start flex-col px-12">
              <UserMovesSection
                moves={opponentMoves}
                color={myColor === "black" ? "white" : "black"}
              />
              <UserDetails
                name={opponentName ? opponentName : "Opponent"}
                color={myColor === "white" ? "b" : "w"}
                opponentTimer={opponentTimer}
              />
              <ChessBoard
                gamelocked={gameLocked}
                setBoard={setBoard}
                chess={chessRef.current}
                board={board}
                socket={socket}
                myColor={myColor}
                setMyMoves={setMyMoves}
                setMyTurn={setMyturn}
              />
              <UserDetails
                color={myColor === "white" ? "w" : "b"}
                onResign={opponentName ? onResign : null}
                offerDraw={opponentName ? offerDraw : null}
                myTimer={myTimer}
              />
              <UserMovesSection moves={myMoves} color={myColor} />
            </div>
            <SideMenu
              // name={name}
              setName={setName}
              setWaiting={setWaiting}
              waiting={waiting}
              socket={socket}
              started={started}
            />
          </div>
        </div>
        {waiting === true && (
          <div className="w-full flex justify-center items-center flex-col gap-y-5">
            <img src="/waiting.gif" alt="waiting" />
            <p className="font-bold text-2xl">Finding Players......</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
