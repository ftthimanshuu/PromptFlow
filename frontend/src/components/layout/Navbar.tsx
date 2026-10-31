import React from "react";
import { Zap, Bot, Layers, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  currentView: "studio" | "automations";
  setCurrentView: (view: "studio" | "automations") => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSettings,
}) => {
  const { profile, activeCount, demoMode } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
            PromptFlow
          </span>
          <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            v1.0
          </span>
        </div>
      </div>

      {/* View Switcher */}
      <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
        <button
          onClick={() => setCurrentView("studio")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentView === "studio"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot className="h-4 w-4" />
          Automation Studio
        </button>
        <button
          onClick={() => setCurrentView("automations")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentView === "automations"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          My Automations
        </button>
      </nav>

      {/* Right Actions: Quota Indicator & Profile */}
      <div className="flex items-center gap-3">
        {/* Quota Badge */}
        <div
          title="Strict quota: Up to 5 active automations allowed per account"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            activeCount >= 5
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{activeCount}/5 Active</span>
        </div>

        {demoMode && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Guest Demo
          </span>
        )}

        {/* Profile / Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span className="max-w-[120px] truncate">{profile?.email || "Settings"}</span>
        </button>
      </div>
    </header>
  );
};
