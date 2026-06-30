"use client";

import { CheckCircle2, Radio } from "lucide-react";

interface ProgressStepperProps {
  currentPhase: "triage" | "planning" | "execution" | "consolidation";
  phaseStatus?: {
    triage: "completed" | "active" | "pending";
    planning: "completed" | "active" | "pending";
    execution: "completed" | "active" | "pending";
    consolidation: "completed" | "active" | "pending";
  };
}

const phaseLabels = {
  triage: "PHASE 01: TRIAGE",
  planning: "PHASE 02: PLANNING",
  execution: "PHASE 03: EXECUTION",
  consolidation: "PHASE 04: CONSOLIDATION",
} as const;

const phaseShortLabels = {
  triage: "Triage",
  planning: "Planning",
  execution: "Execution",
  consolidation: "Consolidation",
} as const;

function getDefaultStatus(currentPhase: string, phaseKey: string) {
  const order = ["triage", "planning", "execution", "consolidation"];
  const currentIdx = order.indexOf(currentPhase);
  const phaseIdx = order.indexOf(phaseKey);
  if (phaseIdx < currentIdx) return "completed";
  if (phaseIdx === currentIdx) return "active";
  return "pending";
}

export function ProgressStepper({ currentPhase, phaseStatus }: ProgressStepperProps) {
  const phases = ["triage", "planning", "execution", "consolidation"] as const;

  const getStatus = (key: typeof phases[number]) => {
    if (phaseStatus) return phaseStatus[key];
    return getDefaultStatus(currentPhase, key);
  };

  return (
    <div className="w-full border-b border-outline-variant bg-surface-container-low/50 backdrop-blur-md">
      <div className="flex items-center px-3 lg:px-margin-page h-10 lg:h-14 gap-1 lg:gap-stack-sm overflow-x-auto">
        {phases.map((key, index) => {
          const status = getStatus(key);
          const isLast = index === phases.length - 1;
          const Icon = status === "completed" ? CheckCircle2 : Radio;

          return (
            <div key={key} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-1 lg:gap-unit min-w-0">
                {status === "completed" ? (
                  <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-secondary shrink-0" />
                ) : status === "active" ? (
                  <div className="relative shrink-0">
                    <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
                    <span className="absolute inset-0 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full animate-ping opacity-30" />
                  </div>
                ) : (
                  <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-on-surface-variant/40 shrink-0" />
                )}
                <span
                  className={`text-[9px] lg:text-[10px] font-bold tracking-wider truncate ${
                    status === "completed"
                      ? "text-secondary"
                      : status === "active"
                      ? "text-primary"
                      : "text-on-surface-variant/40"
                  }`}
                >
                  <span className="hidden sm:inline">{phaseLabels[key]}</span>
                  <span className="sm:hidden">{phaseShortLabels[key]}</span>
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-px flex-1 mx-1 lg:mx-stack-sm ${
                    status === "completed"
                      ? "bg-secondary"
                      : "bg-outline-variant"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
