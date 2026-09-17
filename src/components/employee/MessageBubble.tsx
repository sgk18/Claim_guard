import React from "react";
import { CheckCheck } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text?: string;
  imageUrl?: string;
  timestamp: string;
  type?: "text" | "card" | "status";
}

interface Props {
  message: ChatMessage;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex w-full my-1.5 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
          isUser
            ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none border border-[#c4e8ab]"
            : "bg-white text-slate-800 rounded-tl-none border border-slate-200/80"
        }`}
      >
        {/* Attached image if any */}
        {message.imageUrl && (
          <div className="mb-2 overflow-hidden rounded-xl border border-slate-200/60 max-h-56 bg-slate-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Receipt Preview"
              className="w-full object-contain max-h-56"
            />
          </div>
        )}

        {/* Message body text */}
        {message.text && (
          <p className="whitespace-pre-line leading-relaxed text-[13.5px] select-text">
            {message.text}
          </p>
        )}

        {/* Timestamp & double tick status */}
        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isUser ? "text-slate-500" : "text-slate-400"}`}>
          <span>{message.timestamp}</span>
          {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-600" />}
        </div>
      </div>
    </div>
  );
};
