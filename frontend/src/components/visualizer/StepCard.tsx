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
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import type { StepDefinition, StepExecutionStatus, StepResult } from "../../types/pipeline";

interface StepCardProps {
  step: StepDefinition;
  result?: StepResult;
  onClickEdit: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, result, onClickEdit }) => {
  const isMissingConfig = (() => {
    if (step.type === "scrape") return !step.config.url;
    if (step.type === "ai_filter") return !step.config.instruction;
    if (step.type === "condition") return !step.config.field;
    if (step.type === "notify") return !step.config.message;
    return false;
  })();

  const status: StepExecutionStatus = result?.status || "PENDING";

  const isAccessBlocked =
    result?.error_message?.includes("403") ||
    result?.error_message?.toLowerCase().includes("forbidden") ||
    result?.error_message?.toLowerCase().includes("status code 403");

  const getStatusBadge = () => {
    if (isMissingConfig) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#FF9F0A] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 px-2 py-0.5 rounded-full">
          <AlertTriangle className="h-3 w-3" /> Missing Details
        </span>
      );
    }

    switch (status) {
      case "RUNNING":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#FF9F0A] bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 px-2 py-0.5 rounded-full animate-pulse">
            <Clock className="h-3 w-3 animate-spin" /> Running
          </span>
        );
      case "SUCCESS":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[#34C759]/15 border border-[#34C759]/30 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Success
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#FF453A] bg-[#FF453A]/15 border border-[#FF453A]/30 px-2 py-0.5 rounded-full">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      case "SKIPPED":
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-white/50 bg-white/[0.08] border border-white/[0.08] px-2 py-0.5 rounded-full">
            Skipped
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-white/50 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.06]">
            Ready
          </span>
        );
    }
  };

  const getStepIcon = () => {
    switch (step.type) {
      case "scrape":
        return <Globe className="h-4 w-4 text-[#007AFF]" />;
      case "ai_filter":
        return <BrainCircuit className="h-4 w-4 text-[#5856D6]" />;
      case "condition":
        return <GitBranch className="h-4 w-4 text-[#FF9F0A]" />;
      case "notify":
        return <Bell className="h-4 w-4 text-[#34C759]" />;
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
      className={`group relative p-4 rounded-[18px] border transition-all cursor-pointer bg-[#141416] text-left ${
        status === "RUNNING"
          ? "border-[#FF9F0A]/50 shadow-md shadow-[#FF9F0A]/10"
          : status === "SUCCESS"
          ? "border-white/[0.08] hover:border-[#34C759]/40"
          : status === "FAILED"
          ? "border-[#FF453A]/40"
          : isMissingConfig
          ? "border-[#FF9F0A]/40"
          : "border-white/[0.08] hover:border-white/[0.16]"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-black/40 flex items-center justify-center border border-white/[0.08]">
            {getStepIcon()}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Step {step.step_id}
            </div>
            <div className="text-xs font-semibold text-white group-hover:text-white/90">
              {getStepTitle()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
        </div>
      </div>

      {/* Config Summary Content */}
      <div className="text-xs text-white/80 bg-[#1C1C1E] p-2.5 rounded-xl border border-white/[0.06] font-mono">
        {step.type === "scrape" && (
          <div className="truncate">
            <span className="text-white/40 font-sans">URL: </span>
            {step.config.url ? (
              <span className="text-[#007AFF]">{step.config.url}</span>
            ) : (
              <span className="text-[#FF9F0A] font-sans italic">⚠️ No target URL configured</span>
            )}
          </div>
        )}

        {step.type === "ai_filter" && (
          <div>
            <div className="line-clamp-2 text-white/90 font-sans">
              <span className="text-white/40">Prompt: </span>
              {step.config.instruction}
            </div>
            {step.config.expected_fields && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {step.config.expected_fields.map((f: string) => (
                  <span
                    key={f}
                    className="text-[10px] bg-black/40 text-[#5856D6] px-1.5 py-0.5 rounded border border-white/[0.06]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step.type === "condition" && (
          <div className="flex items-center gap-1.5">
            {step.config.field ? (
              <>
                <span className="text-[#FF9F0A]">{step.config.field}</span>
                <span className="text-white/40 px-1 py-0.2 bg-black/40 rounded border border-white/[0.06]">
                  {step.config.operator || "=="}
                </span>
                <span className="text-white font-semibold">
                  {String(step.config.value ?? "")}
                </span>
              </>
            ) : (
              <span className="text-[#FF9F0A] font-sans italic">
                ⚠️ No condition rule defined
              </span>
            )}
          </div>
        )}

        {step.type === "notify" && (
          <div>
            <div className="text-[10px] text-white/40 uppercase mb-0.5 font-sans">
              Channel:{" "}
              <span className="text-[#34C759] font-medium uppercase">
                {step.config.channel}
              </span>
            </div>
            <div className="text-white/90 line-clamp-2 font-sans">{step.config.message}</div>
          </div>
        )}
      </div>

      {/* Execution Output Preview */}
      {result?.output_data && (
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-white/60">
          <span className="font-medium text-white/70">Output: </span>
          <span>
            {JSON.stringify(result.output_data).substring(0, 110)}
            {JSON.stringify(result.output_data).length > 110 ? "..." : ""}
          </span>
          <span className="ml-2 text-white/40 text-[10px]">({result.duration_ms}ms)</span>
        </div>
      )}

      {/* Polite Error Banner: Special Handling for 403 Forbidden */}
      {result?.error_message && (
        <div className="mt-2.5 p-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-xs text-[#FF453A] leading-relaxed">
          {isAccessBlocked ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <ShieldAlert className="h-4 w-4 text-[#FF9F0A]" />
                <span>Website Access Restricted</span>
              </div>
              <p className="text-white/80">
                The scraper cannot access this website due to anti-bot restrictions. Try an alternate source like Wikipedia's "On this day" or a public RSS/JSON feed.
              </p>
              <div className="text-[10px] text-white/40 font-mono mt-1">
                Technical response: {result.error_message}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#FF453A] shrink-0 mt-0.5" />
              <span>{result.error_message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
