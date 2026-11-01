import React, { useState } from "react";
import {
  Zap,
  Bot,
  ArrowRight,
  Globe,
  BrainCircuit,
  GitBranch,
  Bell,
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LandingPageProps {
  onOpenStudio: () => void;
  onOpenDashboard: () => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
}

const SAMPLE_DEMOS = [
  {
    title: "E-Commerce Price Watcher",
    prompt: "Monitor Sony WH-1000XM5 headphones on Amazon. If price drops below £250, alert my Telegram.",
    url: "https://amazon.com/dp/B09XS7JWHH",
    field: "step_2.price < 250",
    channel: "Telegram",
    cron: "Every 2 hours",
  },
  {
    title: "University Notice Radar",
    prompt: "Check university portal daily at 9 AM for 7th-sem exam schedules. Send notice link to Discord.",
    url: "https://university.edu/notices",
    field: "step_2.found == true",
    channel: "Discord",
    cron: "Daily at 9:00 AM",
  },
  {
    title: "GitHub Release Tracker",
    prompt: "Watch Node.js releases on GitHub. If new v22+ version releases, send changelog summary to my email.",
    url: "https://github.com/nodejs/node/releases",
    field: 'step_2.version contains "v22"',
    channel: "Email",
    cron: "Daily at 8:00 AM",
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
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden">
      {/* Background Radial Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/15 via-sky-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-40 right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-xs font-semibold text-slate-300 mb-8 shadow-inner hover:border-sky-500/40 transition-colors cursor-pointer"
             onClick={() => onOpenAuth("signup")}>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent font-bold">
            PromptFlow 1.0 Live
          </span>
          <span className="text-slate-500">•</span>
          <span>Turn Natural Language into Autonomous Cron Monitors</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl space-y-5">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Web monitoring without code or complex node graphs.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Prompt what you want to watch. PromptFlow scrapes the target page, extracts structured data with LLMs, evaluates deterministic thresholds, and dispatches push alerts to your{" "}
            <span className="text-sky-400 font-medium">Telegram</span>,{" "}
            <span className="text-indigo-400 font-medium">Discord</span>, or{" "}
            <span className="text-emerald-400 font-medium">Email</span>.
          </p>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Bot className="h-4 w-4" />
              <span>Open Studio & Prompt Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {user ? (
              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <span>Go to My Dashboard</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth("signup")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <span>Create Free Account</span>
                <span className="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  5 Active Quota
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Live Interactive Pipeline Simulator */}
        <section className="mt-16 w-full max-w-4xl">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Interactive Execution Preview
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SAMPLE_DEMOS.map((demo, idx) => (
                <button
                  key={demo.title}
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                    selectedDemoIndex === idx
                      ? "bg-slate-800 text-white border border-sky-500/50 shadow-md shadow-sky-500/10"
                      : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Pipeline Card Glassmorphism */}
          <div className="relative rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden group">
            {/* Top Bar with Status & Cron */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {activeDemo.title}
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 max-w-lg mt-0.5 line-clamp-1">
                    "{activeDemo.prompt}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>{activeDemo.cron}</span>
              </div>
            </div>

            {/* Step Chain Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mt-6">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 1
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Stealth Scraper</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {activeDemo.url}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 2
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">LLM Extraction</div>
                  <div className="text-[11px] text-purple-300 font-mono mt-0.5 truncate">
                    Groq 70B & Gemini
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <GitBranch className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 3
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Deterministic Rule</div>
                  <div className="text-[11px] text-amber-300 font-mono mt-0.5 truncate">
                    {activeDemo.field}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Step 4
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Push Alert</div>
                  <div className="text-[11px] text-emerald-300 font-medium mt-0.5 flex items-center gap-1">
                    <span>{activeDemo.channel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Run CTA in Preview */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                100% deterministic sandboxed execution with SSRF protection.
              </span>
              <button
                onClick={onOpenStudio}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Test in Studio</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Pillars Grid */}
        <section className="mt-28 w-full max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered for reliability & zero noise.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Every pipeline translates your intent into an auditable 4-step DSL that runs safely on background daemons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Stealth Scraper & Firewall</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Realistic browser headers bypass basic WAF blocks. Pre-socket DNS inspection blocks SSRF attacks against private subnets and localhost.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hybrid LLM Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Groq Llama 3.3 70B delivers sub-second structured JSON extraction with automatic fallback to Google Gemini 3.5 Flash.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Multi-Channel Push</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured bullet points delivered directly to Telegram direct messages, rich Discord channel embeds, or styled HTML emails.
              </p>
            </div>
          </div>
        </section>

        {/* Quota & Fairness Section */}
        <section className="mt-24 w-full max-w-4xl p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Fair Usage & Strict Quotas
            </span>
            <h3 className="text-2xl font-bold text-white">
              5 Active Automations per User Account
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every free user gets up to 5 concurrent active micro-pipelines scheduled on background cron daemons. Pause or delete old automations anytime to free up quota.
            </p>
            <div className="pt-3">
              <button
                onClick={onOpenStudio}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all"
              >
                Create Your First Automation
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 px-8 flex flex-wrap items-center justify-between text-xs text-slate-500 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 font-semibold text-slate-400">
          <Zap className="h-4 w-4 text-sky-400" />
          <span>PromptFlow • AI Micro-Automation Platform</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span>Node.js • React • Supabase • Groq</span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Systems Operational
          </span>
        </div>
      </footer>
    </div>
  );
};
