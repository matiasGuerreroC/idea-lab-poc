"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const API_URL = "http://127.0.0.1:8000/api/chat";

export function useApiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [finalIdea, setFinalIdea] = useState<string | null>(null);
  const [threadId, setThreadId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThreadId(`test-thread-${Math.floor(Math.random() * 100000)}`);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((sender: "user" | "assistant", text: string) => {
    setMessages((prev) => [...prev, { sender, text, timestamp: new Date() }]);
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || input;
      if (!messageText.trim() || loading || isReady) return;

      const userText = messageText.trim();
      setInput("");
      setLoading(true);
      setError(null);

      addMessage("user", userText);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, message: userText }),
        });

        if (!response.ok) throw new Error("Error al conectar con el backend.");

        const data = await response.json();

        addMessage("assistant", data.response);
        setIsReady(data.is_ready_for_planning);
        if (data.final_idea) setFinalIdea(data.final_idea);
      } catch (err) {
        console.error(err);
        setError(
          "No se pudo conectar con el backend. Asegúrate de que esté corriendo en http://127.0.0.1:8000"
        );
        addMessage(
          "assistant",
          "Error de conexión: Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000"
        );
      } finally {
        setLoading(false);
      }
    },
    [input, loading, isReady, threadId, addMessage]
  );

  const resetChat = useCallback(() => {
    setThreadId(`test-thread-${Math.floor(Math.random() * 100000)}`);
    setMessages([
      {
        sender: "assistant",
        text: "¡Hola de nuevo! Iniciemos una nueva idea. ¿Qué tienes pensado construir?",
        timestamp: new Date(),
      },
    ]);
    setIsReady(false);
    setFinalIdea(null);
    setError(null);
    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    isReady,
    finalIdea,
    threadId,
    error,
    messagesEndRef,
    sendMessage,
    resetChat,
  };
}
