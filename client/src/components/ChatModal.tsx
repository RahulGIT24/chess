import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CHAT } from "../constants/messages";
import { IMessage } from "../lib/types";
import { MessageCircle, SendHorizonal } from "lucide-react";


const ChatModal = ({
  setOpen,
  socket,
  messages,
  setMessages
}: {
  setOpen: (args: boolean) => void;
  socket: WebSocket | undefined;
  messages: IMessage[],
  setMessages: Dispatch<SetStateAction<IMessage[]>>
}) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);


  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { sender: "me", text: message }]);

    setMessage("");
    if (socket) {
      socket.send(JSON.stringify({ type: CHAT, text: message }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
      <div className="panel flex h-[80vh] w-[90%] max-w-md animate-fade-up flex-col overflow-hidden !rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <h2 className="flex items-center gap-2.5 font-display text-xl text-cream">
            <MessageCircle className="h-5 w-5 text-gold-400" />
            Game chat
          </h2>
          <button
            className="text-lg text-cream/40 transition-colors hover:text-cream"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="pt-8 text-center text-sm text-cream/30">
              Say hello to your opponent.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${msg.sender === "me"
                  ? "rounded-br-md bg-gold-500 font-medium text-ink-950"
                  : "rounded-bl-md border border-white/10 bg-white/[0.05] text-cream"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-white/[0.06] p-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold-500/50"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 transition-all hover:from-gold-300 hover:to-gold-500 active:scale-95"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
