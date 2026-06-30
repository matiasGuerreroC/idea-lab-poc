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

function renderContent(text: string) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts: { type: "text" | "code"; lang?: string; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }

  return parts.map((part, i) => {
    if (part.type === "code") {
      return (
        <div key={i} className="mt-3 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
          {part.lang && (
            <div className="px-4 py-1.5 border-b border-white/5 text-code-sm text-on-surface-variant/60 font-mono">
              {part.lang}
            </div>
          )}
          <pre className="p-4 font-mono text-code-md text-secondary overflow-x-auto whitespace-pre-wrap">
            {part.content}
          </pre>
        </div>
      );
    }
    return (
      <p key={i} className="whitespace-pre-wrap text-body-md text-on-surface leading-relaxed [&:not(:first-child)]:mt-2">
        {part.content}
      </p>
    );
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
            ? "bg-secondary text-on-secondary"
            : "bg-primary-container text-on-primary-container"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`px-4 py-3 ${
            isUser
              ? "bg-surface-container-high border border-outline-variant rounded-2xl rounded-tr-none"
              : "glass-panel rounded-2xl rounded-tl-none"
          }`}
        >
          {renderContent(text)}
        </div>
        <div className={`flex gap-2 mt-1 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-label-caps text-on-surface-variant/60 text-[10px]">
            {formatTime(timestamp)}
          </span>
          <span className={`text-label-caps text-[10px] ${isUser ? "text-secondary" : "text-primary"}`}>
            {isUser ? "ARQUITECTO" : "AI AGENT"}
          </span>
        </div>
      </div>
    </div>
  );
}
