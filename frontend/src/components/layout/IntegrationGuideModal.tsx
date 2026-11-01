import React, { useState } from "react";
import { X } from "lucide-react";
import { SegmentedControl } from "../common/SegmentedControl";

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
          background: "rgba(255,255,255,.07)",
          WebkitBackdropFilter: "blur(28px) saturate(170%)",
          backdropFilter: "blur(28px) saturate(170%)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 8px 32px rgba(0,0,0,.35)",
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
        <SegmentedControl<"all" | "discord" | "telegram" | "email">
          name="gd"
          options={[
            { value: "all", label: "All Channels" },
            { value: "discord", label: "Discord" },
            { value: "telegram", label: "Telegram" },
            { value: "email", label: "Gmail / Email" },
          ]}
          value={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          style={{ maxWidth: "520px", marginBottom: "20px" }}
        />

        {/* 3 Step-by-Step Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Discord */}
          {(activeTab === "all" || activeTab === "discord") && (
            <section className="col">
              <h2>Discord</h2>
              <ol>
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
            <section className="col">
              <h2>Telegram</h2>
              <ol>
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
            <section className="col">
              <h2>Gmail / Email</h2>
              <ol>
                <li>Open Manage your Google Account.</li>
                <li>Go to Security.</li>
                <li>Turn on 2-Step Verification.</li>
                <li>Open App Passwords.</li>
                <li>Generate an App Password (16-character) for "Mail".</li>
                <li>Copy the 16-character key into PromptFlow.</li>
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
