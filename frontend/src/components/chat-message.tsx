"use client";

import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatMessageProps {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessage({ sender, text, timestamp }: ChatMessageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isUser = sender === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </div>

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 dark:bg-blue-500 text-white rounded-br-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
