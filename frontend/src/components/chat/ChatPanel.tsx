import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await onSendMessage(text);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <section
      className="c"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        height: "calc(100vh - 160px)",
        minHeight: "560px",
        maxHeight: "780px",
        padding: "20px",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="k">Conversational Compiler</h2>
        <button
          type="button"
          onClick={onResetChat}
          style={{
            background: "transparent",
            border: 0,
            color: "#A1A1A6",
            fontSize: "12px",
            minHeight: "auto",
            padding: 0,
            cursor: "pointer",
          }}
        >
          New Prompt
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollContainerRef}
        style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}
      >
        {messages.map((msg) => {
          if (msg.role === "user") {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "85%",
                  background: "rgba(255,255,255,.12)",
                  borderRadius: "18px",
                  padding: "10px 16px",
                  color: "#F5F5F7",
                  fontSize: "13.5px",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: "flex-start",
                maxWidth: "90%",
                padding: "12px 16px",
                borderRadius: "18px",
                background: "rgba(10,132,255,.08)",
                border: "1px solid rgba(10,132,255,.25)",
                color: "#F5F5F7",
                fontSize: "13.5px",
                lineHeight: 1.5,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              <p className="m" style={{ color: "#0A84FF", marginBottom: "4px" }}>
                PromptFlow
              </p>
              {msg.content}
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "90%",
              padding: "12px 16px",
              borderRadius: "18px",
              background: "rgba(10,132,255,.08)",
              border: "1px solid rgba(10,132,255,.25)",
              color: "#A1A1A6",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin text-[#0A84FF]" />
            <span>Analyzing intent and compiling pipeline DSL...</span>
          </div>
        )}
      </div>

      {/* Starter Prompts */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setInput(prompt);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
            className="p"
            style={{ border: 0, cursor: "pointer", minHeight: "auto", textAlign: "left", fontSize: "11.5px" }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Multi-Line Auto-Wrapping Input Box */}
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <div
          className="in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "12px",
            cursor: "text",
            padding: "8px 12px",
            borderRadius: "14px",
          }}
          onClick={() => textareaRef.current?.focus()}
        >
          <textarea
            ref={textareaRef}
            id="prompt-input"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe an automation in plain English..."
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              padding: "4px 0",
              color: "#F5F5F7",
              fontSize: "13.5px",
              lineHeight: 1.45,
              outline: 0,
              resize: "none",
              boxShadow: "none",
              fontFamily: 'inherit',
              overflowY: "auto",
              maxHeight: "120px",
              wordBreak: "break-word",
            }}
          />
          <span className="m t" style={{ whiteSpace: "nowrap", fontSize: "11px", marginBottom: "4px" }}>
            Return ↵ to compile
          </span>
        </div>
      </form>
    </section>
  );
};
