import { z } from "zod";
// ============================================================================
// STEP CONFIG SCHEMAS
// ============================================================================
export const ScrapeConfigSchema = z.object({
    url: z.string().url("A valid HTTP/HTTPS URL is required"),
    max_length: z.number().int().positive().default(10000),
});
export const AIFilterConfigSchema = z.object({
    instruction: z.string().min(1, "Instruction is required"),
    expected_fields: z.array(z.string().min(1)).min(1, "At least one expected field is required"),
});
export const ConditionOperatorSchema = z.enum([
    "==",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
]);
export const ConditionConfigSchema = z.object({
    field: z.string().min(1, "Target field path is required (e.g. step_2.found)"),
    operator: ConditionOperatorSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
});
export const NotifyChannelSchema = z.enum(["telegram", "discord", "email"]);
export const NotifyConfigSchema = z.object({
    channel: NotifyChannelSchema.default("telegram"),
    message: z.string().min(1, "Alert message template is required"),
});
// ============================================================================
// STEP DEFINITIONS
// ============================================================================
export const StepTypeSchema = z.enum(["scrape", "ai_filter", "condition", "notify"]);
export const StepDefinitionSchema = z.object({
    step_id: z.number().int().positive(),
    type: StepTypeSchema,
    config: z.record(z.any()), // Dynamic per step type, validated at runtime
});
// ============================================================================
// PIPELINE SPECIFICATION
// ============================================================================
export const PipelineSpecificationSchema = z.object({
    title: z.string().min(1, "Pipeline title is required"),
    description: z.string().optional(),
    schedule_cron: z.string().default("0 9 * * *"),
    steps: z.array(StepDefinitionSchema).min(1, "At least one step is required"),
});
