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
} from "../constants/messages";

export interface UserMoves {
  piece: string;
  place: string;
}

const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [waiting, setWaiting] = useState<null | boolean>(null);
  const [opponentName, setOpponentName] = useState("");
  const [time, setTime] = useState<number>(0);
  const [myTurn, setMyturn] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<null | string>(null);

  const [resignModal, setResignModal] = useState<boolean>(false);
  const [resignedColor, setResignedColor] = useState("");
  const [draw, setDraw] = useState(false);

  // const [opponentColor, setOpponentColor] = useState("");
  const [myColor, setMyColor] = useState("");
  const [opponentMoves, setOpponentMoves] = useState<UserMoves[]>([]);
  const [myMoves, setMyMoves] = useState<UserMoves[]>([]);
  const [winner, setWinner] = useState<null | string>(null);
  const [winnerModal, setWinnerModal] = useState<boolean>(false);
  const [gameLocked, setGameLocked] = useState(false);
  const [drawModal,setDrawModal] = useState(false);

  const closeWinnerModal = () => {
    setWinnerModal(false);
  };

  const onResign = () => {
    if(gameLocked) return;
    setResignModal(true);
  };

  const onResignConfirm = () => {
      if(gameLocked) return;
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

  const closeResignModal = ()=>{
    setResignModal(false);
  }


  const offerDraw = () => {
    if(gameLocked) return;
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
          // setOpponentColor(color);
          gamestart();
          if (color == "white") {
            setMyColor("black");
          } else {
            console.log("white");
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
          // setWinner(message.payload.color === "white" ? "black" : "white");
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
          break

        case OFFER_REJECTED:
          setDrawModal(false);
          break;
        
        case DRAW_OFFERED:
          setDrawModal(true)
          break

        default:
          break;
      }
    };
  }, [socket]);

  const drawAccept = () =>{
    if(gameLocked) return;
    socket?.send(JSON.stringify({
      type:DRAW_OFFER_REPLY,
      payload:{
        draw:true
      }
    }))
  }
  const drawReject = () =>{
    if(gameLocked) return;
    socket?.send(JSON.stringify({
      type:DRAW_OFFER_REPLY,
      payload:{
        draw:false
      }
    }))
  }

  useEffect(() => {
    setCurrentTurn(chess.turn());
  }, [chess,time]);

  if (!socket) return <div>Connecting......</div>;
  return (
    <div className="h-screen w-full bg-zinc-800 text-white">
      {((winner && winnerModal) || (winnerModal && resignedColor)) && (
        <WinnerModal
          winner={winner as string}
          closeModal={closeWinnerModal}
          myColor={myColor}
          name={name}
          opponentName={opponentName}
          resignedColor={resignedColor as string}
        />
      )}
      {draw && <Draw onClose={()=>{setDraw(false)}}/>}
      {resignModal && (
        <ConfirmationModal
          text="Do You want to Resign?"
          buttons={[
            {
              text:"Yes",
              func:onResignConfirm
            },
            {
              text:"No",
              func:closeResignModal
            }
          ]}
        />
      )}
      {drawModal && (
        <ConfirmationModal
          text="Opponent Offered Draw"
          buttons={[
            {
              text:"Accept",
              func:drawAccept
            },
            {
              text:"Reject",
              func:drawReject
            }
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
                setTime={setTime}
                color={myColor === "white" ? "b" : "w"}
                currentTurn={currentTurn}
                myTurn ={!myTurn}
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
                name={name ? name : "Your Name"}
                time={time}
                setTime={setTime}
                color={myColor === "white" ? "w" : "b"}
                currentTurn={currentTurn}
                onResign={opponentName ? onResign : null}
                offerDraw={opponentName ? offerDraw : null}
                myTurn ={myTurn}
                socket={socket}

              />
              <UserMovesSection moves={myMoves} color={myColor} />
            </div>
            <SideMenu
              name={name}
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
