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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-white mb-1">Account & Alert Preferences</h2>
          <p className="text-xs text-slate-400">
            Manage your personal profile and automation notification destinations.
          </p>
        </div>

        {/* Demo Mode Notice */}
        {demoMode && (
          <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center justify-between">
            <span>You are currently in <strong>Guest Demo Mode</strong>.</span>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] shadow-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Email Info (read-only) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || profile?.email || "guest@promptflow.demo"}
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <User className="h-3.5 w-3.5 text-sky-400" />
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Telegram Settings */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Send className="h-3.5 w-3.5 text-sky-400" />
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="e.g. 6312393356"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
            <div className="mt-1 flex items-start gap-1 text-[11px] text-slate-500">
              <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To find your Chat ID: Message <strong>@userinfobot</strong> on Telegram and copy the `Id`.
              </span>
            </div>
          </div>

          {/* Discord Settings */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Discord className="h-3.5 w-3.5 text-indigo-400" />
              Discord Webhook URL
            </label>
            <input
              type="url"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
            <div className="mt-1 flex items-start gap-1 text-[11px] text-slate-500">
              <Info className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Discord Server $\rightarrow$ Channel Settings $\rightarrow$ Integrations $\rightarrow$ Webhooks.
              </span>
            </div>
          </div>

          {/* Setup Guide Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-sky-400 hover:text-sky-300 text-xs font-semibold transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>How to find Telegram ID & Discord Webhook?</span>
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {!demoMode && user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
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
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saved}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all disabled:bg-emerald-600"
              >
                {saved ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  "Save Preferences"
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
