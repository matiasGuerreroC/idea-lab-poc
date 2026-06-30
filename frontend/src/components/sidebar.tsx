"use client";

import { Filter, Cuboid, Terminal, PackageOpen, FileText, LifeBuoy, Plus, RotateCcw } from "lucide-react";

interface SidebarProps {
  activePhase: "triage" | "planning" | "execution" | "consolidation";
  onPhaseClick?: (phase: "triage" | "planning" | "execution" | "consolidation") => void;
  onReset?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const phases = [
  { key: "triage", label: "Triage", icon: Filter },
  { key: "planning", label: "Planning", icon: Cuboid },
  { key: "execution", label: "Execution", icon: Terminal },
  { key: "consolidation", label: "Consolidation", icon: PackageOpen },
] as const;

export function Sidebar({ activePhase, onReset, isMobileOpen, onCloseMobile }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full">
      <div className="p-stack-md border-b border-outline-variant">
        <h1 className="text-headline-md text-on-surface font-bold tracking-tight">
          Idea Lab
        </h1>
        <p className="text-label-caps text-on-surface-variant/60 mt-0.5">v1.0-stable</p>
      </div>

      <div className="p-stack-md space-y-stack-sm">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 px-4 rounded-lg text-label-caps hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nuevo Pipeline
        </button>
      </div>

      <nav className="flex-1 px-stack-md space-y-1">
        {phases.map(({ key, label, icon: Icon }) => {
          const isActive = activePhase === key;
          return (
            <div
              key={key}
              data-phase={key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-label-caps">{label}</span>
            </div>
          );
        })}
      </nav>

      <div className="px-stack-md pb-stack-md mt-auto border-t border-outline-variant pt-stack-md space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-on-surface-variant hover:bg-surface-container-high transition-all">
          <FileText className="w-4 h-4" />
          <span className="text-label-caps">Docs</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-on-surface-variant hover:bg-surface-container-high transition-all">
          <LifeBuoy className="w-4 h-4" />
          <span className="text-label-caps">Support</span>
        </div>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 mt-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-2 rounded-lg text-label-caps transition-all border border-outline-variant"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nueva Idea
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 shrink-0 bg-surface border-r border-outline-variant">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 h-full bg-surface border-r border-outline-variant shadow-2xl overflow-y-auto">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
