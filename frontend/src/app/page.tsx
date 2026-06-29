"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useApiChat } from "../hooks/use-api-chat";
import { ChatBox } from "../components/chat-box";
import { Dashboard } from "../components/dashboard";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chat = useApiChat();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          aria-label="Toggle dark mode"
        >
          {dark ? (
            <Sun className="w-4 h-4 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <div className="flex-1 pt-0">
          <ChatBox
            messages={chat.messages}
            input={chat.input}
            setInput={chat.setInput}
            loading={chat.loading}
            planning={chat.planning}
            isReady={chat.isReady}
            waitingForApproval={chat.waitingForApproval}
            proposedPlan={chat.proposedPlan}
            approvalLoading={chat.approvalLoading}
            feedback={chat.feedback}
            setFeedback={chat.setFeedback}
            messagesEndRef={chat.messagesEndRef}
            sendMessage={chat.sendMessage}
            approvePlan={chat.approvePlan}
            rejectPlan={chat.rejectPlan}
            threadId={chat.threadId}
          />
        </div>
      </div>

      <Dashboard
        isReady={chat.isReady}
        waitingForApproval={chat.waitingForApproval}
        planApproved={chat.planApproved}
        finalIdea={chat.finalIdea}
        proposedPlan={chat.proposedPlan}
        onReset={chat.resetChat}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
