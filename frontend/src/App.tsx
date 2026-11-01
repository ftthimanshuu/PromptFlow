import { useState } from "react";
import { Navbar, type ViewType } from "./components/layout/Navbar";
import { ProfileModal } from "./components/layout/ProfileModal";
import { AuthModal } from "./components/auth/AuthModal";
import { IntegrationGuideModal } from "./components/layout/IntegrationGuideModal";
import { LandingPage } from "./components/landing/LandingPage";
import { ChatPanel } from "./components/chat/ChatPanel";
import { PipelineVisualizer } from "./components/visualizer/PipelineVisualizer";
import { AutomationDashboard } from "./components/dashboard/AutomationDashboard";
import type {
  ChatMessage,
  PipelineExecutionReport,
  PipelineSpecification,
  Automation,
} from "./types/pipeline";
import { api } from "./lib/api";
import { useAuth } from "./context/AuthContext";

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "model",
  content:
    "I compiled a 4-step pipeline. The source blocked access, so see Step 1 for an alternate source.",
  timestamp: new Date().toISOString(),
};

export function App() {
  const { profile, setActiveCount } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");

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
        assistantText = `I compiled your automation: "${
          response.pipeline?.title || "Web Monitor"
        }". Review the step cards on the right and click "Test Run" to verify live in the sandbox.`;
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
        content: `Failed to compile: ${err.message}. Please check if the backend service is running.`,
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

  function handleEditInStudio(auto: Automation) {
    setPipeline({
      title: auto.title,
      description: auto.description || undefined,
      schedule_cron: auto.schedule_cron,
      steps: auto.steps,
    });
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "model",
        content: `Loaded automation "${auto.title}". You can modify it by asking questions or editing the cards directly.`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setCurrentView("studio");
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
        email: profile?.email,
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
      alert(`"${pipeline.title}" successfully saved and scheduled!`);
      setCurrentView("dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Could not save automation: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-[#F5F5F7] flex flex-col font-sans selection:bg-[#0071E3]/30 selection:text-white overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-top" />

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || "signin");
          setIsAuthOpen(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
        {currentView === "landing" ? (
          <div className="flex-1 overflow-y-auto">
            <LandingPage
              onOpenStudio={() => setCurrentView("studio")}
              onOpenDashboard={() => setCurrentView("dashboard")}
              onOpenAuth={(mode) => {
                setAuthInitialMode(mode || "signup");
                setIsAuthOpen(true);
              }}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          </div>
        ) : currentView === "studio" ? (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-16">
            <div className="max-w-6xl mx-auto pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Conversational AI Prompt (5 cols) */}
              <div className="lg:col-span-5">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onResetChat={handleResetChat}
                  loading={isCompiling}
                />
              </div>

              {/* Right Column: Linear Step Visualizer (7 cols) */}
              <div className="lg:col-span-7">
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
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <AutomationDashboard
              onNewAutomation={() => setCurrentView("studio")}
              onEditInStudio={handleEditInStudio}
            />
          </div>
        )}
      </main>

      <ProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAuth={() => {
          setAuthInitialMode("signin");
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      <IntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
