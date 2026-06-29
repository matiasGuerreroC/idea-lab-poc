"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2, CheckCircle2, XCircle, Layers } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { DeliverableView } from "./deliverable-view";

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

interface ChatBoxProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  planning: boolean;
  isReady: boolean;
  waitingForApproval: boolean;
  proposedPlan: TaskItem[] | null;
  approvalLoading: boolean;
  feedback: string;
  setFeedback: (value: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendMessage: () => void;
  approvePlan: () => void;
  rejectPlan: () => void;
  threadId: string;
  waitingForTaskApproval: boolean;
  tasks: TaskItem[];
  currentTaskIndex: number;
  currentDeliverable: string | null;
  taskApprovalLoading: boolean;
  executingTask: boolean;
  taskFeedback: string;
  setTaskFeedback: (value: string) => void;
  approveTask: () => void;
  rejectTask: () => void;
  finalSpecification: string | null;
}

export function ChatBox({
  messages,
  input,
  setInput,
  loading,
  planning,
  isReady,
  waitingForApproval,
  proposedPlan,
  approvalLoading,
  feedback,
  setFeedback,
  messagesEndRef,
  sendMessage,
  approvePlan,
  rejectPlan,
  threadId,
  waitingForTaskApproval,
  tasks,
  currentTaskIndex,
  currentDeliverable,
  taskApprovalLoading,
  executingTask,
  taskFeedback,
  setTaskFeedback,
  approveTask,
  rejectTask,
  finalSpecification,
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

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Idea Lab -{" "}
          {waitingForTaskApproval
            ? "Entregable Técnico"
            : waitingForApproval
            ? "Planificación"
            : "Triage"}
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

        {waitingForApproval && proposedPlan && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Plan Propuesto
                </h3>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  Revisa el plan y aprueba o solicita cambios
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {proposedPlan.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Si necesitas cambios, describe qué modificar..."
                rows={2}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={approvePlan}
                  disabled={approvalLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {approvalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Aprobar Plan
                </button>
                <button
                  onClick={rejectPlan}
                  disabled={approvalLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-red-200 dark:border-red-800"
                >
                  <XCircle className="w-4 h-4" />
                  Solicitar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {executingTask && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-spin" />
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                <span className="text-sm text-violet-700 dark:text-violet-400 font-medium">
                  Generando entregable técnico...
                </span>
              </div>
              <p className="text-xs text-violet-500 dark:text-violet-500 mt-1">
                El agente está diseñando la solución y realizando control de calidad.
              </p>
            </div>
          </div>
        )}

        {waitingForTaskApproval && currentDeliverable && currentTask && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  {currentTask.title}
                </h3>
                <p className="text-xs text-violet-500 dark:text-violet-400">
                  Tarea {currentTaskIndex + 1} de {tasks.length}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <DeliverableView content={currentDeliverable} />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
              <textarea
                value={taskFeedback}
                onChange={(e) => setTaskFeedback(e.target.value)}
                placeholder="Si necesitas cambios en este entregable, describe qué modificar..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={approveTask}
                  disabled={taskApprovalLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {taskApprovalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Aprobar Tarea
                </button>
                <button
                  onClick={rejectTask}
                  disabled={taskApprovalLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-red-200 dark:border-red-800"
                >
                  <XCircle className="w-4 h-4" />
                  Solicitar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {finalSpecification && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Especificacion Tecnica Final
                </h3>
                <p className="text-xs text-emerald-500 dark:text-emerald-400">
                  Documento maestro consolidado
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 max-h-96 overflow-y-auto">
              <DeliverableView content={finalSpecification} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([finalSpecification], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "especificacion-tecnica.md";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Descargar Especificacion (.md)
              </button>
            </div>
          </div>
        )}

        {planning && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-spin" />
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  Generando plan de trabajo...
                </span>
              </div>
              <p className="text-xs text-amber-500 dark:text-amber-500 mt-1">
                El agente está analizando tu idea y estructurando las tareas técnicas.
              </p>
            </div>
          </div>
        )}

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
            disabled={loading || isReady || waitingForApproval || waitingForTaskApproval}
            placeholder={
              waitingForTaskApproval
                ? "Revisando entregable..."
                : waitingForApproval
                ? "Esperando aprobación del plan..."
                : isReady
                ? "Idea lista para planificación..."
                : "Escribe tu idea..."
            }
            rows={1}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || isReady || waitingForApproval || waitingForTaskApproval || !input.trim()}
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
