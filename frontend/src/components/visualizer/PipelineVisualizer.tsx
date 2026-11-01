import React, { useState } from "react";
import { Play, Save, Calendar, CheckCircle, AlertCircle, ArrowDown, Sparkles, Loader2 } from "lucide-react";
import type {
  PipelineExecutionReport,
  PipelineSpecification,
  StepDefinition,
} from "../../types/pipeline";
import { StepCard } from "./StepCard";
import { StepDrawer } from "./StepDrawer";

interface PipelineVisualizerProps {
  pipeline: PipelineSpecification | null;
  onUpdatePipeline: (updated: PipelineSpecification) => void;
  onTestRun: () => Promise<void>;
  onSaveAutomation: () => Promise<void>;
  testReport: PipelineExecutionReport | null;
  isExecuting: boolean;
  isSaving: boolean;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  pipeline,
  onUpdatePipeline,
  onTestRun,
  onSaveAutomation,
  testReport,
  isExecuting,
  isSaving,
}) => {
  const [selectedStep, setSelectedStep] = useState<StepDefinition | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!pipeline) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/40 bg-black">
        <div className="h-14 w-14 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center mb-4">
          <Sparkles className="h-7 w-7 text-white/30" />
        </div>
        <h3 className="text-sm font-semibold text-white/90 mb-1">
          No Pipeline Compiled Yet
        </h3>
        <p className="text-xs text-white/50 max-w-sm leading-relaxed">
          Describe any web monitoring task in the compiler on the left (e.g. tracking prices, notices, or tech updates) to generate an executable pipeline.
        </p>
      </div>
    );
  }

  function handleSaveStep(updatedStep: StepDefinition) {
    if (!pipeline) return;
    const newSteps = pipeline.steps.map((s) =>
      s.step_id === updatedStep.step_id ? updatedStep : s
    );
    onUpdatePipeline({
      ...pipeline,
      steps: newSteps,
    });
  }

  return (
    <div className="h-full flex flex-col justify-between bg-black p-6 overflow-y-auto selection:bg-[#007AFF]/30 selection:text-white">
      <div>
        {/* Pipeline Title & Cron Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/[0.08] text-left">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#007AFF] bg-[#007AFF]/15 px-2 py-0.5 rounded-full border border-[#007AFF]/30">
                Linear Pipeline
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/60 font-mono bg-[#1C1C1E] px-2 py-0.5 rounded-full border border-white/[0.06]">
                <Calendar className="h-3 w-3 text-[#007AFF]" />
                {pipeline.schedule_cron}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">{pipeline.title}</h1>
            {pipeline.description && (
              <p className="text-xs text-[#A1A1A6] mt-0.5">{pipeline.description}</p>
            )}
          </div>

          {/* Test Status Banner if available */}
          {testReport && (
            <div className="flex flex-col items-end gap-1">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  testReport.status === "SUCCESS"
                    ? "bg-[#34C759]/15 border-[#34C759]/30 text-[#34C759]"
                    : testReport.status === "SKIPPED"
                    ? "bg-[#FF9F0A]/15 border-[#FF9F0A]/30 text-[#FF9F0A]"
                    : "bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF453A]"
                }`}
              >
                {testReport.status === "SUCCESS" && <CheckCircle className="h-3.5 w-3.5" />}
                {testReport.status === "SKIPPED" && <AlertCircle className="h-3.5 w-3.5" />}
                {testReport.status === "FAILED" && <AlertCircle className="h-3.5 w-3.5" />}
                <span>Test: {testReport.status}</span>
                <span className="text-[10px] opacity-70">({testReport.total_duration_ms}ms)</span>
              </div>
            </div>
          )}
        </div>

        {/* Step Cards Stack */}
        <div className="space-y-3 relative max-w-xl mx-auto">
          {pipeline.steps.map((step, idx) => {
            const stepResult = testReport?.step_results.find(
              (r) => r.step_id === step.step_id
            );

            return (
              <React.Fragment key={step.step_id}>
                <StepCard
                  step={step}
                  result={stepResult}
                  onClickEdit={() => {
                    setSelectedStep(step);
                    setIsDrawerOpen(true);
                  }}
                />

                {/* Connecting hairline indicator */}
                {idx < pipeline.steps.length - 1 && (
                  <div className="flex justify-center -my-1">
                    <div className="h-3 w-0.5 bg-white/[0.12] flex items-center justify-center">
                      <ArrowDown className="h-2.5 w-2.5 text-white/30" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action Toolbar */}
      <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between sticky bottom-0 bg-black/90 backdrop-blur-xl">
        <div className="text-xs text-white/40 text-left">
          Click any card to inspect or adjust parameters.
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onTestRun}
            disabled={isExecuting}
            className="apple-btn-secondary px-4 py-2 text-xs font-medium gap-1.5 disabled:opacity-50"
          >
            {isExecuting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#34C759]" />
            ) : (
              <Play className="h-3 w-3 fill-[#34C759] text-[#34C759]" />
            )}
            <span>{isExecuting ? "Executing Sandbox..." : "Test Run"}</span>
          </button>

          <button
            type="button"
            onClick={onSaveAutomation}
            disabled={isSaving || isExecuting}
            className="apple-btn-primary px-5 py-2 text-xs font-medium gap-1.5 disabled:opacity-50 shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Activate"}</span>
          </button>
        </div>
      </div>

      {/* Slide-out Parameter Inspector Drawer */}
      <StepDrawer
        step={selectedStep}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveStep}
      />
    </div>
  );
};
