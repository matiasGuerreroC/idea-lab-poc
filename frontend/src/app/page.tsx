"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  sender: "user" | "assistant";
  text: string;
}

function Phase1TestPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "assistant", text: "¡Hola! Cuéntame, ¿qué idea de aplicación tienes en mente hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [finalIdea, setFinalIdea] = useState<string | null>(null);
  const [threadId, setThreadId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThreadId(`test-thread-${Math.floor(Math.random() * 100000)}`);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId,
          message: userText,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al conectar con el backend.");
      }

      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "assistant", text: data.response }]);
      setIsReady(data.is_ready_for_planning);
      if (data.final_idea) {
        setFinalIdea(data.final_idea);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "⚠️ Error de conexión: Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* SECCIÓN IZQUIERDA: El Chat de Triage */}
      <div className="flex flex-col flex-1 h-full border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-lg font-bold text-blue-400">Fase 1: Triage & Entrevista</h1>
          <p className="text-xs text-slate-400">ID de Conversación: <span className="font-mono text-slate-300">{threadId}</span></p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none p-3 text-sm animate-pulse">
                El agente está pensando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || isReady}
              placeholder={isReady ? "La idea ya está lista para planificación." : "Escribe tu idea o responde al agente..."}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || isReady}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition-colors"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN DERECHA: Panel de Estado del Proyecto */}
      <div className="w-80 h-full bg-slate-900 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <h2 className="text-md font-bold tracking-wider text-slate-400 uppercase">Panel de Control</h2>
          
          <div className="space-y-2">
            <span className="text-xs text-slate-500">Estado del Proyecto:</span>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isReady ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
              <span className={`text-sm font-semibold ${isReady ? "text-green-400" : "text-yellow-400"}`}>
                {isReady ? "Listo para Planificación" : "En Fase de Triage"}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">Resumen Técnico de la Idea:</span>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-64 overflow-y-auto text-xs text-slate-300 leading-relaxed font-mono">
              {finalIdea ? (
                <div className="whitespace-pre-wrap">{finalIdea}</div>
              ) : (
                <span className="text-slate-600 italic">El resumen técnico se generará de manera automática una vez que la idea esté lo suficientemente clara para el agente de triage.</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setThreadId(`test-thread-${Math.floor(Math.random() * 100000)}`);
            setMessages([{ sender: "assistant", text: "¡Hola de nuevo! Iniciemos una nueva idea. ¿Qué tienes pensado construir?" }]);
            setIsReady(false);
            setFinalIdea(null);
          }}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
        >
          Iniciar Nueva Idea
        </button>
      </div>

    </div>
  );
}

// Exportación al final para evitar problemas de resolución de Webpack
export default Phase1TestPage;