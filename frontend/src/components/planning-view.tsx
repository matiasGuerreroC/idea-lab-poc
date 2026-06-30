"use client";

import {
  ArrowRight,
  Lock,
  Loader2,
  Smartphone,
  BarChart3,
  Send,
  XCircle,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deliverable: string | null;
}

interface PlanningViewProps {
  proposedPlan: TaskItem[];
  approvalLoading: boolean;
  feedback: string;
  setFeedback: (value: string) => void;
  approvePlan: () => void;
  rejectPlan: () => void;
  planning?: boolean;
}

export function PlanningView({
  proposedPlan,
  approvalLoading,
  feedback,
  setFeedback,
  approvePlan,
  rejectPlan,
  planning,
}: PlanningViewProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Pane: Tasks */}
      <div className="w-full lg:w-[45%] lg:min-w-[360px] lg:border-r border-outline-variant flex flex-col overflow-y-auto p-4 lg:p-margin-page relative z-10">
        <div className="mb-4 lg:mb-stack-lg">
          <span className="text-label-caps text-primary px-3 py-1 bg-primary/10 rounded-full inline-block mb-2 lg:mb-stack-sm">
            PLANNER_AGENT
          </span>
          <h1 className="text-headline-lg text-on-surface text-xl lg:text-headline-lg">
            Pipeline Arquitectónico
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1 lg:mt-stack-sm text-sm lg:text-body-md">
            La fase de planificación ha generado una secuencia estructurada de ejecución. Revisa los modelos de datos propuestos y la estrategia de infraestructura antes de proceder a la síntesis.
          </p>
        </div>

        <div className="space-y-3 lg:space-y-stack-md">
          {proposedPlan.map((task, index) => (
            <div
              key={task.id}
              className="glass-panel p-3 lg:p-stack-md rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1 lg:mb-unit">
                <span className="font-mono text-code-sm text-secondary">
                  TASK_{String(index + 1).padStart(2, "0")}
                </span>
                <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 text-on-surface-variant group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="text-headline-md text-on-surface text-base lg:text-[18px] mb-1 lg:mb-unit">
                {task.title}
              </h3>
              <p className="text-body-md text-on-surface-variant text-sm lg:text-body-md">
                {task.description}
              </p>
              <div className="mt-2 lg:mt-stack-sm flex gap-2 lg:gap-stack-sm flex-wrap">
                <span className="px-2 py-[2px] rounded border border-outline-variant font-mono text-code-sm text-on-surface-variant">
                  Task v1.0
                </span>
                <span className="px-2 py-[2px] rounded border border-outline-variant font-mono text-code-sm text-on-surface-variant">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Area (inline in planning view) */}
        <div className="mt-4 lg:mt-stack-lg space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe qué cambios necesita el plan..."
            rows={2}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-body-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-on-surface placeholder-on-surface-variant"
          />
          <div className="flex gap-2">
            <button
              onClick={rejectPlan}
              disabled={approvalLoading || planning}
              className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-tertiary/20 disabled:opacity-50 text-on-surface py-2.5 rounded-xl text-label-caps text-xs lg:text-label-caps transition-all border border-outline-variant"
            >
              {approvalLoading || planning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar Feedback
            </button>
            <button
              onClick={approvePlan}
              disabled={approvalLoading || planning}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 disabled:opacity-50 py-2.5 rounded-xl text-label-caps text-xs lg:text-label-caps transition-all"
            >
              {approvalLoading || planning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Aprobar Plan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane: Visualization */}
      <div className="hidden lg:flex flex-1 bg-surface-container-lowest/80 flex-col relative overflow-hidden">
        {/* SVG Architecture Diagram */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="0" refY="3.5">
                <polygon fill="#4fdbc8" points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            <rect fill="none" height="80" rx="4" stroke="#4fdbc8" strokeWidth="2" width="200" x="200" y="50" />
            <text fill="#4fdbc8" fontFamily="JetBrains Mono" fontSize="14" textAnchor="middle" x="300" y="95">PLANNER_START</text>
            <line markerEnd="url(#arrowhead)" stroke="#4fdbc8" strokeWidth="2" x1="300" x2="300" y1="130" y2="180" />
            {proposedPlan.map((_, i) => (
              <g key={i}>
                <rect
                  fill="none"
                  height="60"
                  rx="4"
                  stroke={i === 0 ? "#4fdbc8" : i === proposedPlan.length - 1 ? "#ffb2b7" : "#c0c1ff"}
                  strokeWidth="1"
                  width="280"
                  x="160"
                  y={210 + i * 90}
                />
                <text
                  fill="#dae2fd"
                  fontFamily="JetBrains Mono"
                  fontSize="10"
                  textAnchor="middle"
                  x="300"
                  y={240 + i * 90}
                >
                  {`TASK_${String(i + 1).padStart(2, "0")}`}
                </text>
                {i < proposedPlan.length - 1 && (
                  <line
                    markerEnd="url(#arrowhead)"
                    stroke="#c0c1ff"
                    strokeDasharray="4"
                    strokeWidth="1"
                    x1="300"
                    x2="300"
                    y1={270 + i * 90}
                    y2={300 + i * 90}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="p-4 lg:p-margin-page">
            <div className="text-label-caps text-on-surface-variant mb-1 lg:mb-unit opacity-50">
              VISUALIZACIÓN
            </div>
            <div className="flex items-center gap-2 lg:gap-stack-sm mb-3 lg:mb-stack-lg">
              <h2 className="text-headline-md text-on-surface text-lg lg:text-headline-md">
                Mapa de Arquitectura
              </h2>
              <div className="shimmer-indigo h-1 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-stack-md">
              <div className="glass-panel p-3 lg:p-stack-md rounded-lg">
                <div className="text-label-caps text-secondary mb-1 lg:mb-unit flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  DEPENDENCY_LOAD
                </div>
                <div className="text-headline-md text-on-surface text-lg lg:text-headline-md">Bajo</div>
                <div className="w-full h-1 bg-surface-container-highest mt-1 lg:mt-unit rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[20%] rounded-full" />
                </div>
              </div>
              <div className="glass-panel p-3 lg:p-stack-md rounded-lg">
                <div className="text-label-caps text-primary mb-1 lg:mb-unit flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  AI_CONFIDENCE
                </div>
                <div className="text-headline-md text-on-surface text-lg lg:text-headline-md">98.4%</div>
                <div className="w-full h-1 bg-surface-container-highest mt-1 lg:mt-unit rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[98%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 lg:p-margin-page space-y-2 lg:space-y-stack-md">
            <div className="glass-panel p-3 lg:p-stack-md rounded-xl self-start max-w-[90%] lg:max-w-[80%] border-l-2 border-primary">
              <div className="text-label-caps text-primary mb-1 lg:mb-unit flex items-center gap-unit">
                <Loader2 className="w-3 h-3 animate-spin" />
                SYSTEM_LOG
              </div>
              <p className="text-body-md text-on-surface text-sm lg:text-body-md">
                He optimizado la estrategia de despliegue para nodos edge de baja latencia. Confirma si la secuencia de {proposedPlan.length} tareas se alinea con las restricciones técnicas del proyecto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile visualization summary */}
      <div className="lg:hidden flex-shrink-0 p-4 bg-surface-container-lowest/80 border-t border-outline-variant">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3 rounded-lg">
            <div className="text-label-caps text-secondary mb-1 flex items-center gap-1 text-[10px]">
              <BarChart3 className="w-3 h-3" />
              DEPENDENCY LOAD
            </div>
            <div className="text-headline-md text-on-surface text-base">Bajo</div>
          </div>
          <div className="glass-panel p-3 rounded-lg">
            <div className="text-label-caps text-primary mb-1 flex items-center gap-1 text-[10px]">
              <Smartphone className="w-3 h-3" />
              AI CONFIDENCE
            </div>
            <div className="text-headline-md text-on-surface text-base">98.4%</div>
          </div>
        </div>
      </div>

      {/* Planning loading overlay */}
      {planning && (
        <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="glass-panel rounded-2xl p-6 lg:p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-body-md text-on-surface font-semibold">
              Re-planificando con tu feedback...
            </p>
            <p className="text-code-sm text-on-surface-variant text-center">
              El agente está ajustando las tareas según tus indicaciones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
