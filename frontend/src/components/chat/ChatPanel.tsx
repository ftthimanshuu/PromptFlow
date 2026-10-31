import React, { useState } from "react";
import { Send, Sparkles, RotateCcw, Bot, User as UserIcon, Loader2 } from "lucide-react";
import type { ChatMessage } from "../../types/pipeline";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  onResetChat: () => void;
  loading: boolean;
}

const STARTER_PROMPTS = [
  {
    label: "Notice Board Monitor",
    prompt: "Check https://www.rgpv.ac.in daily at 9 AM. If there is a notice regarding 7th sem B.Tech timetable, alert my Telegram.",
  },
  {
    label: "Product Price Watcher",
    prompt: "Monitor this headphone page https://example.com/headphones. Alert me if the price drops below 3000.",
  },
  {
    label: "Job & Internship Alert",
    prompt: "Scan https://news.ycombinator.com/jobs daily for React or Python developer openings and send to Discord.",
  },
  {
    label: "Tech Release Tracker",
    prompt: "Watch https://github.com/nodejs/node/releases for new release versions and alert me.",
  },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onResetChat,
  loading,
}) => {
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    await onSendMessage(text);
  }

  function handleSelectStarter(prompt: string) {
    setInput(prompt);
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border-r border-slate-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white">AI Automation Compiler</h2>
        </div>
        <button
          onClick={onResetChat}
          title="Start fresh conversation"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-sky-400 border border-slate-700"
              }`}
            >
              {msg.role === "user" ? (
                <UserIcon className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={`max-w-[82%] text-xs leading-relaxed p-3.5 rounded-2xl ${
                msg.role === "user"
                  ? "bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-600/10"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-wrap"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
              <span>Analyzing intent & compiling pipeline DSL...</span>
            </div>
          </div>
        )}
      </div>

      {/* Starter Prompts Carousel / Chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Example Day-to-Day Prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStarter(item.prompt)}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-all text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe what you want to automate in plain English..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-12 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
