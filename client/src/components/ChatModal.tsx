import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CHAT } from "../constants/messages";
import { IMessage } from "../lib/types";


const ChatModal = ({
  setOpen,
  socket,
  messages,
setMessages
}: {
  setOpen: (args: boolean) => void;
  socket: WebSocket | undefined;
  messages:IMessage[],
  setMessages:Dispatch<SetStateAction<IMessage[]>>
}) => {
  const [message, setMessage] = useState("");

//   const [messages, setMessages] = useState<IMessage[]>([]);

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-zinc-800 w-[90%] max-w-md h-[80vh] rounded-2xl shadow-lg flex flex-col text-white">
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Game Chat</h2>
          <button
            className="text-gray-400 hover:text-gray-200 text-xl"
            onClick={() => setOpen(false)}
          >
            ✖
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg,i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] ${
                  msg.sender === "me" ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-700 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-700 rounded-xl px-4 py-2 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
