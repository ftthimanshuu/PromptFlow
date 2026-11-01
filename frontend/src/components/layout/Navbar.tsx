import React from "react";
import { Zap, Bot, Layers, Settings, LogOut, Sparkles } from "lucide-react";
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

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    profile?.email?.split("@")[0] ||
    "Guest";
  const initial = (displayName.charAt(0) || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-3 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between apple-glass px-4 sm:px-6 py-2.5 rounded-full pointer-events-auto shadow-2xl transition-all">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => setCurrentView("landing")}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-white/90">
              PromptFlow
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-white/70 border border-white/[0.08]">
              Pro
            </span>
          </div>
        </div>

        {/* Apple Segmented Nav Control */}
        <nav className="flex items-center bg-[#1C1C1E]/80 p-1 rounded-full border border-white/[0.08] backdrop-blur-md">
          <button
            onClick={() => setCurrentView("landing")}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === "landing"
                ? "bg-white text-black shadow-md font-semibold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView("studio")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === "studio"
                ? "bg-white text-black shadow-md font-semibold"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Bot className="h-3 w-3" />
            Studio
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === "dashboard"
                ? "bg-white text-black shadow-md font-semibold"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Layers className="h-3 w-3" />
            Dashboard
          </button>
        </nav>

        {/* Right Section: Quota & Account */}
        <div className="flex items-center gap-2.5">
          {/* Strict Active Quota Indicator */}
          <div
            title="Active Quota: Up to 5 concurrent active automations allowed"
            onClick={() => setCurrentView("dashboard")}
            className={`cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              activeCount >= 5
                ? "bg-[#FF9F0A]/10 border-[#FF9F0A]/30 text-[#FF9F0A]"
                : "bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                activeCount >= 5 ? "bg-[#FF9F0A]" : "bg-[#34C759] animate-pulse"
              }`}
            />
            <span>({activeCount}/5 Active)</span>
          </div>

          {demoMode || !user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("signin")}
                className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="apple-btn-primary px-3.5 py-1.5 text-xs font-medium shadow-sm hover:shadow-sky-500/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Get Started</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08] transition-all"
                title="Account Settings"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white font-bold flex items-center justify-center text-[10px]">
                  {initial}
                </div>
                <span className="max-w-[90px] truncate">{displayName}</span>
                <Settings className="h-3 w-3 text-white/50" />
              </button>

              <button
                onClick={signOut}
                className="p-1.5 rounded-full text-white/50 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
