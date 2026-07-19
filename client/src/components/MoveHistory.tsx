import { Flag, Handshake, History, Loader2, LogOut, MessageCircle, Swords } from "lucide-react";
import { useState } from "react";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../lib/apiCall";
import toast from "react-hot-toast";
import { GET } from "../constants/methods";
import Button from "./Button";
import DropDown from "./DropDown";
import { INIT_GAME } from "../constants/messages";
import { MoveHistoryComponent } from "../lib/types";
import ChatModal from "./ChatModal";

const MoveHistory = ({
  moveHistory,
  messages,
  setMessages,
  offerDraw,
  onResign,
  waiting,
  gameStarted,
  setWaiting,
  socket,
  viewGame,
}: MoveHistoryComponent) => {
  const [time, setTime] = useState<string>("10 M");
  const options = ["1 M", "10 M", "20 M", "30 M", "60 M"];
  const [openChatModal, setOpenChatModal] = useState(false);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);
  const logout = async () => {
    try {
      const res = await apiCall({ data: {}, url: "/auth/logout", method: GET });
      toast.success(res.message);
      navigate("/");
      return;
    } catch (error) {
      return error;
    }
  };
  return (
    <>
      {openChatModal && (
        <ChatModal
          setOpen={setOpenChatModal}
          socket={socket}
          messages={messages}
          setMessages={setMessages}
        />
      )}

      {/* Panel header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-lg text-gold-400">
            ♞
          </span>
          <p className="font-display text-xl tracking-wide text-cream">
            {gameStarted ? "Move sheet" : "Chess Arena"}
          </p>
        </div>
        {gameStarted && (
          <button
            title="Game chat"
            onClick={() => {
              setOpenChatModal(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-cream/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Move list */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {moveHistory.map((_: unknown, index: number) => {
          if (index % 2 !== 0) return null;
          return (
            <div
              key={index}
              className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-sm odd:bg-white/[0.02]"
            >
              <span className="text-cream/30">{index / 2 + 1}.</span>
              <span className="rounded-md bg-white/[0.06] px-2 py-1 text-center font-medium text-cream">
                {moveHistory[index]}
              </span>
              <span
                className={`rounded-md px-2 py-1 text-center font-medium ${moveHistory[index + 1] ? "bg-ink-900 text-cream/80" : ""}`}
              >
                {moveHistory[index + 1] ?? ""}
              </span>
            </div>
          );
        })}
      </div>

      {!viewGame && (
        <>
          {!waiting && !gameStarted && (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="flex w-full flex-col gap-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/40">
                  Time control
                </p>
                <DropDown
                  classname="w-full"
                  selected={time}
                  setSelected={setTime}
                  options={options}
                />
              </div>
              <Button
                disabled={user?.name && user?.name.length > 3 ? false : true}
                classname="mt-5 w-full py-4 text-xl font-bold shadow-glow"
                onClick={() => {
                  socket?.send(
                    JSON.stringify({
                      type: INIT_GAME,
                      name: user?.name,
                      time: time,
                      id: user?.id,
                      profilePicture: user?.profilePicture,
                    }),
                  );
                  if (setWaiting) setWaiting(true);
                }}
              >
                <Swords className="h-5 w-5" />
                Play
              </Button>
            </div>
          )}
          {waiting && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-4">
              <span className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/20" />
                <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
              </span>
              <p className="text-sm text-cream/60">Searching for players…</p>
            </div>
          )}
          {/* Buttons */}
          {gameStarted && (
            <div className="mt-4 flex justify-between gap-3 border-t border-white/[0.06] pt-4">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/25 bg-gold-500/10 px-3 py-2.5 text-sm font-medium text-gold-300 transition-colors hover:bg-gold-500/20"
                onClick={offerDraw}
              >
                <Handshake size={16} />
                Offer draw
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
                onClick={onResign}
              >
                <Flag size={16} />
                Resign
              </button>
            </div>
          )}
          {gameStarted === false && !waiting && (
            <div className="mt-4 flex flex-col gap-y-2.5 border-t border-white/[0.06] pt-4">
              <button
                onClick={() => {
                  navigate("/mygames");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-cream/80 transition-colors hover:border-gold-500/40 hover:text-gold-300"
              >
                <History className="h-4 w-4" />
                Game history
              </button>
              <button
                onClick={() => {
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-cream/50 transition-colors hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MoveHistory;
