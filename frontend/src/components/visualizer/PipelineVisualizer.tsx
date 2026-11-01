import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
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

  // If no pipeline has been compiled yet, render an elegant empty-canvas card
  if (!pipeline) {
    return (
      <section
        className="c"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "calc(100vh - 160px)",
          minHeight: "560px",
          maxHeight: "780px",
          padding: "48px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "rgba(10,132,255,.12)",
            border: "1px solid rgba(10,132,255,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <Sparkles style={{ width: "26px", height: "26px", color: "#0A84FF" }} />
        </div>
        <h3 className="k" style={{ fontSize: "20px", marginBottom: "8px", color: "#F5F5F7" }}>
          Pipeline Canvas
        </h3>
        <p className="s" style={{ maxWidth: "380px", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px" }}>
          Your automation flow will be compiled and displayed here in real time as you chat on the left.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <span className="p m">1. Scrape</span>
          <span className="p m">2. AI Extract</span>
          <span className="p m">3. Evaluate</span>
          <span className="p m">4. Alert</span>
        </div>
      </section>
    );
  }

  const currentPipeline = pipeline;

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
    <section style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
      {/* Header Bar */}
      <div className="g" style={{ borderRadius: "20px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h2 className="k">{currentPipeline.title}</h2>
        <span className="p m">◷ {currentPipeline.schedule_cron}</span>

        {testReport?.status === "SUCCESS" && (
          <span className="p on">✓ Passed ({testReport.total_duration_ms}ms)</span>
        )}
        {testReport?.status === "FAILED" && (
          <span className="p" style={{ background: "rgba(255,69,58,.16)", color: "#FF453A" }}>
            ✕ Failed
          </span>
        )}
        {testReport?.status === "SKIPPED" && (
          <span className="p" style={{ background: "rgba(255,159,10,.16)", color: "#FF9F0A" }}>
            Condition false ({testReport.total_duration_ms}ms)
          </span>
        )}

        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="ol"
          disabled={isExecuting}
          onClick={onTestRun}
          style={{ minHeight: "38px", padding: "0 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}
        >
          {isExecuting ? <Loader2 style={{ width: "13px", height: "13px", display: "inline-block", marginRight: "6px" }} className="animate-spin" /> : null}
          Test Run
        </button>
        <button
          type="button"
          className="bl"
          disabled={isSaving || isExecuting}
          onClick={onSaveAutomation}
          style={{ minHeight: "38px", padding: "0 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}
        >
          {isSaving ? "Saving..." : "Save & Activate"}
        </button>
      </div>

      {/* Step Cards 1, 2, 3, 4 */}
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

      {/* Parameter Inspector Drawer */}
      <StepDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        step={selectedStep}
        onSave={handleSaveStep}
      />
    </section>
  );
};
