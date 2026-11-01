import React, { useState } from "react";
import {
  Zap,
  ArrowRight,
  Globe,
  BrainCircuit,
  GitBranch,
  Bell,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LandingPageProps {
  onOpenStudio: () => void;
  onOpenDashboard: () => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
}

const SAMPLE_DEMOS = [
  {
    title: "Historical Headlines",
    prompt: "Every day at 8:00 AM check Wikipedia 'On this day' headlines and dispatch them to my Discord.",
    url: "https://en.wikipedia.org/wiki/Portal:Current_events",
    field: "step_2.headlines.length > 0",
    channel: "Discord Webhook",
    cron: "Every day at 8:00 AM",
    outputSnippet: "• 1981 – Antigua and Barbuda achieves independence\n• 1959 – Jacques Plante becomes first goalie to wear mask",
  },
  {
    title: "Price Drop Monitor",
    prompt: "Track Sony WH-1000XM5 headphones on Amazon. If price drops below £250, alert my Telegram.",
    url: "https://amazon.com/dp/B09XS7JWHH",
    field: "step_2.price < 250",
    channel: "Telegram Chat",
    cron: "Every 2 hours",
    outputSnippet: "• Price dropped to £239.99 (Target: < £250)\n• In Stock: Yes (Dispatched by Amazon)",
  },
  {
    title: "Software Release Radar",
    prompt: "Watch Node.js releases. When a new v22+ version drops, email me the changelog summary.",
    url: "https://github.com/nodejs/node/releases",
    field: 'step_2.version.startsWith("v22")',
    channel: "Gmail / SMTP",
    cron: "Daily at 9:00 AM",
    outputSnippet: "• Version: v22.4.0 (Current LTS)\n• Key Changes: V8 12.8, OpenSSL 3.0.14 update",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenDashboard,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const activeDemo = SAMPLE_DEMOS[selectedDemoIndex];

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] flex flex-col font-sans selection:bg-[#007AFF]/30 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#007AFF]/15 to-transparent blur-[120px] pointer-events-none -z-10" />

        {/* Top Eyebrow Capsule */}
        <div
          onClick={() => onOpenAuth("signup")}
          className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-white/80 mb-8 transition-all hover:bg-white/[0.08]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-white font-semibold">PromptFlow 2.0</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70">Natural Language to Autonomous Cron Workflows</span>
          <ArrowRight className="h-3 w-3 text-white/50" />
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl">
          Automate the web with plain English.
        </h1>

        {/* Editorial Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#A1A1A6] max-w-2xl leading-relaxed">
          Describe what you want to monitor. PromptFlow crafts the scrapers, evaluates the AI conditions, and delivers structured alerts across Discord, Telegram, and Email.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onOpenStudio}
            className="apple-btn-primary px-7 py-3.5 text-sm font-medium shadow-lg hover:shadow-[#007AFF]/25 flex items-center gap-2"
          >
            <span>Open Studio Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {user ? (
            <button
              onClick={onOpenDashboard}
              className="apple-btn-secondary px-6 py-3.5 text-sm font-medium"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth("signup")}
              className="apple-btn-secondary px-6 py-3.5 text-sm font-medium flex items-center gap-2"
            >
              <span>Create Account</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30">
                5 Active Free
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Interactive macOS Window Simulator */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-20">
        <div className="text-center mb-5">
          <p className="text-xs uppercase tracking-widest text-[#6E6E73] font-semibold">
            Interactive Architecture Preview
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {SAMPLE_DEMOS.map((demo, idx) => (
              <button
                key={demo.title}
                onClick={() => setSelectedDemoIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDemoIndex === idx
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-[#1C1C1E] text-white/60 hover:text-white border border-white/[0.06]"
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        {/* macOS Window Card */}
        <div className="apple-card overflow-hidden shadow-2xl border border-white/[0.12]">
          {/* macOS Title Bar */}
          <div className="px-4 py-3 bg-[#1C1C1E]/80 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 inline-block" />
              <span className="ml-3 text-xs font-medium text-white/60">
                PromptFlow Studio — {activeDemo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 bg-black/40 px-2.5 py-1 rounded-full border border-white/[0.06]">
              <Clock className="h-3 w-3 text-[#007AFF]" />
              <span>{activeDemo.cron}</span>
            </div>
          </div>

          {/* Window Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Prompt Bar Display */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
              <div className="h-7 w-7 rounded-lg bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  User Instruction Prompt
                </div>
                <p className="text-sm font-medium text-white/90 mt-1">
                  "{activeDemo.prompt}"
                </p>
              </div>
            </div>

            {/* 4-Step Linear Pipeline Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 1
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Target Scraper</div>
                  <div className="text-[11px] text-[#A1A1A6] font-mono truncate mt-0.5">
                    {activeDemo.url}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
                    <BrainCircuit className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 2
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Semantic AI</div>
                  <div className="text-[11px] text-[#A1A1A6] font-mono truncate mt-0.5">
                    Groq 70B & Gemini
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center">
                    <GitBranch className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 3
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Condition Rule</div>
                  <div className="text-[11px] text-[#FF9F0A] font-mono truncate mt-0.5">
                    {activeDemo.field}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 4
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Push Alert</div>
                  <div className="text-[11px] text-[#34C759] font-medium truncate mt-0.5">
                    {activeDemo.channel}
                  </div>
                </div>
              </div>
            </div>

            {/* Formatted Alert Preview */}
            <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/[0.06] text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-1.5">
                <Send className="h-3 w-3 text-[#34C759]" />
                <span>Structured Alert Output Preview</span>
              </div>
              <pre className="text-xs text-[#F5F5F7] font-mono whitespace-pre-wrap leading-relaxed">
                {activeDemo.outputSnippet}
              </pre>
            </div>

            {/* Footer Toolbar */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#A1A1A6]">
                100% sandboxed execution with SSRF safety & user-agent rotation.
              </span>
              <button
                onClick={onOpenStudio}
                className="apple-btn-primary px-4 py-2 text-xs font-medium gap-1.5"
              >
                <Play className="h-3 w-3 fill-white" />
                <span>Test in Studio</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Vignettes */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Designed for clarity. Built for reliability.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#A1A1A6] max-w-xl mx-auto">
            Every pipeline translates your intent into an auditable 4-step DSL running securely in background schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Card 1 */}
          <div className="apple-card p-6 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Natural Language Compiler
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A6] leading-relaxed">
              No fragile CSS selectors, complex regex, or manual DOM scraping. The compiler infers targets directly from plain English sentences.
            </p>
          </div>

          {/* Card 2 */}
          <div className="apple-card p-6 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Resilient & Polite Scraping
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A6] leading-relaxed">
              Automated user-agent rotation, DNS protection, and friendly error guidance if target websites restrict automated access.
            </p>
          </div>

          {/* Card 3 */}
          <div className="apple-card p-6 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Structured Multi-Channel Alerts
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1A6] leading-relaxed">
              Receive formatted bullet-point notifications across Discord Webhooks, Telegram Bot messages, and secure SMTP emails.
            </p>
          </div>
        </div>
      </section>

      {/* Fair Quota Guarantee */}
      <section className="px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="apple-card p-8 text-center border border-white/[0.12] bg-[#141416] space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
            <span>Fair Usage Policy</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            5 Active Automations Included Free
          </h3>
          <p className="text-xs sm:text-sm text-[#A1A1A6] max-w-lg mx-auto leading-relaxed">
            Every account receives up to 5 concurrent active scheduled automations with zero credit cards and zero hidden fees. Pause or remove automations whenever you wish.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenStudio}
              className="apple-btn-primary px-6 py-2.5 text-xs font-medium"
            >
              Start Creating Automations
            </button>
          </div>
        </div>
      </section>

      {/* Minimal macOS Dock-Style Footer */}
      <footer className="border-t border-white/[0.08] py-8 px-6 text-xs text-[#6E6E73]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <Zap className="h-4 w-4 text-[#007AFF]" />
            <span>PromptFlow • Autonomous Micro-Automation Engine</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-[#34C759]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
              All Systems Operational
            </span>
            <span>•</span>
            <span>Built with Apple HIG Craft</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
