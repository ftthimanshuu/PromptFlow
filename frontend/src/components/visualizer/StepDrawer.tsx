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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-200 font-sans selection:bg-[#007AFF]/30 selection:text-white">
      <div className="w-full max-w-md bg-[#141416] border-l border-white/[0.12] h-full p-6 sm:p-7 shadow-2xl overflow-y-auto flex flex-col justify-between text-[#F5F5F7]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6 text-left">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#007AFF]">
                Step {step.step_id} Parameter Inspector
              </span>
              <h3 className="text-base font-bold text-white capitalize mt-0.5">
                Configure {step.type.replace("_", " ")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form id="step-edit-form" onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Scrape Config Form */}
            {step.type === "scrape" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Target Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={config.url || ""}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="https://example.com/notices"
                    className="w-full apple-input px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    Public URL to fetch and evaluate.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Max Scraped Characters
                  </label>
                  <input
                    type="number"
                    value={config.max_length || 10000}
                    onChange={(e) =>
                      setConfig({ ...config, max_length: parseInt(e.target.value, 10) })
                    }
                    className="w-full apple-input px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    Default 10,000 characters to prevent token overflow.
                  </span>
                </div>
              </>
            )}

            {/* AI Filter Config Form */}
            {step.type === "ai_filter" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Extraction Prompt
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={config.instruction || ""}
                    onChange={(e) => setConfig({ ...config, instruction: e.target.value })}
                    placeholder="e.g. Scan notices for exam schedules. Return found, title, and link."
                    className="w-full apple-input px-3 py-2 text-xs leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Expected JSON Keys (comma separated)
                  </label>
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
                    className="w-full apple-input px-3 py-2 text-xs font-mono"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    Structured keys extracted by Groq / Gemini models.
                  </span>
                </div>
              </>
            )}

            {/* Condition Config Form */}
            {step.type === "condition" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Field Path
                  </label>
                  <input
                    type="text"
                    required
                    value={config.field || ""}
                    onChange={(e) => setConfig({ ...config, field: e.target.value })}
                    placeholder="step_2.found"
                    className="w-full apple-input px-3 py-2 text-xs font-mono"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-white/40">Suggestions:</span>
                    {["step_2.found", "step_2.price", "step_2.title"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setConfig({ ...config, field: s })}
                        className="text-[10px] bg-[#1C1C1E] hover:bg-white/[0.1] text-[#007AFF] px-2 py-0.5 rounded-full border border-white/[0.06]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Comparison Operator
                  </label>
                  <select
                    value={config.operator || "=="}
                    onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                    className="w-full apple-input px-3 py-2 text-xs"
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
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Comparison Target Value
                  </label>
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
                    className="w-full apple-input px-3 py-2 text-xs"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-white/40">Quick sets:</span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, value: true })}
                      className="text-[10px] bg-[#1C1C1E] text-[#34C759] px-2 py-0.5 rounded-full border border-white/[0.06]"
                    >
                      true
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, value: false })}
                      className="text-[10px] bg-[#1C1C1E] text-[#FF453A] px-2 py-0.5 rounded-full border border-white/[0.06]"
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
                  <label className="block text-xs font-medium text-white/70 mb-1">
                    Channel Destination
                  </label>
                  <select
                    value={config.channel || "telegram"}
                    onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                    className="w-full apple-input px-3 py-2 text-xs"
                  >
                    <option value="discord">Discord (Channel Webhook)</option>
                    <option value="telegram">Telegram (Bot Direct Message)</option>
                    <option value="email">Email (Direct to your inbox)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-white/70">
                      Message Template
                    </label>
                    <span className="text-[10px] text-white/40">Insert variable</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {["step_2.title", "step_2.price", "step_2.link", "step_1.url"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="text-[10px] bg-[#1C1C1E] hover:bg-white/[0.1] text-[#007AFF] px-2 py-0.5 rounded-full border border-white/[0.06]"
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
                    className="w-full apple-input px-3 py-2 text-xs leading-relaxed font-mono"
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="apple-btn-secondary px-3.5 py-1.5 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="step-edit-form"
            className="apple-btn-primary px-4 py-1.5 text-xs font-medium gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
