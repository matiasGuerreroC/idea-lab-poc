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

const API_URL = "http://127.0.0.1:8000/api";
const TIMEOUT_MS = 120_000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export function useApiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
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
      if (!messageText.trim() || loading || planning || isReady || waitingForApproval) return;

      const userText = messageText.trim();
      setInput("");
      setLoading(true);
      setError(null);

      addMessage("user", userText);

      try {
        // Paso 1: Solo Triage
        const triageResponse = await fetchWithTimeout(
          `${API_URL}/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thread_id: threadId, message: userText }),
          },
          TIMEOUT_MS
        );

        if (!triageResponse.ok) {
          const errBody = await triageResponse.json().catch(() => ({}));
          throw new Error(errBody.detail || "Error en el servidor.");
        }

        const triageData = await triageResponse.json();

        addMessage("assistant", triageData.response);
        setIsReady(triageData.is_ready_for_planning);

        if (triageData.final_idea) {
          setFinalIdea(triageData.final_idea);
        }

        // Paso 2: Si la idea está lista, llamar al Planner
        if (triageData.is_ready_for_planning) {
          addMessage("assistant", "Generando plan de trabajo... esto puede tomar unos segundos.");
          setPlanning(true);

          const planResponse = await fetchWithTimeout(
            `${API_URL}/plan`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ thread_id: threadId, message: "" }),
            },
            TIMEOUT_MS
          );

          if (!planResponse.ok) {
            const errBody = await planResponse.json().catch(() => ({}));
            throw new Error(errBody.detail || "Error al generar el plan.");
          }

          const planData = await planResponse.json();

          setProposedPlan(planData.proposed_plan);
          setWaitingForApproval(true);
        }
      } catch (err: any) {
        console.error(err);

        if (err.name === "AbortError") {
          setError("La solicitud tardó demasiado. El servidor puede estar procesando una solicitud compleja.");
          addMessage(
            "assistant",
            "La solicitud tardó demasiado. Por favor, intenta de nuevo o simplifica tu idea."
          );
        } else {
          setError(
            err.message || "No se pudo conectar con el backend. Asegúrate de que esté corriendo en http://127.0.0.1:8000"
          );
          addMessage(
            "assistant",
            `Error: ${err.message || "Error de conexión. Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000"}`
          );
        }
      } finally {
        setLoading(false);
        setPlanning(false);
      }
    },
    [input, loading, planning, isReady, waitingForApproval, threadId, addMessage]
  );

  const approvePlan = useCallback(async () => {
    setApprovalLoading(true);
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/approve-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, approved: true }),
        },
        TIMEOUT_MS
      );

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
      const response = await fetchWithTimeout(
        `${API_URL}/approve-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thread_id: threadId,
            approved: false,
            feedback: feedback || "El usuario solicitó cambios generales.",
          }),
        },
        TIMEOUT_MS
      );

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
    setPlanning(false);
    setFeedback("");
    setError(null);
    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    loading,
    planning,
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
