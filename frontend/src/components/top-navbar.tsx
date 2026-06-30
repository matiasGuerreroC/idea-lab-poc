"use client";

import { Bell, Settings, Sun, Moon, Menu, X } from "lucide-react";

interface TopNavbarProps {
  dark: boolean;
  onToggleDark: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function TopNavbar({ dark, onToggleDark, onToggleSidebar, sidebarOpen }: TopNavbarProps) {
  return (
    <header className="flex justify-between items-center w-full h-14 lg:h-16 px-4 lg:px-margin-page bg-surface-container-low border-b border-outline-variant shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="text-headline-md text-primary font-bold tracking-tighter text-lg lg:text-headline-md">
          Idea Lab
        </div>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <span className="text-body-md text-primary border-b-2 border-primary pb-1 cursor-pointer">
            Dashboard
          </span>
          <span className="text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            Registry
          </span>
          <span className="text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            Templates
          </span>
        </nav>
      </div>
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onToggleDark}
          className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
        </button>
        <div className="relative">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" />
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-error rounded-full" />
        </div>
        <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer hidden sm:block" />
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center text-label-caps text-on-surface text-[10px] lg:text-label-caps">
          IL
        </div>
      </div>
    </header>
  );
}
