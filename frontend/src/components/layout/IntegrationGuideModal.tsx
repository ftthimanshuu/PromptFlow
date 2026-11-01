import React, { useState } from "react";
import {
  X,
  Send,
  Disc as Discord,
  Mail,
  ExternalLink,
  Copy,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "telegram" | "discord" | "email";
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = "telegram",
}) => {
  const [activeTab, setActiveTab] = useState<"telegram" | "discord" | "email">(initialTab);
  const [copiedBot, setCopiedBot] = useState(false);

  if (!isOpen) return null;

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden my-6">
        {/* Accent Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold mb-2">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Step-by-Step Setup Guide</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">How to connect alert channels</h2>
            <p className="text-xs text-slate-400 mt-1">
              Follow these simple 1-minute instructions to connect Telegram, Discord, or Email.
            </p>
          </div>

          {/* Channel Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "email"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email (Instant)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telegram")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "telegram"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              Telegram (1 min)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("discord")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "discord"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Discord className="h-3.5 w-3.5" />
              Discord (1 min)
            </button>
          </div>

          {/* TAB 1: EMAIL */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Zero Password Setup for Users</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Users <strong>never</strong> need to provide an app password or email credentials. PromptFlow’s central platform server sends the alert directly <em>to</em> their email address!
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="h-6 w-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Enter your normal Email</strong>
                    <span>Use the email address you signed up with or specify one in your profile settings.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="h-6 w-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Select Email in your prompt</strong>
                    <span>
                      Prompt PromptFlow like: <em>"Check website XYZ daily and send summary to my email."</em>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="h-6 w-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Instant In-box Delivery</strong>
                    <span>
                      When the condition triggers, a styled HTML email arrives in your inbox with bulleted summaries.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEGRAM */}
          {activeTab === "telegram" && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center justify-between">
                <span>Total time: <strong>45 seconds</strong>. Completely free.</span>
                <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded">
                  Instant Push
                </span>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Find your Telegram Chat ID</strong>
                  <p className="text-slate-400 mb-2">
                    Open the verified <strong>@userinfobot</strong> on Telegram and tap <strong>Start</strong>.
                  </p>
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                  >
                    <span>Open @userinfobot</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Copy the number next to `Id:`</strong>
                  <p className="text-slate-400">
                    The bot will reply with your profile info. Copy the numeric ID (e.g. <code className="text-sky-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">6312393356</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Start PromptFlow Notifier Bot</strong>
                  <p className="text-slate-400 mb-2">
                    Open our bot and click <strong>Start</strong> so Telegram gives it permission to message you.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy("@userinfobot")}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedBot ? "Copied!" : "Copy Bot Name"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Paste into PromptFlow</strong>
                  <p className="text-slate-400">
                    Paste your Chat ID into the <strong>Telegram Chat ID</strong> field during sign up or in Settings. Done!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISCORD */}
          {activeTab === "discord" && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
                <span>Total time: <strong>60 seconds</strong>. Rich formatted embeds.</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                  Channel Alerts
                </span>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Open Discord Channel Settings</strong>
                  <p className="text-slate-400">
                    In your Discord server, hover over the text channel where you want notifications (e.g. <code>#alerts</code>) and click the <strong>⚙️ Gear icon</strong> (Edit Channel).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Click "Integrations"</strong>
                  <p className="text-slate-400">
                    On the left sidebar, click <strong>Integrations</strong> $\rightarrow$ click <strong>Webhooks</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Create & Copy Webhook URL</strong>
                  <p className="text-slate-400">
                    Click <strong>New Webhook</strong> (name it "PromptFlow"), then click the <strong>Copy Webhook URL</strong> button.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="h-6 w-6 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Paste into PromptFlow</strong>
                  <p className="text-slate-400">
                    Paste the copied URL into the <strong>Discord Webhook URL</strong> field in PromptFlow. Done!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Need help? All 3 destinations can be modified anytime in Settings.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
