"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineSpecificationSchema = exports.StepDefinitionSchema = exports.StepTypeSchema = exports.NotifyConfigSchema = exports.NotifyChannelSchema = exports.ConditionConfigSchema = exports.ConditionOperatorSchema = exports.AIFilterConfigSchema = exports.ScrapeConfigSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// STEP CONFIG SCHEMAS
// ============================================================================
exports.ScrapeConfigSchema = zod_1.z.object({
    url: zod_1.z.string().url("A valid HTTP/HTTPS URL is required"),
    max_length: zod_1.z.number().int().positive().default(10000),
});
exports.AIFilterConfigSchema = zod_1.z.object({
    instruction: zod_1.z.string().min(1, "Instruction is required"),
    expected_fields: zod_1.z.array(zod_1.z.string().min(1)).min(1, "At least one expected field is required"),
});
exports.ConditionOperatorSchema = zod_1.z.enum([
    "==",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
]);
exports.ConditionConfigSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, "Target field path is required (e.g. step_2.found)"),
    operator: exports.ConditionOperatorSchema,
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]),
});
exports.NotifyChannelSchema = zod_1.z.enum(["telegram", "discord"]);
exports.NotifyConfigSchema = zod_1.z.object({
    channel: exports.NotifyChannelSchema.default("telegram"),
    message: zod_1.z.string().min(1, "Alert message template is required"),
});
// ============================================================================
// STEP DEFINITIONS
// ============================================================================
exports.StepTypeSchema = zod_1.z.enum(["scrape", "ai_filter", "condition", "notify"]);
exports.StepDefinitionSchema = zod_1.z.object({
    step_id: zod_1.z.number().int().positive(),
    type: exports.StepTypeSchema,
    config: zod_1.z.record(zod_1.z.any()), // Dynamic per step type, validated at runtime
});
// ============================================================================
// PIPELINE SPECIFICATION
// ============================================================================
exports.PipelineSpecificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Pipeline title is required"),
    description: zod_1.z.string().optional(),
    schedule_cron: zod_1.z.string().default("0 9 * * *"),
    steps: zod_1.z.array(exports.StepDefinitionSchema).min(1, "At least one step is required"),
});
