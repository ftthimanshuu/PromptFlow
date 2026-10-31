import React, { useState } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Step {step.step_id} Parameters
              </span>
              <h3 className="text-base font-bold text-white capitalize">
                Configure {step.type.replace("_", " ")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form id="step-edit-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Scrape Config Form */}
            {step.type === "scrape" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={config.url || ""}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="https://example.com/notices"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Scraped Characters
                  </label>
                  <input
                    type="number"
                    value={config.max_length || 10000}
                    onChange={(e) =>
                      setConfig({ ...config, max_length: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </>
            )}

            {/* AI Filter Config Form */}
            {step.type === "ai_filter" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Extraction Prompt
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={config.instruction || ""}
                    onChange={(e) => setConfig({ ...config, instruction: e.target.value })}
                    placeholder="e.g. Scan notices for exam schedules. Return found, title, and link."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    placeholder="found, title, link"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </>
            )}

            {/* Condition Config Form */}
            {step.type === "condition" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Field Path
                  </label>
                  <input
                    type="text"
                    required
                    value={config.field || ""}
                    onChange={(e) => setConfig({ ...config, field: e.target.value })}
                    placeholder="step_2.found"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Operator
                  </label>
                  <select
                    value={config.operator || "=="}
                    onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="==">== (Equals)</option>
                    <option value="!=">!= (Not Equals)</option>
                    <option value=">">&gt; (Greater Than)</option>
                    <option value="<">&lt; (Less Than)</option>
                    <option value=">=">&gt;= (Greater / Equal)</option>
                    <option value="<=">&lt;= (Less / Equal)</option>
                    <option value="contains">contains (Substring)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </>
            )}

            {/* Notify Config Form */}
            {step.type === "notify" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Channel
                  </label>
                  <select
                    value={config.channel || "telegram"}
                    onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="discord">Discord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Message Template (Variables: {"{{step_2.field}}"})
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={config.message || ""}
                    onChange={(e) => setConfig({ ...config, message: e.target.value })}
                    placeholder="🚨 Alert: {{step_2.title}} found!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="step-edit-form"
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20"
          >
            <Check className="h-4 w-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
