import React from "react";
import { useAuth } from "../../context/AuthContext";

export type ViewType = "landing" | "studio" | "dashboard";

interface NavbarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onOpenSettings: () => void;
  onOpenAuth: (mode?: "signin" | "signup") => void;
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSettings,
  onOpenAuth,
  onOpenGuide,
}) => {
  const { user } = useAuth();

  return (
    <header className="w-full pt-4 px-4 sm:px-6 sticky top-0 z-50 pointer-events-none">
      <nav
        className="g pointer-events-auto"
        style={{
          maxWidth: "840px",
          margin: "0 auto",
          borderRadius: "999px",
          padding: "6px 8px 6px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Wordmark with gradient clip */}
        <b
          onClick={() => setCurrentView("landing")}
          className="cursor-pointer select-none transition-opacity hover:opacity-85"
          style={{
            fontSize: "17px",
            letterSpacing: "-.02em",
            fontWeight: 700,
            background: "linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          PromptFlow
        </b>

        {/* Status indicator */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] shadow-[0_0_6px_#30D158]" />
          <span className="m" style={{ color: "#30D158", fontSize: "11px", fontWeight: 500 }}>
            Systems Normal
          </span>
        </div>

        <span style={{ flex: 1 }} />

        {/* Navigation items - Apple Segmented Style */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setCurrentView("studio")}
            className={`min-h-0 text-xs sm:text-[13px] px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
              currentView === "studio"
                ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "text-[#A1A1A6] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            Studio
          </button>

          <button
            type="button"
            onClick={() => setCurrentView("dashboard")}
            className={`min-h-0 text-xs sm:text-[13px] px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
              currentView === "dashboard"
                ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                : "text-[#A1A1A6] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => onOpenGuide?.()}
            className="min-h-0 text-xs sm:text-[13px] px-3.5 py-1.5 rounded-full font-medium text-[#A1A1A6] hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            Guide
          </button>
        </div>

        {/* Right CTA */}
        {user ? (
          <button
            type="button"
            className="ol"
            style={{
              borderRadius: "999px",
              padding: "0 16px",
              minHeight: "36px",
              fontSize: "13px",
              fontWeight: 500,
            }}
            onClick={onOpenSettings}
          >
            Profile
          </button>
        ) : (
          <button
            type="button"
            className="bl"
            style={{
              borderRadius: "999px",
              padding: "0 18px",
              minHeight: "36px",
              fontSize: "13px",
              fontWeight: 500,
            }}
            onClick={() => onOpenAuth("signin")}
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
};
