"use client";

import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  RotateCcw,
  FileText,
  List,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deliverable: string | null;
}

interface DashboardProps {
  isReady: boolean;
  waitingForApproval: boolean;
  planApproved: boolean;
  finalIdea: string | null;
  proposedPlan: TaskItem[] | null;
  onReset: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const phases = [
  { key: "triage", label: "Triage & Entrevista" },
  { key: "planning", label: "Planificación" },
  { key: "architecture", label: "Arquitectura" },
  { key: "deliverables", label: "Entregables" },
];

export function Dashboard({
  isReady,
  waitingForApproval,
  planApproved,
  finalIdea,
  proposedPlan,
  onReset,
  sidebarOpen,
  setSidebarOpen,
}: DashboardProps) {
  let activeIndex = 0;
  if (planApproved) activeIndex = 2;
  else if (waitingForApproval || isReady) activeIndex = 1;

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all lg:hidden"
      >
        {sidebarOpen ? (
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <div
        className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          lg:relative lg:translate-x-0 lg:w-80 lg:flex-shrink-0
          flex flex-col shadow-2xl lg:shadow-none
        `}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Panel de Control
          </h2>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Progreso del Proyecto
            </span>

            <div className="space-y-0">
              {phases.map((phase, index) => {
                const isActive = index === activeIndex;
                const isCompleted = index < activeIndex;
                return (
                  <div key={phase.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : isActive ? (
                        <div className="relative flex-shrink-0">
                          <Circle className="w-5 h-5 text-blue-500" />
                          <span className="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-20" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                      )}
                      {index < phases.length - 1 && (
                        <div
                          className={`w-px h-6 ${
                            isCompleted
                              ? "bg-green-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <span
                        className={`text-xs font-medium ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {phase.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {proposedPlan && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Plan de Trabajo
                </span>
              </div>
              <div className="space-y-2">
                {proposedPlan.map((task) => (
                  <div
                    key={task.id}
                    className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3"
                  >
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      {task.title}
                    </p>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Resumen Técnico
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-40 overflow-y-auto">
              {finalIdea ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {finalIdea}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-600 italic">
                  El resumen técnico se generará cuando la idea esté clara.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nueva Idea
          </button>
        </div>
      </div>
    </>
  );
}
