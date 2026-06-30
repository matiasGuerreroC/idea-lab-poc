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
    const response = await fetch(url, { ...options, signal: controller.signal });
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

  // Estado de Fase 3
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [waitingForTaskApproval, setWaitingForTaskApproval] = useState(false);
  const [taskApprovalLoading, setTaskApprovalLoading] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState("");
  const [executingTask, setExecutingTask] = useState(false);

  // Estado de Fase 4
  const [finalSpecification, setFinalSpecification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const baseDeliverable: string | null =
    waitingForTaskApproval && tasks[currentTaskIndex]?.deliverable
      ? tasks[currentTaskIndex].deliverable
      : null;

  const currentDeliverable: string | null = executingTask ? null : baseDeliverable;

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
      if (!messageText.trim() || loading || planning || isReady || waitingForApproval || waitingForTaskApproval) return;

      const userText = messageText.trim();
      setInput("");
      setLoading(true);
      setError(null);

      addMessage("user", userText);

      try {
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
          setError("La solicitud tardó demasiado.");
          addMessage("assistant", "La solicitud tardó demasiado. Por favor, intenta de nuevo.");
        } else {
          setError(err.message || "Error de conexión.");
          addMessage("assistant", `Error: ${err.message || "Error de conexión."}`);
        }
      } finally {
        setLoading(false);
        setPlanning(false);
      }
    },
    [input, loading, planning, isReady, waitingForApproval, waitingForTaskApproval, threadId, addMessage]
  );

  const approvePlan = useCallback(async () => {
    setApprovalLoading(true);
    setExecutingTask(true);
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/approve-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, approve: true }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) throw new Error("Error al aprobar el plan.");

      const data = await response.json();
      setPlanApproved(true);
      setWaitingForApproval(false);

      if (data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
        setCurrentTaskIndex(data.current_task_index || 0);
        setWaitingForTaskApproval(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error al aprobar el plan.");
    } finally {
      setApprovalLoading(false);
      setExecutingTask(false);
    }
  }, [threadId]);

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
            approve: false,
            feedback: feedback || "El usuario solicitó cambios generales.",
          }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) throw new Error("Error al rechazar el plan.");

      const data = await response.json();

      if (data.proposed_plan && data.proposed_plan.length > 0) {
        setProposedPlan(data.proposed_plan);
        setWaitingForApproval(true);
        setFeedback("");
      } else {
        setPlanApproved(false);
        setWaitingForApproval(false);
        setProposedPlan(null);
        setIsReady(false);
        setFeedback("");
      }
    } catch (err) {
      console.error(err);
      setError("Error al rechazar el plan.");
    } finally {
      setApprovalLoading(false);
    }
  }, [threadId, feedback]);

  const approveTask = useCallback(async () => {
    setTaskApprovalLoading(true);
    setExecutingTask(true);
    setWaitingForTaskApproval(false);
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/approve-task`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, approve: true }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) throw new Error("Error al aprobar la tarea.");

      const data = await response.json();

      if (data.tasks) setTasks(data.tasks);
      const nextIndex = data.current_task_index || 0;

      if (data.final_specification) {
        setFinalSpecification(data.final_specification);
        setCurrentTaskIndex(nextIndex);
        addMessage("assistant", "¡Proyecto completado! La especificacion tecnica final esta lista.");
      } else if (nextIndex >= data.tasks?.length) {
        setCurrentTaskIndex(nextIndex);
        addMessage("assistant", "Todas las tareas han sido completadas. ¡Proyecto finalizado!");
      } else {
        setCurrentTaskIndex(nextIndex);
        setWaitingForTaskApproval(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error al aprobar la tarea.");
    } finally {
      setTaskApprovalLoading(false);
      setExecutingTask(false);
    }
  }, [threadId, addMessage]);

  const rejectTask = useCallback(async () => {
    setTaskApprovalLoading(true);
    setExecutingTask(true);
    setWaitingForTaskApproval(false);
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/approve-task`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thread_id: threadId,
            approve: false,
            feedback: taskFeedback || "El usuario solicitó cambios.",
          }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) throw new Error("Error al rechazar la tarea.");

      const data = await response.json();
      if (data.tasks) setTasks(data.tasks);
      setWaitingForTaskApproval(true);
      setTaskFeedback("");
    } catch (err) {
      console.error(err);
      setError("Error al rechazar la tarea.");
    } finally {
      setTaskApprovalLoading(false);
      setExecutingTask(false);
    }
  }, [threadId, taskFeedback]);

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
    setWaitingForTaskApproval(false);
    setPlanning(false);
    setFeedback("");
    setTaskFeedback("");
    setTasks([]);
    setCurrentTaskIndex(0);
    setError(null);
    setInput("");
    setExecutingTask(false);
    setFinalSpecification(null);
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
    tasks,
    currentTaskIndex,
    waitingForTaskApproval,
    taskApprovalLoading,
    taskFeedback,
    setTaskFeedback,
    currentDeliverable,
    executingTask,
    finalSpecification,
    approveTask,
    rejectTask,
  };
}
