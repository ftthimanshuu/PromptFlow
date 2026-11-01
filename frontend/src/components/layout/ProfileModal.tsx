import React, { useState, useEffect } from "react";
import { X, Send, Disc as Discord, CheckCircle, Info, User, Mail, LogOut, HelpCircle } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-white/[0.12] rounded-[28px] w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-[#F5F5F7] font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-left">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Account Preferences
          </h2>
          <p className="text-xs text-[#A1A1A6]">
            Configure your personal profile and push notification destinations.
          </p>
        </div>

        {demoMode && (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-white/80 flex items-center justify-between">
            <span>You are in <strong>Guest Demo Mode</strong>.</span>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="apple-btn-primary px-3 py-1 text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5 text-left">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70 mb-1">
              <Mail className="h-3.5 w-3.5 text-white/40" />
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || profile?.email || "guest@promptflow.demo"}
              className="w-full bg-[#1C1C1E] border border-white/[0.06] rounded-[12px] px-3.5 py-2 text-xs text-white/40 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70 mb-1">
              <User className="h-3.5 w-3.5 text-[#007AFF]" />
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full apple-input px-3.5 py-2 text-xs"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70 mb-1">
              <Send className="h-3.5 w-3.5 text-[#007AFF]" />
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="e.g. 6312393356"
              className="w-full apple-input px-3.5 py-2 text-xs"
            />
            <div className="mt-1 flex items-start gap-1 text-[11px] text-white/40">
              <Info className="h-3 w-3 text-white/40 shrink-0 mt-0.5" />
              <span>
                To get your Chat ID: Message <strong>@userinfobot</strong> on Telegram.
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/70 mb-1">
              <Discord className="h-3.5 w-3.5 text-[#5856D6]" />
              Discord Webhook URL
            </label>
            <input
              type="url"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full apple-input px-3.5 py-2 text-xs"
            />
            <div className="mt-1 flex items-start gap-1 text-[11px] text-white/40">
              <Info className="h-3 w-3 text-white/40 shrink-0 mt-0.5" />
              <span>
                Discord Server $\rightarrow$ Channel Settings $\rightarrow$ Integrations $\rightarrow$ Webhooks.
              </span>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[#007AFF] text-xs font-medium transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Step-by-Step Channel Guide</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            {!demoMode && user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-[#FF453A] hover:underline font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="apple-btn-secondary px-3.5 py-1.5 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saved}
                className="apple-btn-primary px-4 py-1.5 text-xs font-medium gap-1.5 disabled:opacity-50"
              >
                {saved ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
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
