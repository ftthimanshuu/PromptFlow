import React from "react";
import { Zap, Bot, Layers, Settings, LogIn, LogOut, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export type ViewType = "landing" | "studio" | "dashboard";

interface NavbarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onOpenSettings: () => void;
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { profile, user, activeCount, demoMode, signOut } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || profile?.email?.split("@")[0] || "Guest";
  const initial = (displayName.charAt(0) || "U").toUpperCase();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-5 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Brand */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setCurrentView("landing")}
      >
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <div className="flex items-center">
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
            PromptFlow
          </span>
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            v1.0
          </span>
        </div>
      </div>

      {/* View Switcher */}
      <nav className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setCurrentView("landing")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === "landing"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          Overview
        </button>
        <button
          onClick={() => setCurrentView("studio")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === "studio"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          Studio
        </button>
        <button
          onClick={() => setCurrentView("dashboard")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === "dashboard"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Dashboard
        </button>
      </nav>

      {/* Right Actions: Quota, Auth & Profile */}
      <div className="flex items-center gap-3">
        {/* Prominent Active Quota Indicator */}
        <div
          title="Strict Quota: Up to 5 active automations allowed concurrently per account"
          onClick={() => setCurrentView("dashboard")}
          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            activeCount >= 5
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${activeCount >= 5 ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
          <span>({activeCount}/5 Active)</span>
        </div>

        {demoMode || !user ? (
          <>
            <button
              onClick={() => onOpenAuth("signin")}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-colors hidden sm:inline-block"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Get Started</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors shadow-sm"
              title="Edit Profile & Alert Destinations"
            >
              <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                {initial}
              </div>
              <span className="max-w-[100px] truncate font-semibold">{displayName}</span>
              <Settings className="h-3.5 w-3.5 text-slate-500 ml-0.5" />
            </button>

            <button
              onClick={signOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Settings button in demo mode */}
        {demoMode && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            title="Configure Alert Destinations"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
