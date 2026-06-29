"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deliverable: string | null;
}

const API_URL = "http://127.0.0.1:8000/api/chat";
const APPROVE_URL = "http://127.0.0.1:8000/api/approve-plan";

export function useApiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [finalIdea, setFinalIdea] = useState<string | null>(null);
  const [proposedPlan, setProposedPlan] = useState<TaskItem[] | null>(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
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
      if (!messageText.trim() || loading || isReady || waitingForApproval) return;

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

        if (data.waiting_for_approval) {
          setWaitingForApproval(true);
          if (data.proposed_plan) setProposedPlan(data.proposed_plan);
          if (data.plan_approved !== undefined) setPlanApproved(data.plan_approved);
        }
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
    [input, loading, isReady, waitingForApproval, threadId, addMessage]
  );

  const approvePlan = useCallback(async () => {
    setApprovalLoading(true);
    try {
      const response = await fetch(APPROVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, approved: true }),
      });

      if (!response.ok) throw new Error("Error al aprobar el plan.");

      const data = await response.json();
      addMessage("assistant", data.message);
      setPlanApproved(true);
      setWaitingForApproval(false);
    } catch (err) {
      console.error(err);
      setError("Error al aprobar el plan.");
    } finally {
      setApprovalLoading(false);
    }
  }, [threadId, addMessage]);

  const rejectPlan = useCallback(async () => {
    setApprovalLoading(true);
    try {
      const response = await fetch(APPROVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          approved: false,
          feedback: feedback || "El usuario solicitó cambios generales.",
        }),
      });

      if (!response.ok) throw new Error("Error al rechazar el plan.");

      const data = await response.json();
      addMessage("assistant", data.message);
      setPlanApproved(false);
      setWaitingForApproval(false);
      setProposedPlan(null);
      setIsReady(false);
      setFeedback("");
    } catch (err) {
      console.error(err);
      setError("Error al rechazar el plan.");
    } finally {
      setApprovalLoading(false);
    }
  }, [threadId, feedback, addMessage]);

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
    setProposedPlan(null);
    setPlanApproved(false);
    setWaitingForApproval(false);
    setFeedback("");
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
    proposedPlan,
    planApproved,
    waitingForApproval,
    approvalLoading,
    feedback,
    setFeedback,
    threadId,
    error,
    messagesEndRef,
    sendMessage,
    approvePlan,
    rejectPlan,
    resetChat,
  };
}
