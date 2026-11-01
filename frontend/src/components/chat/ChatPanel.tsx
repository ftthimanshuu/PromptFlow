import React, { useState, useRef, useEffect } from "react";
import { Loader2, ArrowUp, Sparkles } from "lucide-react";
import type { ChatMessage } from "../../types/pipeline";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  onResetChat: () => void;
  loading: boolean;
}

const STARTER_PROMPTS = [
  "Historical headlines from Wikipedia",
  "Amazon price drop tracker",
  "Hacker News top story alert",
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

  return (
    <section className="c flex flex-col h-[740px] p-6 text-left border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0A84FF]" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Conversational Compiler
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetChat}
          className="text-xs text-[#A1A1A6] hover:text-white px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all min-h-0"
        >
          New Prompt
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 py-4 pr-1">
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div
                key={msg.id}
                className="ml-auto max-w-[85%] bg-white/[0.08] backdrop-blur-md border border-white/[0.08] rounded-2xl px-4 py-2.5 text-sm text-white font-normal leading-relaxed shadow-sm"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="mr-auto max-w-[90%] bg-[#0071E3]/[0.08] backdrop-blur-md border border-[#0071E3]/20 rounded-2xl p-4 text-sm text-[#F5F5F7] leading-relaxed shadow-sm"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />
                <span className="text-[11px] font-semibold tracking-wide text-[#0A84FF] uppercase">
                  PromptFlow AI
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          );
        })}

        {loading && (
          <div className="mr-auto max-w-[90%] bg-[#0071E3]/[0.08] backdrop-blur-md border border-[#0071E3]/20 rounded-2xl p-4 text-xs text-[#A1A1A6] flex items-center gap-2.5 shadow-sm">
            <Loader2 className="w-4 h-4 text-[#0A84FF] animate-spin" />
            <span>Analyzing prompt intent and structuring steps...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestion Chips */}
      <div className="pt-2 pb-3">
        <p className="text-[11px] text-[#8E8E93] mb-2 font-medium">Quick examples:</p>
        <div className="flex items-center gap-2 flex-wrap">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="text-xs text-[#A1A1A6] hover:text-white px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all min-h-0 text-left active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field Capsule */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="in flex items-center gap-2 p-2 rounded-full border border-white/10 bg-white/[0.05] focus-within:border-[#0A84FF] focus-within:shadow-[0_0_0_3px_rgba(10,132,255,0.2)] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to automate..."
            className="flex-1 bg-transparent border-0 px-4 py-1.5 text-sm text-white placeholder-[#8E8E93] focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bl flex items-center justify-center w-8 h-8 rounded-full min-h-0 p-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-all"
            title="Compile"
          >
            <ArrowUp className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </section>
  );
};
