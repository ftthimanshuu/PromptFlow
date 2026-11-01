import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import type { StepDefinition } from "../../types/pipeline";

interface StepDrawerProps {
  step: StepDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStep: StepDefinition) => void;
}

export const StepDrawer: React.FC<StepDrawerProps> = ({
  step,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !step) return null;

  const [config, setConfig] = useState<Record<string, any>>({ ...step.config });

  useEffect(() => {
    if (step) {
      setConfig({ ...step.config });
    }
  }, [step.step_id, step.config]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!step) return;
    onSave({
      step_id: step.step_id,
      type: step.type,
      config,
    });
    onClose();
  }

  function handleInsertVariable(variable: string) {
    const currentMsg = config.message || "";
    setConfig({
      ...config,
      message: `${currentMsg} {{${variable}}}`,
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="apple-spring-modal"
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          background: "rgba(18, 20, 28, 0.92)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderLeft: "1px solid rgba(255,255,255,.12)",
          boxShadow: "-12px 0 48px rgba(0,0,0,.65)",
          padding: "24px 28px",
          boxSizing: "border-box",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#F5F5F7",
          textAlign: "left",
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              marginBottom: "20px",
            }}
          >
            <div>
              <span className="p" style={{ fontSize: "11px", color: "#0A84FF", background: "rgba(10,132,255,.12)" }}>
                Step {step.step_id} Parameter Inspector
              </span>
              <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#F5F5F7", marginTop: "4px", textTransform: "capitalize" }}>
                Configure {step.type.replace("_", " ")}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
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
          </div>

          <form id="step-edit-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Scrape Config Form */}
            {step.type === "scrape" && (
              <>
                <div>
                  <label>Target Website URL</label>
                  <input
                    type="url"
                    required
                    value={config.url || ""}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="https://example.com/notices"
                    style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "13px" }}
                  />
                  <span className="s" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
                    Public URL fetched and evaluated during execution.
                  </span>
                </div>
                <div>
                  <label>Max Scraped Characters</label>
                  <input
                    type="number"
                    value={config.max_length || 10000}
                    onChange={(e) =>
                      setConfig({ ...config, max_length: parseInt(e.target.value, 10) })
                    }
                    style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "13px" }}
                  />
                  <span className="s" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
                    Limits input token consumption during AI analysis.
                  </span>
                </div>
              </>
            )}

            {/* AI Filter Config Form */}
            {step.type === "ai_filter" && (
              <>
                <div>
                  <label>Extraction Prompt</label>
                  <textarea
                    rows={4}
                    required
                    value={config.instruction || ""}
                    onChange={(e) => setConfig({ ...config, instruction: e.target.value })}
                    placeholder="e.g. Scan notices for exam schedules. Return found, title, and link."
                    style={{ width: "100%", fontSize: "13px", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label>Expected JSON Keys (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(config.expected_fields) ? config.expected_fields.join(", ") : ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        expected_fields: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="found, title, price, link"
                    style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "13px" }}
                  />
                  <span className="s" style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
                    Structured schema attributes output by the AI model.
                  </span>
                </div>
              </>
            )}

            {/* Condition Config Form */}
            {step.type === "condition" && (
              <>
                <div>
                  <label>Field Path</label>
                  <input
                    type="text"
                    required
                    value={config.field || ""}
                    onChange={(e) => setConfig({ ...config, field: e.target.value })}
                    placeholder="step_2.found"
                    style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "13px" }}
                  />
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "8px" }}>
                    <span className="s" style={{ fontSize: "11px" }}>Suggestions:</span>
                    {["step_2.found", "step_2.price", "step_2.title"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setConfig({ ...config, field: s })}
                        className="p m"
                        style={{ border: 0, cursor: "pointer", color: "#0A84FF", background: "rgba(10,132,255,.12)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Comparison Operator</label>
                  <select
                    value={config.operator || "=="}
                    onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "#F5F5F7",
                      font: "13px -apple-system, system-ui, sans-serif",
                    }}
                  >
                    <option value="==">== (Equals)</option>
                    <option value="!=">!= (Not Equals)</option>
                    <option value=">">&gt; (Greater Than)</option>
                    <option value="<">&lt; (Less Than)</option>
                    <option value=">=">&gt;= (Greater or Equal)</option>
                    <option value="<=">&lt;= (Less or Equal)</option>
                    <option value="contains">contains (Substring)</option>
                  </select>
                </div>

                <div>
                  <label>Comparison Target Value</label>
                  <input
                    type="text"
                    required
                    value={String(config.value ?? "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.toLowerCase() === "true") setConfig({ ...config, value: true });
                      else if (val.toLowerCase() === "false") setConfig({ ...config, value: false });
                      else if (!isNaN(Number(val)) && val.trim() !== "") setConfig({ ...config, value: Number(val) });
                      else setConfig({ ...config, value: val });
                    }}
                    placeholder="true"
                    style={{ width: "100%", fontSize: "13px" }}
                  />
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                    <span className="s" style={{ fontSize: "11px" }}>Quick values:</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, value: true })}
                      className="p on"
                      style={{ border: 0, cursor: "pointer" }}
                    >
                      true
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, value: false })}
                      className="p"
                      style={{ border: 0, cursor: "pointer", color: "#FF453A", background: "rgba(255,69,58,.16)" }}
                    >
                      false
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Notify Config Form */}
            {step.type === "notify" && (
              <>
                <div>
                  <label>Channel Destination</label>
                  <select
                    value={config.channel || "telegram"}
                    onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      color: "#F5F5F7",
                      font: "13px -apple-system, system-ui, sans-serif",
                    }}
                  >
                    <option value="discord">Discord (Channel Webhook)</option>
                    <option value="telegram">Telegram (Bot Direct Message)</option>
                    <option value="email">Email (Direct to your inbox)</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label style={{ margin: 0 }}>Message Template</label>
                    <span className="s" style={{ fontSize: "11px" }}>Insert variable</span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {["step_2.title", "step_2.price", "step_2.link", "step_1.url"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="p m"
                        style={{ border: 0, cursor: "pointer", color: "#0A84FF", background: "rgba(10,132,255,.12)" }}
                      >
                        + {`{{${v}}}`}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={config.message || ""}
                    onChange={(e) => setConfig({ ...config, message: e.target.value })}
                    placeholder="Alert: {{step_2.title}} is updated!"
                    style={{ width: "100%", fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12.5px", lineHeight: 1.6 }}
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="ol"
            style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="step-edit-form"
            className="bl"
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Check style={{ width: "14px", height: "14px" }} />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
