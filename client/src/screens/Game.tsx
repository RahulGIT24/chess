import { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { useSoundEffects } from "../hooks/useSoundEffects";
import SideMenu from "../components/SideMenu";
import UserDetails from "../components/UserDetails";
import UserMovesSection from "../components/UserMovesSection";
import WinnerModal from "../components/WinnerModal";
import Resign from "../components/Resign";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const ERROR = "error";
export const RESIGN = "resign";

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
  const [resigned,setResigned] = useState<boolean>(false)
  // const [opponentColor, setOpponentColor] = useState("");
  const [resignDialogBox, setResingDialogBox] = useState<boolean>(false);
  const [myColor, setMyColor] = useState("");
  const [opponentMoves, setOpponentMoves] = useState<UserMoves[]>([]);
  const [myMoves, setMyMoves] = useState<UserMoves[]>([]);
  const [winner, setWinner] = useState<null | string>(null);
  const [winnerModal, setWinnerModal] = useState<boolean>(false);

  const closeWinnerModal = () => {
    setWinnerModal(false);
  };


  function handleResign(){
    if(resigned){
      socket?.send( JSON.stringify({
        type: RESIGN,
        payload: {
          message: "Player resigned",
        },
      }))
    }
    setResingDialogBox(false)

  }
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
            console.log("black");
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
          console.log("My Color ", myColor);
          setWinner(winner);
          setWinnerModal(true);
          setWinnerModal(true);
          gameend();
          break;
        case RESIGN:

          break;
        default:
          break;
      }
    };
  }, [socket]);

  useEffect(() => {
    // console.log('this',chess.turn());
    setCurrentTurn(chess.turn());
  }, [chess, time]);


  if (!socket) return <div>Connecting......</div>;

  return (
    <div className="h-screen w-full bg-zinc-800 text-white">
      {winner && winnerModal && (
        <WinnerModal winner={winner as string} closeModal={closeWinnerModal} />
      )}

      {resignDialogBox && <Resign setResignDialogBox={setResingDialogBox} handleResign={handleResign} setResigned={setResigned}/>}
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
                opponent={true}
                time={time}
                setTime={setTime}
                color={myColor === "white" ? "b" : "w"}
                currentTurn={currentTurn}
                setResignDialogBox={setResingDialogBox}
              />
              <ChessBoard
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
                opponent={false}
                setTime={setTime}
                color={myColor === "white" ? "w" : "b"}
                currentTurn={currentTurn}
                setResignDialogBox={setResingDialogBox}
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
