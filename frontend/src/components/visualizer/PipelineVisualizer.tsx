import React, { useState } from "react";
import { Play, Save, Calendar, CheckCircle, AlertCircle, ArrowDown, Sparkles } from "lucide-react";
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          No Pipeline Compiled Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Describe any web monitoring task in the chat on the left (e.g. tracking prices, notices, or job updates) to automatically generate an executable pipeline.
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
    <div className="h-full flex flex-col justify-between bg-slate-950 p-6 overflow-y-auto">
      <div>
        {/* Pipeline Title & Cron Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                Linear Pipeline
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {pipeline.schedule_cron}
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-white">{pipeline.title}</h1>
            {pipeline.description && (
              <p className="text-xs text-slate-400 mt-0.5">{pipeline.description}</p>
            )}
          </div>

          {/* Test Status Banner if available */}
          {testReport && (
            <div className="flex flex-col items-end gap-1">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  testReport.status === "SUCCESS"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : testReport.status === "SKIPPED"
                    ? "bg-slate-800/80 border-slate-700 text-slate-300"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}
              >
                {testReport.status === "SUCCESS" && <CheckCircle className="h-4 w-4" />}
                {testReport.status === "SKIPPED" && <AlertCircle className="h-4 w-4" />}
                {testReport.status === "FAILED" && <AlertCircle className="h-4 w-4" />}
                <span>Test Status: {testReport.status}</span>
                <span className="text-[10px] text-slate-500">({testReport.total_duration_ms}ms)</span>
              </div>
              {testReport.error_message && (
                <span className="text-[11px] text-rose-300 max-w-md text-right leading-tight">
                  {testReport.error_message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Step Cards Stack */}
        <div className="space-y-3 relative max-w-2xl mx-auto">
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

                {/* Connecting arrow */}
                {idx < pipeline.steps.length - 1 && (
                  <div className="flex justify-center -my-1">
                    <div className="h-4 w-0.5 bg-slate-800 flex items-center justify-center">
                      <ArrowDown className="h-3 w-3 text-slate-600" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between sticky bottom-0 bg-slate-950/90 backdrop-blur-md">
        <div className="text-xs text-slate-500">
          Click any card above to edit its parameters directly.
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTestRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-50"
          >
            <Play className={`h-4 w-4 text-emerald-400 fill-emerald-400 ${isExecuting ? "animate-spin" : ""}`} />
            {isExecuting ? "Running Sandbox..." : "Test Run (Dry Run)"}
          </button>

          <button
            type="button"
            onClick={onSaveAutomation}
            disabled={isSaving || isExecuting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save & Activate"}
          </button>
        </div>
      </div>

      {/* Drawer */}
      <StepDrawer
        step={selectedStep}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveStep}
      />
    </div>
  );
};
