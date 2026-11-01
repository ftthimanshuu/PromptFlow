import React from "react";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, User, Plus } from "lucide-react";

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
  const { user, profile } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <nav
      className="g"
      style={{
        maxWidth: "920px",
        margin: "0 auto",
        borderRadius: "999px",
        padding: "8px 10px 8px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {/* Brand Logo */}
      <b
        onClick={() => setCurrentView("landing")}
        style={{
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "-.02em",
          background: "linear-gradient(#fff,#8E8E93)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          cursor: "pointer",
        }}
      >
        PromptFlow
      </b>

      {/* Back button when in Studio */}
      {currentView === "studio" && (
        <button
          type="button"
          onClick={() => setCurrentView("dashboard")}
          className="ol"
          style={{
            borderRadius: "999px",
            minHeight: "32px",
            padding: "0 12px",
            fontSize: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ArrowLeft style={{ width: "13px", height: "13px" }} />
          <span>Dashboard</span>
        </button>
      )}

      <span style={{ flex: 1 }} />

      {/* Center Links based on current view and auth status */}
      {currentView === "landing" && (
        <>
          {isLoggedIn ? (
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView("dashboard");
              }}
              style={{ fontSize: "13px", color: "#F5F5F7", fontWeight: 500 }}
            >
              Dashboard
            </a>
          ) : null}
          <a
            href="/guide"
            onClick={(e) => {
              e.preventDefault();
              onOpenGuide?.();
            }}
            style={{ fontSize: "13px" }}
          >
            Setup Guide
          </a>
        </>
      )}

      {currentView === "dashboard" && (
        <>
          <a
            href="/guide"
            onClick={(e) => {
              e.preventDefault();
              onOpenGuide?.();
            }}
            style={{ fontSize: "13px" }}
          >
            Setup Guide
          </a>
          <button
            type="button"
            className="bl"
            style={{
              borderRadius: "999px",
              minHeight: "32px",
              padding: "0 14px",
              fontSize: "12.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
            onClick={() => setCurrentView("studio")}
          >
            <Plus style={{ width: "14px", height: "14px" }} />
            <span>New Automation</span>
          </button>
        </>
      )}

      {currentView === "studio" && (
        <a
          href="/guide"
          onClick={(e) => {
            e.preventDefault();
            onOpenGuide?.();
          }}
          style={{ fontSize: "13px" }}
        >
          Setup Guide
        </a>
      )}

      {/* Account Action on Right */}
      {isLoggedIn ? (
        <button
          type="button"
          className="ol"
          style={{
            borderRadius: "999px",
            minHeight: "34px",
            padding: "0 14px",
            fontSize: "12.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={onOpenSettings}
        >
          <User style={{ width: "13px", height: "13px", color: "#0A84FF" }} />
          <span>{profile?.full_name?.split(" ")[0] || "Profile"}</span>
        </button>
      ) : (
        <button
          type="button"
          className="bl"
          style={{
            borderRadius: "999px",
            minHeight: "34px",
            padding: "0 18px",
            fontSize: "13px",
            fontWeight: 600,
          }}
          onClick={() => onOpenAuth("signin")}
        >
          Sign In
        </button>
      )}
    </nav>
  );
};
