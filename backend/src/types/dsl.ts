import { z } from "zod";

// ============================================================================
// STEP CONFIG SCHEMAS
// ============================================================================

export const ScrapeConfigSchema = z.object({
  url: z.string().url("A valid HTTP/HTTPS URL is required"),
  max_length: z.number().int().positive().default(10000),
});
export type ScrapeConfig = z.infer<typeof ScrapeConfigSchema>;

export const AIFilterConfigSchema = z.object({
  instruction: z.string().min(1, "Instruction is required"),
  expected_fields: z.array(z.string().min(1)).min(1, "At least one expected field is required"),
});
export type AIFilterConfig = z.infer<typeof AIFilterConfigSchema>;

export const ConditionOperatorSchema = z.enum([
  "==",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "contains",
]);
export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

export const ConditionConfigSchema = z.object({
  field: z.string().min(1, "Target field path is required (e.g. step_2.found)"),
  operator: ConditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type ConditionConfig = z.infer<typeof ConditionConfigSchema>;

export const NotifyChannelSchema = z.enum(["telegram", "discord", "email"]);
export type NotifyChannel = z.infer<typeof NotifyChannelSchema>;

export const NotifyConfigSchema = z.object({
  channel: NotifyChannelSchema.default("telegram"),
  message: z.string().min(1, "Alert message template is required"),
});
export type NotifyConfig = z.infer<typeof NotifyConfigSchema>;

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

export const StepTypeSchema = z.enum(["scrape", "ai_filter", "condition", "notify"]);
export type StepType = z.infer<typeof StepTypeSchema>;

export const StepDefinitionSchema = z.object({
  step_id: z.number().int().positive(),
  type: StepTypeSchema,
  config: z.record(z.any()), // Dynamic per step type, validated at runtime
});
export type StepDefinition = z.infer<typeof StepDefinitionSchema>;

// ============================================================================
// PIPELINE SPECIFICATION
// ============================================================================

export const PipelineSpecificationSchema = z.object({
  title: z.string().min(1, "Pipeline title is required"),
  description: z.string().optional(),
  schedule_cron: z.string().default("0 9 * * *"),
  steps: z.array(StepDefinitionSchema).min(1, "At least one step is required"),
});
export type PipelineSpecification = z.infer<typeof PipelineSpecificationSchema>;

// ============================================================================
// EXECUTION & RUNTIME TELEMETRY TYPES
// ============================================================================

export type StepStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";

export interface StepResult {
  step_id: number;
  type: StepType;
  status: StepStatus;
  output_data?: Record<string, unknown>;
  error_message?: string;
  duration_ms: number;
}

export interface PipelineExecutionReport {
  automation_id?: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  step_results: StepResult[];
  started_at: string;
  completed_at: string;
  total_duration_ms: number;
  error_message?: string;
}

export type ExecutionContext = Record<string, Record<string, unknown>>;

