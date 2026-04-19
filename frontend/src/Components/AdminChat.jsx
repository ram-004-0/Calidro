import React, { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { useChat } from "../context/ChatContext";

const AdminChat = () => {
  const { messages, sendMessage, activeRoom } = useChat();
  const [reply, setReply] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = () => {
    if (!reply.trim()) return;
    sendMessage(reply, "admin");
    setReply("");
  };

  if (!activeRoom) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs italic bg-gray-50 border-l">
        <User size={32} className="opacity-20 mb-2" />
        <p>Select a user to begin live support</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase">
          Chatting with: <span className="text-[#4a3733]">{activeRoom}</span>
        </span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>

      <div className="flex-1 p-6 bg-[#fbfbfb] space-y-4 overflow-y-auto no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-2xl text-xs max-w-[80%] shadow-sm ${
                m.isSystem
                  ? "bg-amber-50 text-amber-700 italic border w-full text-center"
                  : m.sender === "admin"
                    ? "bg-[#4a3733] text-white rounded-tr-none"
                    : "bg-white border text-gray-700 rounded-tl-none"
              }`}
            >
              <p>{m.text}</p>
              <div className="text-[7px] mt-1 opacity-40 uppercase text-right">
                {m.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t flex gap-3">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleReply()}
          placeholder="Type a reply..."
          className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-xs outline-none focus:border-[#4a3733]/30"
        />
        <button
          onClick={handleReply}
          disabled={!reply.trim()}
          className="bg-[#4a3733] text-white p-3 rounded-xl disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminChat;
