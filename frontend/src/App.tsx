import { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { ProfileModal } from "./components/layout/ProfileModal";
import { ChatPanel } from "./components/chat/ChatPanel";
import { PipelineVisualizer } from "./components/visualizer/PipelineVisualizer";
import { AutomationList } from "./components/dashboard/AutomationList";
import type {
  ChatMessage,
  PipelineExecutionReport,
  PipelineSpecification,
} from "./types/pipeline";
import { api } from "./lib/api";
import { useAuth } from "./context/AuthContext";

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "model",
  content:
    "👋 Welcome to PromptFlow! Tell me what you'd like to monitor or automate in plain English (e.g., job postings, price drops, exam timetables, or tech releases). I will turn it into an executable, scheduled micro-pipeline.",
  timestamp: new Date().toISOString(),
};

export function App() {
  const { profile, setActiveCount } = useAuth();
  const [currentView, setCurrentView] = useState<"studio" | "automations">("studio");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Studio State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [pipeline, setPipeline] = useState<PipelineSpecification | null>(null);
  const [testReport, setTestReport] = useState<PipelineExecutionReport | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());

  // Handle incoming user prompt from ChatPanel
  async function handleSendMessage(promptText: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsCompiling(true);

    try {
      const response = await api.compilePrompt(promptText, sessionId, profile?.id);

      if (response.pipeline) {
        setPipeline(response.pipeline);
      }

      let assistantText = "";
      if (response.status === "incomplete") {
        assistantText =
          response.question ||
          "I've drafted your automation pipeline, but need a few details. Could you clarify?";
      } else {
        assistantText = `✨ I have compiled your automation: "${
          response.pipeline?.title || "Web Monitor"
        }". Review the step cards on the right and click "Test Run" to verify live!`;
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: assistantText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: `⚠️ Failed to compile: ${err.message}. Please check if the backend service is running.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsCompiling(false);
    }
  }

  function handleResetChat() {
    setSessionId(crypto.randomUUID());
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setPipeline(null);
    setTestReport(null);
  }

  // Sandbox Test Run
  async function handleTestRun() {
    if (!pipeline) return;
    setIsExecuting(true);
    setTestReport(null);

    try {
      const destinations = {
        telegram_chat_id: profile?.telegram_chat_id,
        discord_webhook_url: profile?.discord_webhook_url,
      };

      const report = await api.executeTestRun(pipeline, destinations);
      setTestReport(report);
    } catch (err: any) {
      alert("Test run failed: " + (err.response?.data?.details || err.message));
    } finally {
      setIsExecuting(false);
    }
  }

  // Save & Activate Automation
  async function handleSaveAutomation() {
    if (!pipeline || !profile?.id) return;
    setIsSaving(true);

    try {
      await api.createAutomation(profile.id, pipeline, true);
      setActiveCount((prev) => prev + 1);
      alert(`🎉 "${pipeline.title}" successfully saved and scheduled!`);
      setCurrentView("automations");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`⚠️ Could not save automation: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === "studio" ? (
          <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-4rem)]">
            {/* Left Column: Conversational AI Prompt (5 cols) */}
            <div className="col-span-5 h-full overflow-hidden">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                onResetChat={handleResetChat}
                loading={isCompiling}
              />
            </div>

            {/* Right Column: Linear Step Visualizer (7 cols) */}
            <div className="col-span-7 h-full overflow-hidden">
              <PipelineVisualizer
                pipeline={pipeline}
                onUpdatePipeline={setPipeline}
                onTestRun={handleTestRun}
                onSaveAutomation={handleSaveAutomation}
                testReport={testReport}
                isExecuting={isExecuting}
                isSaving={isSaving}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <AutomationList onNewAutomation={() => setCurrentView("studio")} />
          </div>
        )}
      </main>

      <ProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
