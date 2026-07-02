"use client";

import { useState, useEffect } from "react";
import { useApiChat } from "../hooks/use-api-chat";
import { ChatBox } from "../components/chat-box";
import { Sidebar } from "../components/sidebar";
import { TopNavbar } from "../components/top-navbar";
import { ProgressStepper } from "../components/progress-stepper";
import { PlanningView } from "../components/planning-view";

type Phase = "triage" | "planning" | "execution" | "consolidation";

function computePhase(chat: ReturnType<typeof useApiChat>): Phase {
  if (chat.finalSpecification) return "consolidation";
  if (chat.planApproved || chat.waitingForTaskApproval || chat.executingTask) return "execution";
  if (chat.waitingForApproval && chat.proposedPlan) return "planning";
  return "triage";
}

function computePhaseStatus(phase: Phase) {
  const order: Phase[] = ["triage", "planning", "execution", "consolidation"];
  const idx = order.indexOf(phase);
  const status: Record<Phase, "completed" | "active" | "pending"> = {
    triage: "pending",
    planning: "pending",
    execution: "pending",
    consolidation: "pending",
  };
  order.forEach((p, i) => {
    if (i < idx) status[p] = "completed";
    else if (i === idx) status[p] = "active";
    else status[p] = "pending";
  });
  return status;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chat = useApiChat();
  const phase = computePhase(chat);
  const phaseStatus = computePhaseStatus(phase);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const showPlanningView = chat.waitingForApproval && chat.proposedPlan;

  return (
    <div className="flex h-screen bg-background transition-colors overflow-hidden">
      <Sidebar
        activePhase={phase}
        onReset={chat.resetChat}
        isMobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <TopNavbar
          dark={dark}
          onToggleDark={() => setDark(!dark)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <ProgressStepper
          currentPhase={phase}
          phaseStatus={phaseStatus}
        />

        {showPlanningView ? (
          <PlanningView
            proposedPlan={chat.proposedPlan}
            approvalLoading={chat.approvalLoading}
            feedback={chat.feedback}
            setFeedback={chat.setFeedback}
            approvePlan={chat.approvePlan}
            rejectPlan={chat.rejectPlan}
            planning={chat.planning}
            error={chat.error}
          />
        ) : (
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
            waitingForTaskApproval={chat.waitingForTaskApproval}
            tasks={chat.tasks}
            currentTaskIndex={chat.currentTaskIndex}
            currentDeliverable={chat.currentDeliverable}
            taskApprovalLoading={chat.taskApprovalLoading}
            executingTask={chat.executingTask}
            taskFeedback={chat.taskFeedback}
            setTaskFeedback={chat.setTaskFeedback}
            approveTask={chat.approveTask}
            rejectTask={chat.rejectTask}
            finalSpecification={chat.finalSpecification}
            finalIdea={chat.finalIdea}
            error={chat.error}
            llmConfig={chat.llmConfig}
            setLLMConfig={chat.setLLMConfig}
          />
        )}
      </div>
    </div>
  );
}
