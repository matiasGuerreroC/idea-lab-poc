"use client";

import { useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  CheckCircle2,
  Layers,
  Bot,
  Smile,
  ArrowRight,
  XCircle,
  Download,
} from "lucide-react";
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
  finalIdea: string | null;
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
  finalIdea,
}: ChatBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentTask = tasks[currentTaskIndex];
  const isTriage = !waitingForApproval && !waitingForTaskApproval && !finalSpecification && !executingTask;

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
    <div className="flex flex-col h-full bg-surface-container-lowest relative overflow-hidden">
      {/* Decorative glow elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-64 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Agent Header (Triage phase) */}
      {isTriage && !loading && messages.length > 1 && (
        <div className="sticky top-0 z-[5] py-3 px-4 lg:px-margin-page bg-surface-container-lowest/80 backdrop-blur-sm border-b border-outline-variant/50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-headline-md text-primary text-sm font-semibold">
                  Triage_Agent
                </h2>
                <p className="text-on-surface-variant font-mono text-code-sm">
                  {finalIdea
                    ? "Analizando: " + finalIdea.slice(0, 40) + "..."
                    : "Analizando tu idea..."}
                </p>
              </div>
            </div>
            {isReady && (
              <div className="shimmer-indigo flex items-center gap-2 bg-secondary/10 border border-secondary text-secondary px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-label-caps text-[11px]">Listo para Planificar</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Execution Header */}
      {executingTask && (
        <div className="sticky top-0 z-[5] py-3 px-4 lg:px-margin-page bg-surface-container-lowest/80 backdrop-blur-sm border-b border-outline-variant/50">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-secondary animate-spin" />
            <div>
              <h2 className="text-body-md text-on-surface font-semibold">
                Generando entregable técnico...
              </h2>
              <p className="text-code-sm text-on-surface-variant font-mono">
                El agente está diseñando la solución y realizando control de calidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-margin-page py-4 lg:py-stack-md">
        <div className="max-w-4xl mx-auto space-y-3 lg:space-y-stack-md">
          {messages.length <= 1 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container mb-4">
                <Smile className="w-8 h-8" />
              </div>
              <h2 className="text-headline-md text-on-surface mb-2">
                ¿Qué idea tienes en mente?
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Describe tu proyecto de software y el agente te guiará a través del proceso de especificación técnica.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              sender={msg.sender}
              text={msg.text}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Plan Approval Card */}
          {waitingForApproval && proposedPlan && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <Layers className="w-4 h-4 text-on-primary-container" />
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">
                    Plan Propuesto
                  </h3>
                  <p className="text-code-sm text-on-surface-variant font-mono">
                    Revisa el plan y aprueba o solicita cambios
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {proposedPlan.map((task, index) => (
                  <div
                    key={task.id}
                    className="bg-surface-container-low border border-outline-variant rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-code-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-body-md font-semibold text-on-surface">
                          {task.title}
                        </h4>
                        <p className="text-code-sm text-on-surface-variant mt-1 font-mono leading-relaxed">
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
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-on-surface placeholder-on-surface-variant"
                />
                <div className="flex gap-2">
                  <button
                    onClick={rejectPlan}
                    disabled={approvalLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-tertiary/20 disabled:opacity-50 text-on-surface py-2.5 rounded-xl text-label-caps transition-all border border-outline-variant"
                  >
                    <XCircle className="w-4 h-4" />
                    Solicitar Cambios
                  </button>
                  <button
                    onClick={approvePlan}
                    disabled={approvalLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 disabled:opacity-50 py-2.5 rounded-xl text-label-caps transition-all"
                  >
                    {approvalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Aprobar Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Task Deliverable & Approval */}
          {waitingForTaskApproval && currentDeliverable && currentTask && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-on-primary-container" />
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">
                    {currentTask.title}
                  </h3>
                  <p className="text-code-sm text-on-surface-variant font-mono">
                    Tarea {currentTaskIndex + 1} de {tasks.length}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5">
                <DeliverableView content={currentDeliverable} />
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-3">
                <textarea
                  value={taskFeedback}
                  onChange={(e) => setTaskFeedback(e.target.value)}
                  placeholder="Si necesitas cambios en este entregable, describe qué modificar..."
                  rows={2}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-on-surface placeholder-on-surface-variant"
                />
                <div className="flex gap-2">
                  <button
                    onClick={rejectTask}
                    disabled={taskApprovalLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-tertiary/20 disabled:opacity-50 text-on-surface py-2.5 rounded-xl text-label-caps transition-all border border-outline-variant"
                  >
                    <XCircle className="w-4 h-4" />
                    Solicitar Cambios
                  </button>
                  <button
                    onClick={approveTask}
                    disabled={taskApprovalLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 disabled:opacity-50 py-2.5 rounded-xl text-label-caps transition-all"
                  >
                    {taskApprovalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Aprobar Tarea
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Final Specification */}
          {finalSpecification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-on-secondary" />
                </div>
                <div>
                  <h3 className="text-body-md font-semibold text-on-surface">
                    Especificación Técnica Final
                  </h3>
                  <p className="text-code-sm text-on-surface-variant font-mono">
                    Documento maestro consolidado
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 max-h-96 overflow-y-auto">
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
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2.5 rounded-xl text-label-caps hover:brightness-110 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar Especificación (.md)
                </button>
              </div>
            </div>
          )}

          {/* Planning Indicator */}
          {planning && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
              </div>
              <div className="glass-panel rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-body-md text-primary font-medium">
                    Generando plan de trabajo...
                  </span>
                </div>
                <p className="text-code-sm text-on-surface-variant mt-1">
                  El agente está analizando tu idea y estructurando las tareas técnicas.
                </p>
              </div>
            </div>
          )}

          {/* Loading dots */}
          {loading && !planning && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
              </div>
              <div className="bg-surface-container-low rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating HITL Action Bar (when plan ready but not yet shown) */}
      {isReady && !waitingForApproval && !proposedPlan && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 max-w-[90vw] glass-panel px-4 lg:px-6 py-2 lg:py-3 rounded-full flex items-center gap-3 lg:gap-6 shadow-2xl z-20 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary shimmer" />
            <span className="text-label-caps text-on-surface text-[10px]">
              CONFIANZA DEL SISTEMA: 98.4%
            </span>
          </div>
          <div className="h-4 w-px bg-outline-variant" />
          <div className="flex gap-4">
            <button className="text-on-surface-variant hover:text-tertiary transition-colors flex items-center gap-2 text-label-caps text-[11px]">
              <XCircle className="w-4 h-4" />
              REVISAR
            </button>
            <button
              onClick={sendMessage}
              className="bg-primary-container text-on-primary-container px-6 py-1.5 rounded-full text-label-caps text-[11px] flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              APROBAR & PLANIFICAR
            </button>
          </div>
        </div>
      )}

      {/* Input Footer */}
      <div className="w-full px-4 lg:px-margin-page py-3 lg:py-4 bg-surface-container-low border-t border-outline-variant z-10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="max-w-4xl mx-auto relative"
        >
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
                : "Proporciona contexto arquitectónico adicional..."
            }
            rows={1}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 pr-24 lg:pr-28 text-body-md text-sm lg:text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none disabled:opacity-50 text-on-surface placeholder-on-surface-variant"
          />
          <div className="absolute bottom-1.5 lg:bottom-2 right-1.5 lg:right-2 flex gap-2">
            <button
              type="submit"
              disabled={loading || isReady || waitingForApproval || waitingForTaskApproval || !input.trim()}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-caps flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="hidden sm:inline">ENVIAR</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
