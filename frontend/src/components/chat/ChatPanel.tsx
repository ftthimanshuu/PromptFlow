import React, { useState, useRef, useEffect } from "react";
import { Sparkles, RotateCcw, Bot, User as UserIcon, Loader2, ArrowUp } from "lucide-react";
import type { ChatMessage } from "../../types/pipeline";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  onResetChat: () => void;
  loading: boolean;
}

const STARTER_PROMPTS = [
  {
    label: "Historical Headlines",
    prompt: "Check https://en.wikipedia.org/wiki/Portal:Current_events daily at 8 AM. Extract today's headlines and send to Discord.",
  },
  {
    label: "Price Drop Monitor",
    prompt: "Monitor this headphone page https://amazon.com/dp/B09XS7JWHH. Alert my Telegram if price drops below 250.",
  },
  {
    label: "Tech Job Radar",
    prompt: "Scan https://news.ycombinator.com/jobs daily for React or Python engineer openings and alert Discord.",
  },
  {
    label: "Release Tracker",
    prompt: "Watch https://github.com/nodejs/node/releases for new release versions and send summary to Email.",
  },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onResetChat,
  loading,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    <div className="flex flex-col h-full bg-[#0D0D0E] border-r border-white/[0.08] font-sans selection:bg-[#007AFF]/30 selection:text-white">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#141416]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white tracking-tight">
              Automation Compiler
            </h2>
          </div>
        </div>
        <button
          onClick={onResetChat}
          title="Start fresh conversation"
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-full hover:bg-white/[0.06] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>New Prompt</span>
        </button>
      </div>

      {/* Messages Scroll View (iMessage dark style) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-medium ${
                msg.role === "user"
                  ? "bg-[#007AFF] text-white"
                  : "bg-white/[0.08] text-white/80 border border-white/[0.08]"
              }`}
            >
              {msg.role === "user" ? (
                <UserIcon className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </div>
            <div
              className={`max-w-[85%] text-xs leading-relaxed p-3.5 transition-all text-left ${
                msg.role === "user"
                  ? "bg-[#007AFF] text-white rounded-[18px] rounded-tr-sm shadow-sm font-normal"
                  : "bg-[#1C1C1E] text-[#F5F5F7] border border-white/[0.08] rounded-[18px] rounded-tl-sm whitespace-pre-wrap shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded-full bg-white/[0.08] text-white/80 border border-white/[0.08] flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-[#1C1C1E] border border-white/[0.08] p-3 rounded-[18px] rounded-tl-sm text-xs text-white/70 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#007AFF]" />
              <span>Analyzing intent & compiling pipeline DSL...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Carousel */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 text-left">
          <p className="text-[11px] font-medium text-white/40 mb-1.5">
            Suggested Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStarter(item.prompt)}
                className="text-[11px] bg-[#1C1C1E] hover:bg-white/[0.1] text-white/70 hover:text-white px-2.5 py-1 rounded-full border border-white/[0.06] transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form with Command Shortcut */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.08] bg-[#141416]">
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
            className="w-full apple-input pl-3.5 pr-10 py-2 text-xs text-white placeholder-white/40 resize-none font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2.5 p-1.5 rounded-full bg-[#007AFF] text-white hover:bg-[#0A84FF] disabled:opacity-30 disabled:hover:bg-[#007AFF] transition-all"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1 text-[10px] text-white/40 text-right pr-1">
          Press <span className="text-white/60 font-mono">Return ↵</span> to compile
        </div>
      </form>
    </div>
  );
};
