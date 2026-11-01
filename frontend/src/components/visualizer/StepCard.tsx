import React from "react";
import { Globe, Cpu, GitFork, Bell, AlertTriangle, ExternalLink } from "lucide-react";
import type { StepDefinition, StepResult } from "../../types/pipeline";

interface StepCardProps {
  step: StepDefinition;
  result?: StepResult;
  onClickEdit: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, result, onClickEdit }) => {
  const isAccessBlocked =
    result?.error_message?.includes("403") ||
    result?.error_message?.toLowerCase().includes("forbidden") ||
    result?.error_message?.toLowerCase().includes("status code 403") ||
    (step.type === "scrape" && step.config.url?.includes("timeanddate.com"));

  return (
    <div
      onClick={onClickEdit}
      className={`c p-5 text-left cursor-pointer hover:border-white/20 transition-all duration-200 group ${
        isAccessBlocked
          ? "border-[#FF9F0A]/40 bg-[#FF9F0A]/[0.02]"
          : result?.status === "SUCCESS"
          ? "border-[#30D158]/40 bg-[#30D158]/[0.02]"
          : "border-white/10"
      }`}
    >
      {/* STEP 1: SCRAPER / SOURCE */}
      {step.type === "scrape" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#0A84FF]">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-white">1 · Scraper / Source</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="p m text-[11px] bg-white/[0.06] text-white">GET</span>
              <span className="text-xs text-[#8E8E93] group-hover:text-white transition-colors flex items-center gap-1">
                Edit <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="in m text-xs text-white/90 break-all bg-white/[0.03] py-2.5 px-3.5 border-white/[0.06]">
            {step.config.url || "https://en.wikipedia.org/wiki/Portal:Current_events"}
          </div>

          <p className="m text-[11px] text-[#8E8E93] mt-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
            Engine: Cheerio · user-agent rotation on
          </p>

          {isAccessBlocked && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-xs text-[#FF9F0A] leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF9F0A]" />
              <div>
                <b className="font-semibold text-white">Website Access Restricted (403)</b>
                <p className="text-white/80 mt-0.5">
                  Target site blocked automated requests. Try an alternate source (e.g. Wikipedia's 'On this day') or check if an RSS feed exists.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SEMANTIC AI EXTRACTION */}
      {step.type === "ai_filter" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#BF5AF2]">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-white">2 · Semantic AI Extraction</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="p text-[11px] bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]/20">
                Gemini AI
              </span>
              <span className="text-xs text-[#8E8E93] group-hover:text-white transition-colors flex items-center gap-1">
                Edit <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="in text-xs text-[#A1A1A6] leading-relaxed bg-white/[0.03] py-2.5 px-3.5 border-white/[0.06]">
            {step.config.instruction || "Extract today's notable historical events as a short list of headlines."}
          </div>

          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <span className="text-[11px] text-[#8E8E93]">Extracted keys:</span>
            {(step.config.expected_fields && step.config.expected_fields.length > 0
              ? step.config.expected_fields
              : ["headlines", "date", "found"]
            ).map((field: string) => (
              <span key={field} className="p m text-[11px] bg-white/[0.05] text-white/90">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: RULE CONDITION */}
      {step.type === "condition" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#30D158]">
                <GitFork className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-white">3 · Rule Condition</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="p on text-[11px]">Valid</span>
              <span className="text-xs text-[#8E8E93] group-hover:text-white transition-colors flex items-center gap-1">
                Edit <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="in m text-xs text-white bg-white/[0.03] py-2.5 px-3.5 border-white/[0.06]">
            {step.config.field || "step_2.found"} {step.config.operator || "=="} {String(step.config.value ?? true)}
          </div>

          <p className="text-xs text-[#A1A1A6] mt-2.5">
            Continue pipeline execution only if at least one headline was found.
          </p>
        </div>
      )}

      {/* STEP 4: ALERT DISPATCH */}
      {step.type === "notify" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[#5E5CE6]">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-white">4 · Alert Dispatch</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className={`p text-[11px] ${step.config.channel === "discord" || !step.config.channel ? "on" : ""}`}>
                  Discord
                </span>
                <span className={`p text-[11px] ${step.config.channel === "telegram" ? "on" : ""}`}>
                  Telegram
                </span>
                <span className={`p text-[11px] ${step.config.channel === "email" ? "on" : ""}`}>
                  Email
                </span>
              </div>
              <span className="text-xs text-[#8E8E93] group-hover:text-white transition-colors flex items-center gap-1">
                Edit <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="in m text-xs text-[#A1A1A6] leading-relaxed bg-white/[0.03] py-2.5 px-3.5 border-white/[0.06] whitespace-pre-wrap">
            {step.config.message || "On this day, {{date}}:\n• 1512: Michelangelo's Sistine Chapel ceiling is first shown\n• 1993: The Maastricht Treaty takes effect"}
          </div>
        </div>
      )}
    </div>
  );
};
