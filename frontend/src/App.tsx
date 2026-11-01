import { useState, useEffect } from "react";
import { Navbar, type ViewType } from "./components/layout/Navbar";
import { ProfileModal } from "./components/layout/ProfileModal";
import { AuthModal } from "./components/auth/AuthModal";
import { IntegrationGuideModal } from "./components/layout/IntegrationGuideModal";
import { LandingPage } from "./components/landing/LandingPage";
import { ChatPanel } from "./components/chat/ChatPanel";
import { PipelineVisualizer } from "./components/visualizer/PipelineVisualizer";
import { AutomationDashboard } from "./components/dashboard/AutomationDashboard";
import { OrbBackground } from "./components/common/OrbBackground";
import { SuccessCelebrationModal } from "./components/common/SuccessCelebrationModal";
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
    "Welcome to PromptFlow Studio! Describe an automation you'd like to build in plain English — for example: \"Monitor books.toscrape.com for price drops under £60 and alert my Telegram\".",
  timestamp: new Date().toISOString(),
};

function parseViewFromLocation(): ViewType {
  if (typeof window === "undefined") return "landing";
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (path === "studio" || hash === "studio") return "studio";
  if (path === "dashboard" || hash === "dashboard") return "dashboard";
  return "landing";
}

export function App() {
  const { profile, setActiveCount } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>(parseViewFromLocation);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signin");
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  // Handle URL change
  function navigateTo(view: ViewType) {
    setCurrentView(view);
    const targetPath = view === "landing" ? "/" : `/${view}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view }, "", targetPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Sync with browser back/forward buttons and initial guide query/hash
  useEffect(() => {
    function handlePopState() {
      const view = parseViewFromLocation();
      setCurrentView(view);
      const path = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
      if (path === "guide" || hash === "guide") {
        setIsGuideOpen(true);
      } else {
        setIsGuideOpen(false);
      }
    }

    window.addEventListener("popstate", handlePopState);

    const path = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
    const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
    if (path === "guide" || hash === "guide") {
      setIsGuideOpen(true);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleOpenGuide() {
    setIsGuideOpen(true);
    if (window.location.pathname !== "/guide") {
      window.history.pushState({ modal: "guide" }, "", "/guide");
    }
  }

  function handleCloseGuide() {
    setIsGuideOpen(false);
    const targetPath = currentView === "landing" ? "/" : `/${currentView}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: currentView }, "", targetPath);
    }
  }

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
    navigateTo("studio");
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
      setToastError("Test run failed: " + (err.response?.data?.details || err.message));
      setTimeout(() => setToastError(null), 4000);
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
      setIsCelebrationOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setToastError(`Could not save automation: ${msg}`);
      setTimeout(() => setToastError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  const screenMinHeight =
    currentView === "landing" ? "1800px" : "100vh";

  const screenPadding = "16px 24px 32px";

  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        minHeight: screenMinHeight,
        boxSizing: "border-box",
        padding: screenPadding,
        background: "#05070D",
        color: "#F5F5F7",
        font: '14px/1.5 -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      <OrbBackground />

      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || "signin");
          setIsAuthOpen(true);
        }}
        onOpenGuide={handleOpenGuide}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: currentView === "studio" || currentView === "dashboard" ? "center" : "flex-start",
          width: "100%",
          boxSizing: "border-box",
          paddingTop: currentView === "landing" ? "0" : "18px",
        }}
      >
        {currentView === "landing" ? (
          <LandingPage
            onOpenStudio={() => navigateTo("studio")}
            onOpenDashboard={() => navigateTo("dashboard")}
            onOpenAuth={(mode) => {
              setAuthInitialMode(mode || "signup");
              setIsAuthOpen(true);
            }}
            onOpenGuide={handleOpenGuide}
          />
        ) : currentView === "studio" ? (
          <div
            style={{
              maxWidth: "1260px",
              width: "100%",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "5fr 7fr",
              gap: "24px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <div>
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                onResetChat={handleResetChat}
                loading={isCompiling}
              />
            </div>
            <div style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto", paddingRight: "4px" }}>
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
          <AutomationDashboard
            onNewAutomation={() => navigateTo("studio")}
            onEditInStudio={handleEditInStudio}
          />
        )}
      </main>

      {/* Floating Apple Error Toast if needed */}
      {toastError && (
        <div
          className="apple-spring-modal"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 90,
            background: "rgba(255,69,58,.16)",
            backdropFilter: "blur(28px) saturate(170%)",
            WebkitBackdropFilter: "blur(28px) saturate(170%)",
            border: "1px solid rgba(255,69,58,.4)",
            borderRadius: "14px",
            padding: "12px 20px",
            color: "#FF453A",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,.6)",
          }}
        >
          {toastError}
        </div>
      )}

      {/* Apple Success Activation Celebration Modal */}
      <SuccessCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        title={pipeline?.title || "Daily Automation"}
        scheduleCron={pipeline?.schedule_cron || "0 8 * * *"}
        onViewDashboard={() => {
          setIsCelebrationOpen(false);
          navigateTo("dashboard");
        }}
      />

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
        onClose={handleCloseGuide}
      />
    </div>
  );
}

export default App;
