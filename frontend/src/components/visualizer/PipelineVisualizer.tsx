import React, { useState } from "react";
import { Loader2, Play, CheckCircle2 } from "lucide-react";
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

  // If no pipeline is compiled yet, show clean fallback placeholder
  const currentPipeline: PipelineSpecification = pipeline || {
    title: "Daily Historical Headlines",
    schedule_cron: "0 8 * * *",
    steps: [
      { step_id: 1, type: "scrape", config: { url: "https://www.timeanddate.com/on-this-day/" } },
      { step_id: 2, type: "ai_filter", config: { instruction: "Extract today's notable historical events as a short list of headlines.", expected_fields: ["headlines", "date", "found"] } },
      { step_id: 3, type: "condition", config: { field: "step_2.found", operator: "==", value: true } },
      { step_id: 4, type: "notify", config: { channel: "discord", message: "On this day, Nov 1:\n• 1512: Michelangelo's Sistine Chapel ceiling is first shown\n• 1993: The Maastricht Treaty takes effect" } },
    ],
  };

  function handleSaveStep(updatedStep: StepDefinition) {
    const newSteps = currentPipeline.steps.map((s) =>
      s.step_id === updatedStep.step_id ? updatedStep : s
    );
    onUpdatePipeline({
      ...currentPipeline,
      steps: newSteps,
    });
  }

  return (
    <section className="flex flex-col gap-4 text-left">
      {/* Header Bar */}
      <div className="g rounded-2xl p-4 sm:px-6 flex items-center justify-between gap-3 flex-wrap border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {currentPipeline.title}
          </h2>
          <span className="p m text-xs bg-white/[0.06] text-[#A1A1A6] border-white/10">
            ◷ {currentPipeline.schedule_cron}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ol rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all min-h-0"
            disabled={isExecuting}
            onClick={onTestRun}
          >
            {isExecuting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Play className="w-3 h-3 text-white fill-white" />
            )}
            <span>{isExecuting ? "Executing..." : "Test Run"}</span>
          </button>

          <button
            type="button"
            className="bl rounded-full px-5 py-1.5 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all min-h-0"
            disabled={isSaving || isExecuting}
            onClick={onSaveAutomation}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Activate"}</span>
          </button>
        </div>
      </div>

      {/* Step Cards 1, 2, 3, 4 */}
      <div className="space-y-3">
        {currentPipeline.steps.map((step) => {
          const stepResult = testReport?.step_results?.find((r) => r.step_id === step.step_id);

          return (
            <StepCard
              key={step.step_id}
              step={step}
              result={stepResult}
              onClickEdit={() => {
                setSelectedStep(step);
                setIsDrawerOpen(true);
              }}
            />
          );
        })}
      </div>

      {/* Step Config Drawer */}
      <StepDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        step={selectedStep}
        onSave={handleSaveStep}
      />
    </section>
  );
};
