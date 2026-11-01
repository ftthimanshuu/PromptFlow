import React from "react";
import {
  Globe,
  BrainCircuit,
  GitBranch,
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
} from "lucide-react";
import type { StepDefinition, StepExecutionStatus, StepResult } from "../../types/pipeline";

interface StepCardProps {
  step: StepDefinition;
  result?: StepResult;
  onClickEdit: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, result, onClickEdit }) => {
  // Determine if essential configuration is missing
  const isMissingConfig = (() => {
    if (step.type === "scrape") return !step.config.url;
    if (step.type === "ai_filter") return !step.config.instruction;
    if (step.type === "condition") return !step.config.field;
    if (step.type === "notify") return !step.config.message;
    return false;
  })();

  const status: StepExecutionStatus = result?.status || "PENDING";

  // Visual status styling
  const getStatusBadge = () => {
    if (isMissingConfig) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <AlertTriangle className="h-3 w-3" /> Missing Details
        </span>
      );
    }

    switch (status) {
      case "RUNNING":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-yellow-300 bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full animate-pulse">
            <Clock className="h-3 w-3 animate-spin" /> Running
          </span>
        );
      case "SUCCESS":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Success
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      case "SKIPPED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            Skipped
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
            Ready
          </span>
        );
    }
  };

  const getStepIcon = () => {
    switch (step.type) {
      case "scrape":
        return <Globe className="h-4 w-4 text-sky-400" />;
      case "ai_filter":
        return <BrainCircuit className="h-4 w-4 text-purple-400" />;
      case "condition":
        return <GitBranch className="h-4 w-4 text-amber-400" />;
      case "notify":
        return <Bell className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getStepTitle = () => {
    switch (step.type) {
      case "scrape":
        return "Fetch Target Website";
      case "ai_filter":
        return "Semantic AI Extraction";
      case "condition":
        return "Deterministic Condition";
      case "notify":
        return "Dispatch Push Alert";
    }
  };

  return (
    <div
      onClick={onClickEdit}
      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
        status === "RUNNING"
          ? "bg-slate-900/90 border-yellow-500/50 shadow-lg shadow-yellow-500/10 animate-pulse-fast"
          : status === "SUCCESS"
          ? "bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60"
          : status === "FAILED"
          ? "bg-slate-900/70 border-rose-500/30 hover:border-rose-500/60"
          : isMissingConfig
          ? "bg-slate-900/70 border-amber-500/40 hover:border-amber-500/70"
          : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
            {getStepIcon()}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Step {step.step_id}
            </div>
            <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
              {getStepTitle()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Edit3 className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Config Summary Content */}
      <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono">
        {step.type === "scrape" && (
          <div className="truncate">
            <span className="text-slate-500">URL: </span>
            {step.config.url ? (
              <span className="text-sky-300">{step.config.url}</span>
            ) : (
              <span className="text-amber-400 font-sans italic">⚠️ No URL configured (click to set)</span>
            )}
          </div>
        )}

        {step.type === "ai_filter" && (
          <div>
            <div className="line-clamp-2 text-slate-300">
              <span className="text-slate-500">Prompt: </span>
              {step.config.instruction}
            </div>
            {step.config.expected_fields && (
              <div className="mt-1 flex flex-wrap gap-1">
                {step.config.expected_fields.map((f: string) => (
                  <span key={f} className="text-[10px] bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step.type === "condition" && (
          <div>
            {step.config.field ? (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-semibold">{step.config.field}</span>
                <span className="text-slate-400 px-1 py-0.5 bg-slate-900 rounded border border-slate-800">
                  {step.config.operator || "=="}
                </span>
                <span className="text-sky-300 font-bold">{String(step.config.value ?? "")}</span>
              </div>
            ) : (
              <span className="text-amber-400 font-sans italic">
                ⚠️ No condition defined (click to configure)
              </span>
            )}
          </div>
        )}

        {step.type === "notify" && (
          <div>
            <div className="text-[10px] text-slate-500 uppercase mb-0.5 font-sans">
              Channel: <span className="text-emerald-400 font-semibold">{step.config.channel}</span>
            </div>
            <div className="text-slate-300 line-clamp-2">{step.config.message}</div>
          </div>
        )}
      </div>

      {/* Execution Output Preview (if result exists) */}
      {result?.output_data && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Output: </span>
          <span className="text-slate-400">
            {JSON.stringify(result.output_data).substring(0, 120)}
            {JSON.stringify(result.output_data).length > 120 ? "..." : ""}
          </span>
          <span className="ml-2 text-slate-500 text-[10px]">({result.duration_ms}ms)</span>
        </div>
      )}

      {result?.error_message && (
        <div className="mt-2.5 flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/25 leading-relaxed font-sans">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{result.error_message}</span>
        </div>
      )}
    </div>
  );
};
