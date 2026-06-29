"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "./chat-message";

interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  isReady: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendMessage: () => void;
  threadId: string;
}

export function ChatBox({
  messages,
  input,
  setInput,
  loading,
  isReady,
  messagesEndRef,
  sendMessage,
  threadId,
}: ChatBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Idea Lab - Triage
        </h1>
        <p className="text-xs text-blue-100 font-mono">
          Conversación: {threadId}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-spin" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || isReady}
            placeholder={
              isReady
                ? "Idea lista para planificación..."
                : "Escribe tu idea..."
            }
            rows={1}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || isReady || !input.trim()}
            className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
