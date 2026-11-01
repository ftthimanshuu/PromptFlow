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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-white/[0.12] rounded-[28px] w-full max-w-lg shadow-2xl relative overflow-hidden my-6 text-[#F5F5F7] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.08] text-xs font-medium mb-2.5">
              <HelpCircle className="h-3 w-3 text-[#007AFF]" />
              <span>Step-by-Step Setup Guide</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Connect Alert Channels
            </h2>
            <p className="text-xs text-[#A1A1A6] mt-1">
              Instructions for connecting Discord, Telegram, or Email notifications in 60 seconds.
            </p>
          </div>

          {/* Cupertino Segmented Tabs */}
          <div className="flex bg-[#1C1C1E] p-1 rounded-full border border-white/[0.08] mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "email"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Mail className="h-3 w-3" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telegram")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "telegram"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Send className="h-3 w-3" />
              <span>Telegram</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("discord")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "discord"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Discord className="h-3 w-3" />
              <span>Discord</span>
            </button>
          </div>

          {/* TAB 1: EMAIL */}
          {activeTab === "email" && (
            <div className="space-y-3.5 text-left text-xs">
              <div className="p-4 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759]">
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <ShieldCheck className="h-4 w-4 text-[#34C759]" />
                  <span>Zero Password Setup for Users</span>
                </div>
                <p className="text-white/80 leading-relaxed text-[11px]">
                  Users <strong>never</strong> need to provide an app password. PromptFlow’s central verified SMTP server delivers notifications directly <em>to</em> their email address!
                </p>
              </div>

              <div className="space-y-2.5 text-[#F5F5F7]">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                  <span className="h-5 w-5 rounded-full bg-black/50 text-[#34C759] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                    1
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Use your Account Email</strong>
                    <span className="text-white/60 text-[11px]">
                      The email address you sign up with is automatically used as the default destination.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                  <span className="h-5 w-5 rounded-full bg-black/50 text-[#34C759] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                    2
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Prompt for Email Dispatch</strong>
                    <span className="text-white/60 text-[11px]">
                      Say: <em>"Check website daily and send highlights to my email."</em>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                  <span className="h-5 w-5 rounded-full bg-black/50 text-[#34C759] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                    3
                  </span>
                  <div>
                    <strong className="text-white block mb-0.5">Instant Formatted Delivery</strong>
                    <span className="text-white/60 text-[11px]">
                      When the condition evaluates to true, an HTML email with clear bullet points arrives in your inbox.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEGRAM */}
          {activeTab === "telegram" && (
            <div className="space-y-3 text-left text-xs text-[#F5F5F7]">
              <div className="p-3 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[11px] flex items-center justify-between">
                <span>Setup time: <strong>45 seconds</strong>. Completely free.</span>
                <span className="uppercase font-semibold bg-[#007AFF]/20 px-2 py-0.5 rounded-full text-[9px]">
                  Direct Push
                </span>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  1
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Find your Telegram Chat ID</strong>
                  <p className="text-white/60 text-[11px] mb-2">
                    Open the verified <strong>@userinfobot</strong> on Telegram and tap <strong>Start</strong>.
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#007AFF] hover:bg-[#0A84FF] text-white font-medium text-[11px] transition-all"
                    >
                      <span>Open @userinfobot</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy("@userinfobot")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/[0.08] font-medium text-[11px] transition-all"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedBot ? "Copied" : "Copy Name"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  2
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Copy the number next to `Id:`</strong>
                  <p className="text-white/60 text-[11px]">
                    Copy your numeric user ID (e.g. <code className="text-[#007AFF] font-mono bg-black/40 px-1.5 py-0.5 rounded">6312393356</code>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  3
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Paste into PromptFlow</strong>
                  <p className="text-white/60 text-[11px]">
                    Paste your Chat ID into the <strong>Telegram Chat ID</strong> field in Settings or when signing up.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISCORD */}
          {activeTab === "discord" && (
            <div className="space-y-3 text-left text-xs text-[#F5F5F7]">
              <div className="p-3 rounded-xl bg-[#5856D6]/10 border border-[#5856D6]/20 text-[#5856D6] text-[11px] flex items-center justify-between">
                <span>Setup time: <strong>60 seconds</strong>. Rich formatted embeds.</span>
                <span className="uppercase font-semibold bg-[#5856D6]/20 px-2 py-0.5 rounded-full text-[9px]">
                  Webhooks
                </span>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#5856D6] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  1
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Open Discord Channel Settings</strong>
                  <p className="text-white/60 text-[11px]">
                    In your Discord server, hover over your target channel and click the <strong>⚙️ Gear icon</strong> (Edit Channel).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#5856D6] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  2
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Go to Integrations $\rightarrow$ Webhooks</strong>
                  <p className="text-white/60 text-[11px]">
                    Click <strong>Integrations</strong>, then click <strong>New Webhook</strong> and click <strong>Copy Webhook URL</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="h-5 w-5 rounded-full bg-black/50 text-[#5856D6] font-bold flex items-center justify-center shrink-0 text-[10px] border border-white/[0.08]">
                  3
                </span>
                <div className="flex-1">
                  <strong className="text-white block mb-0.5">Paste into PromptFlow</strong>
                  <p className="text-white/60 text-[11px]">
                    Paste the copied URL into the <strong>Discord Webhook URL</strong> field.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-white/40">
              All 3 destinations can be updated anytime in Settings.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="apple-btn-secondary px-4 py-1.5 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
