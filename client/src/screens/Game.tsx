import { useEffect, useState } from "react";
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
  RESIGN,
  TIME_UP,
} from "../constants/messages";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export interface UserMoves {
  piece: string;
  place: string;
}

const Game = () => {
  const [searchParams] = useSearchParams();
  const isGuest = useSelector((state: RootState) => state.user.isGuest);

  const [usr,isAuthenticated] = useAuth();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    console.log("guest :",isGuest, isAuthenticated,user,usr)
    if(!user?.name){
      
      navigate("/")
      console.log('here')
    }
    if (!isGuest && !isAuthenticated) {
      navigate("/");
      console.log('there')
    }
  }, [isGuest, isAuthenticated, navigate]);




  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
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
  const [gameStart,setGameStart] = useState(false);

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
        case INIT_GAME:
          const name = message.payload.name;
          const color = message.payload.color;
          const timer = message.payload.timer;
          setWaiting(false);
          setBoard(chess.board());
          setStarted(true);
          setOpponentName(name);
          setTime(timer);
          setGameStart(true);
          gamestart();
          if (color == "white") {
            setMyColor("black");
          } else {
            setMyturn(true);
            setMyColor("white");
          }
          break;
        case MOVE:
          const move = message.payload;
          const moveRes = chess.move(move);

          setOpponentMoves((prev) => [
            { piece: moveRes.piece, place: move.to },
            ...prev,
          ]);
          setMyturn(true);
          pieceMove();
          setBoard(chess.board());
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
          setWinner(message.payload.color)
          setTimeUpColor(message.payload.color=="white"?"black":"white")
          break;
        default:
          break;
      }
    };
  }, [socket]);

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
    setCurrentTurn(chess.turn());
  }, [chess, time]);

  if (!socket) return <div>Connecting......</div>;
  return (
    <div className="h-screen w-full bg-zinc-800 text-white">
      {((winner && winnerModal) ||
        (winnerModal && resignedColor) ||
        winnerModal) && (
        <WinnerModal
          winner={winner as string}
          closeModal={closeWinnerModal}
          myColor={myColor}
          name={name}
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
                time={time}
                color={myColor === "white" ? "b" : "w"}
                myTurn={!myTurn}
                gameStart={gameStart}
              />
              <ChessBoard
                gamelocked={gameLocked}
                setBoard={setBoard}
                chess={chess}
                board={board}
                socket={socket}
                myColor={myColor}
                setMyMoves={setMyMoves}
                setMyTurn={setMyturn}
              />
              <UserDetails
                // name={name ? name : "Your Name"}
                time={time}
                color={myColor === "white" ? "w" : "b"}
                onResign={opponentName ? onResign : null}
                offerDraw={opponentName ? offerDraw : null}
                myTurn={myTurn}
                socket={socket}
                gameStart={gameStart}
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
