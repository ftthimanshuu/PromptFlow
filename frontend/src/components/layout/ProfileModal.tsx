import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { IntegrationGuideModal } from "./IntegrationGuideModal";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { profile, user, demoMode, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [telegramChatId, setTelegramChatId] = useState(profile?.telegram_chat_id || "");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(profile?.discord_webhook_url || "");
  const [saved, setSaved] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setTelegramChatId(profile.telegram_chat_id || "");
      setDiscordWebhookUrl(profile.discord_webhook_url || "");
    }
  }, [profile]);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      full_name: fullName.trim() || null,
      telegram_chat_id: telegramChatId.trim() || null,
      discord_webhook_url: discordWebhookUrl.trim() || null,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }

  async function handleSignOut() {
    await signOut();
    onClose();
  }

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
        className="c apple-spring-modal relative text-left"
        style={{
          width: "100%",
          maxWidth: "460px",
          boxSizing: "border-box",
          background: "rgba(255,255,255,.07)",
          WebkitBackdropFilter: "blur(28px) saturate(170%)",
          backdropFilter: "blur(28px) saturate(170%)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 12px 48px rgba(0,0,0,.5)",
        }}
      >
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
          Account Preferences
        </h1>
        <p className="s" style={{ margin: "4px 0 20px" }}>
          Configure your personal profile and alert delivery destinations.
        </p>

        {demoMode && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(255,255,255,.06)",
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>You are in <strong>Guest Demo Mode</strong>.</span>
            {onOpenAuth && (
              <button
                type="button"
                className="bl"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                style={{ borderRadius: "999px", padding: "0 14px", minHeight: "32px", fontSize: "12px" }}
              >
                Sign In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <label htmlFor="prof-email">Account Email</label>
            <input
              id="prof-email"
              type="text"
              disabled
              value={user?.email || profile?.email || "guest@promptflow.demo"}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                padding: "12px 16px",
                fontSize: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.08)",
                color: "#8E8E93",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <label htmlFor="prof-name">Display Name</label>
            <input
              id="prof-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                padding: "12px 16px",
                fontSize: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#F5F5F7",
              }}
            />
          </div>

          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <label htmlFor="prof-tg">Telegram Chat ID</label>
            <input
              id="prof-tg"
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="e.g. 6312393356"
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                padding: "12px 16px",
                fontSize: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#F5F5F7",
              }}
            />
          </div>

          <div style={{ width: "100%", boxSizing: "border-box" }}>
            <label htmlFor="prof-dc">Discord Webhook URL</label>
            <input
              id="prof-dc"
              type="url"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                padding: "12px 16px",
                fontSize: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#F5F5F7",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              color: "#0A84FF",
              fontSize: "13px",
              fontWeight: 500,
              textAlign: "left",
              minHeight: "auto",
              cursor: "pointer",
            }}
          >
            How to find Telegram ID &amp; Discord Webhook →
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            {!demoMode && user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="dg"
                style={{ borderRadius: "10px", padding: "0 14px", minHeight: "36px", fontSize: "13px" }}
              >
                Sign Out
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="ol"
                onClick={onClose}
                style={{ borderRadius: "10px", padding: "0 14px", minHeight: "36px", fontSize: "13px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saved}
                className="bl"
                style={{ borderRadius: "10px", padding: "0 16px", minHeight: "36px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {saved ? <Check style={{ width: "16px", height: "16px" }} /> : null}
                <span>{saved ? "Saved" : "Save Preferences"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <IntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
