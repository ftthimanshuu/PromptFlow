import React, { useState } from "react";
import { X, Send, Disc as Discord, CheckCircle, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const [telegramChatId, setTelegramChatId] = useState(profile?.telegram_chat_id || "");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(profile?.discord_webhook_url || "");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      telegram_chat_id: telegramChatId.trim() || null,
      discord_webhook_url: discordWebhookUrl.trim() || null,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-white mb-1">Alert Destinations & Settings</h2>
        <p className="text-xs text-slate-400 mb-6">
          Configure where PromptFlow delivers your real-time automation alerts.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Telegram Settings */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
              <Send className="h-4 w-4 text-sky-400" />
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="e.g. 987654321"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500">
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To find your Chat ID: Message <strong>@userinfobot</strong> on Telegram, click Start, and copy the `Id`.
              </span>
            </div>
          </div>

          {/* Discord Settings */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5">
              <Discord className="h-4 w-4 text-indigo-400" />
              Discord Webhook URL
            </label>
            <input
              type="url"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500">
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Channel Settings $\rightarrow$ Integrations $\rightarrow$ Webhooks $\rightarrow$ Copy Webhook URL.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
        </form>
      </div>
    </div>
  );
};
