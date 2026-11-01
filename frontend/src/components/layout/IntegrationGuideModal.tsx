import React, { useState } from "react";
import { X } from "lucide-react";

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "all" | "discord" | "telegram" | "email";
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = "all",
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "discord" | "telegram" | "email">(initialTab);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background: "rgba(0,0,0,.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div
        className="c relative text-left"
        style={{
          width: "100%",
          maxWidth: "1080px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
          background: "#141416",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "0 4px 24px rgba(0,0,0,.4)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: 0,
            color: "#A1A1A6",
            minHeight: "auto",
            padding: "6px",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X style={{ width: "18px", height: "18px" }} />
        </button>

        <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-.02em", color: "#F5F5F7" }}>
          Channel Setup Guide
        </h1>
        <p className="s" style={{ margin: "4px 0 20px" }}>
          Connect where PromptFlow should deliver your alerts.
        </p>

        {/* Channel Tab Filter */}
        <div style={{ display: "inline-flex", background: "#1C1C1E", borderRadius: "12px", padding: "3px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            style={{
              background: activeTab === "all" ? "#2C2C2E" : "transparent",
              color: activeTab === "all" ? "#F5F5F7" : "#A1A1A6",
              padding: "0 18px",
              minHeight: "34px",
              border: 0,
              borderRadius: "9px",
              fontSize: "13px",
            }}
          >
            All Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discord")}
            style={{
              background: activeTab === "discord" ? "#2C2C2E" : "transparent",
              color: activeTab === "discord" ? "#F5F5F7" : "#A1A1A6",
              padding: "0 18px",
              minHeight: "34px",
              border: 0,
              borderRadius: "9px",
              fontSize: "13px",
            }}
          >
            Discord
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telegram")}
            style={{
              background: activeTab === "telegram" ? "#2C2C2E" : "transparent",
              color: activeTab === "telegram" ? "#F5F5F7" : "#A1A1A6",
              padding: "0 18px",
              minHeight: "34px",
              border: 0,
              borderRadius: "9px",
              fontSize: "13px",
            }}
          >
            Telegram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            style={{
              background: activeTab === "email" ? "#2C2C2E" : "transparent",
              color: activeTab === "email" ? "#F5F5F7" : "#A1A1A6",
              padding: "0 18px",
              minHeight: "34px",
              border: 0,
              borderRadius: "9px",
              fontSize: "13px",
            }}
          >
            Gmail / Email
          </button>
        </div>

        {/* 3 Step-by-Step Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Discord */}
          {(activeTab === "all" || activeTab === "discord") && (
            <section
              style={{
                background: "#1C1C1E",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-.01em", marginBottom: "12px", color: "#F5F5F7" }}>
                Discord
              </h2>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#A1A1A6", fontSize: "14px" }}>
                <li>Create a Discord Server (or pick yours).</li>
                <li>Open Channel Settings.</li>
                <li>Go to Integrations.</li>
                <li>Choose New Webhook.</li>
                <li>Copy Webhook URL and paste it into PromptFlow.</li>
              </ol>
            </section>
          )}

          {/* Telegram */}
          {(activeTab === "all" || activeTab === "telegram") && (
            <section
              style={{
                background: "#1C1C1E",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-.01em", marginBottom: "12px", color: "#F5F5F7" }}>
                Telegram
              </h2>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#A1A1A6", fontSize: "14px" }}>
                <li>Search <span className="m" style={{ color: "#0A84FF" }}>@BotFather</span> in Telegram.</li>
                <li>Send <span className="m" style={{ color: "#0A84FF" }}>/newbot</span> and follow the prompts.</li>
                <li>Copy the bot token it gives you.</li>
                <li>Message <span className="m" style={{ color: "#0A84FF" }}>@userinfobot</span> to get your Chat ID.</li>
                <li>Paste the Chat ID into PromptFlow.</li>
              </ol>
            </section>
          )}

          {/* Gmail / Email */}
          {(activeTab === "all" || activeTab === "email") && (
            <section
              style={{
                background: "#1C1C1E",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-.01em", marginBottom: "12px", color: "#F5F5F7" }}>
                Gmail / Email
              </h2>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "#A1A1A6", fontSize: "14px" }}>
                <li>Open Manage your Google Account.</li>
                <li>Go to Security.</li>
                <li>Turn on 2-Step Verification.</li>
                <li>Open App Passwords.</li>
                <li>Copy the 16-character key into PromptFlow.</li>
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
