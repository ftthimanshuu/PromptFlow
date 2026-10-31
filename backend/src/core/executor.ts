import {
  ExecutionContext,
  PipelineExecutionReport,
  PipelineSpecification,
  StepResult,
} from "../types/dsl.js";
import { evaluateCondition } from "./evaluator.js";
import { extractWithAI } from "./extractor.js";
import { dispatchNotification, UserNotificationDestinations } from "./notifier.js";
import { scrapeWebsite } from "./scraper.js";
import { interpolateTemplate } from "./template.js";
import { getSupabaseAdmin } from "../db/supabase.js";

export interface ExecutionOptions {
  automation_id?: string;
  userDestinations?: UserNotificationDestinations;
  isTestRun?: boolean;
}

/**
 * Orchestrates linear execution of a pipeline DSL.
 * Coordinates: Scrape -> AI Filter -> Condition -> Notify.
 */
export async function executePipeline(
  pipeline: PipelineSpecification,
  options: ExecutionOptions = {}
): Promise<PipelineExecutionReport> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();
  const stepResults: StepResult[] = [];
  const executionContext: ExecutionContext = {};

  let finalStatus: "SUCCESS" | "FAILED" | "SKIPPED" = "SUCCESS";
  let overallError: string | undefined = undefined;

  for (const step of pipeline.steps) {
    const stepStartTime = Date.now();
    const stepKey = `step_${step.step_id}`;

    try {
      if (step.type === "scrape") {
        const scrapeOutput = await scrapeWebsite(step.config as any);
        executionContext[stepKey] = scrapeOutput as unknown as Record<string, unknown>;

        stepResults.push({
          step_id: step.step_id,
          type: "scrape",
          status: "SUCCESS",
          output_data: {
            url: scrapeOutput.url,
            title: scrapeOutput.title,
            char_count: scrapeOutput.char_count,
            preview: scrapeOutput.text.substring(0, 300) + "...",
          },
          duration_ms: Date.now() - stepStartTime,
        });
      } else if (step.type === "ai_filter") {
        // Find preceding scraped text
        let scrapedText = "";
        for (const [k, v] of Object.entries(executionContext)) {
          if (v && typeof v.text === "string") {
            scrapedText = v.text;
            break;
          }
        }

        if (!scrapedText) {
          throw new Error("Cannot execute ai_filter: No preceding scraped text available in execution context.");
        }

        const extracted = await extractWithAI(step.config as any, scrapedText);
        executionContext[stepKey] = extracted;

        stepResults.push({
          step_id: step.step_id,
          type: "ai_filter",
          status: "SUCCESS",
          output_data: extracted,
          duration_ms: Date.now() - stepStartTime,
        });
      } else if (step.type === "condition") {
        const evalResult = evaluateCondition(step.config as any, executionContext);
        executionContext[stepKey] = evalResult as unknown as Record<string, unknown>;

        if (!evalResult.passed) {
          // Condition failed: Pipeline short-circuits gracefully with SKIPPED status
          stepResults.push({
            step_id: step.step_id,
            type: "condition",
            status: "SKIPPED",
            output_data: {
              ...evalResult,
              note: "Condition evaluated to false. Pipeline execution halted.",
            },
            duration_ms: Date.now() - stepStartTime,
          });

          finalStatus = "SKIPPED";
          break; // Stop remaining steps (no alert dispatched)
        }

        stepResults.push({
          step_id: step.step_id,
          type: "condition",
          status: "SUCCESS",
          output_data: evalResult as unknown as Record<string, unknown>,
          duration_ms: Date.now() - stepStartTime,
        });
      } else if (step.type === "notify") {
        const resolvedMessage = interpolateTemplate(step.config.message, executionContext);
        const destinations = options.userDestinations || {};

        const notifyResult = await dispatchNotification(
          step.config as any,
          resolvedMessage,
          destinations
        );

        executionContext[stepKey] = notifyResult as unknown as Record<string, unknown>;

        if (!notifyResult.sent && !options.isTestRun) {
          throw new Error(notifyResult.error || "Notification dispatch failed.");
        }

        stepResults.push({
          step_id: step.step_id,
          type: "notify",
          status: notifyResult.sent ? "SUCCESS" : "FAILED",
          output_data: notifyResult as unknown as Record<string, unknown>,
          error_message: notifyResult.error,
          duration_ms: Date.now() - stepStartTime,
        });
      }
    } catch (err: any) {
      stepResults.push({
        step_id: step.step_id,
        type: step.type,
        status: "FAILED",
        error_message: err.message,
        duration_ms: Date.now() - stepStartTime,
      });

      finalStatus = "FAILED";
      overallError = `Step ${step.step_id} (${step.type}) failed: ${err.message}`;
      break; // Abort on failure
    }
  }

  const completedAt = new Date().toISOString();
  const totalDurationMs = Date.now() - startTime;

  const report: PipelineExecutionReport = {
    automation_id: options.automation_id,
    status: finalStatus,
    step_results: stepResults,
    started_at: startedAt,
    completed_at: completedAt,
    total_duration_ms: totalDurationMs,
    error_message: overallError,
  };

  // If this was an automated run with an automation_id, log to Supabase
  if (options.automation_id && !options.isTestRun) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("execution_logs").insert({
        automation_id: options.automation_id,
        status: report.status,
        step_results: report.step_results,
        error_message: report.error_message || null,
        started_at: report.started_at,
        completed_at: report.completed_at,
      });

      await supabase
        .from("automations")
        .update({ last_run_at: report.completed_at })
        .eq("id", options.automation_id);
    } catch (dbErr: any) {
      console.error("[DB LOG ERROR] Failed to record execution log in Supabase:", dbErr.message);
    }
  }

  return report;
}
