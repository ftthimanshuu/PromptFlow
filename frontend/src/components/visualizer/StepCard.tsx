import React from "react";
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

  const isFailed = result?.status === "FAILED" || isAccessBlocked;
  const isSuccess = result?.status === "SUCCESS";

  const glowStyle: React.CSSProperties = isFailed
    ? {
        borderColor: "rgba(255, 69, 58, 0.75)",
        boxShadow: "0 0 28px rgba(255, 69, 58, 0.35), inset 0 1px 0 rgba(255, 69, 58, 0.45)",
        background: "rgba(255, 69, 58, 0.06)",
        transition: "all 0.35s ease",
      }
    : isSuccess
    ? {
        borderColor: "rgba(48, 209, 88, 0.75)",
        boxShadow: "0 0 28px rgba(48, 209, 88, 0.35), inset 0 1px 0 rgba(48, 209, 88, 0.45)",
        background: "rgba(48, 209, 88, 0.06)",
        transition: "all 0.35s ease",
      }
    : {
        borderColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.35)",
        transition: "all 0.35s ease",
      };

  return (
    <div
      onClick={onClickEdit}
      className="c"
      style={{
        padding: "18px 20px",
        cursor: "pointer",
        textAlign: "left",
        ...glowStyle,
      }}
    >
      {/* STEP 1: SCRAPER / SOURCE */}
      {step.type === "scrape" && (
        <>
          <div className="h">
            <h3 className="k">1 · Scraper / Source</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isFailed ? (
                <span className="p" style={{ background: "rgba(255,69,58,.16)", color: "#FF453A" }}>
                  ✕ Failed
                </span>
              ) : isSuccess ? (
                <span className="p on">✓ Success</span>
              ) : null}
              <span className="p m">GET</span>
            </div>
          </div>
          <div className="in m" style={{ wordBreak: "break-all" }}>
            {step.config.url || "https://www.timeanddate.com/on-this-day/"}
          </div>
          <p className="m t" style={{ marginTop: "8px" }}>
            Engine: Cheerio · user-agent rotation on
          </p>
          {isAccessBlocked && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(255,69,58,.14)",
                border: "1px solid rgba(255,69,58,.3)",
                color: "#FF453A",
              }}
            >
              <b>Website Access Restricted (403)</b>
              <br />
              <span style={{ color: "#F5F5F7" }}>
                This target website blocked automated access. Try an alternate source (e.g. Wikipedia's 'On this day') or verify if an RSS feed exists.
              </span>
            </div>
          )}
        </>
      )}

      {/* STEP 2: SEMANTIC AI EXTRACTION */}
      {step.type === "ai_filter" && (
        <>
          <div className="h">
            <h3 className="k">2 · Semantic AI Extraction</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isFailed ? (
                <span className="p" style={{ background: "rgba(255,69,58,.16)", color: "#FF453A" }}>
                  ✕ Failed
                </span>
              ) : isSuccess ? (
                <span className="p on">✓ Success</span>
              ) : null}
              <span className="p">Gemini</span>
            </div>
          </div>
          <div className="in s">
            {step.config.instruction || "Extract today's notable historical events as a short list of headlines."}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            {(step.config.expected_fields && step.config.expected_fields.length > 0
              ? step.config.expected_fields
              : ["headlines", "date", "found"]
            ).map((field: string) => (
              <span key={field} className="p m">
                {field}
              </span>
            ))}
          </div>
        </>
      )}

      {/* STEP 3: RULE CONDITION */}
      {step.type === "condition" && (
        <>
          <div className="h">
            <h3 className="k">3 · Rule Condition</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isFailed ? (
                <span className="p" style={{ background: "rgba(255,69,58,.16)", color: "#FF453A" }}>
                  ✕ Failed
                </span>
              ) : isSuccess ? (
                <span className="p on">✓ Passed</span>
              ) : (
                <span className="p on">Valid</span>
              )}
            </div>
          </div>
          <div className="in m">
            {step.config.field || "step_2.found"} {step.config.operator || "=="} {String(step.config.value ?? true)}
          </div>
          <p className="s" style={{ marginTop: "8px" }}>
            Continue only if at least one headline was found.
          </p>
        </>
      )}

      {/* STEP 4: ALERT DISPATCH */}
      {step.type === "notify" && (
        <>
          <div className="h">
            <h3 className="k">4 · Alert Dispatch</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isFailed ? (
                <span className="p" style={{ background: "rgba(255,69,58,.16)", color: "#FF453A" }}>
                  ✕ Failed
                </span>
              ) : isSuccess ? (
                <span className="p on">✓ Sent</span>
              ) : null}
              <span style={{ display: "flex", gap: "6px" }}>
                <span className={`p ${step.config.channel === "discord" || !step.config.channel ? "on" : ""}`}>
                  Discord
                </span>
                <span className={`p ${step.config.channel === "telegram" ? "on" : ""}`}>
                  Telegram
                </span>
                <span className={`p ${step.config.channel === "email" ? "on" : ""}`}>
                  Email
                </span>
              </span>
            </div>
          </div>
          <div className="in m s" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {step.config.message ||
              "On this day, Nov 1:\n• 1512: Michelangelo's Sistine Chapel ceiling is first shown\n• 1993: The Maastricht Treaty takes effect"}
          </div>
        </>
      )}
    </div>
  );
};
