"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const scheduler_js_1 = require("../core/scheduler.js");
const supabase_js_1 = require("../db/supabase.js");
const dsl_js_1 = require("../types/dsl.js");
const router = (0, express_1.Router)();
const CreateAutomationSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid("Valid user UUID is required"),
    pipeline: dsl_js_1.PipelineSpecificationSchema,
    is_active: zod_1.z.boolean().default(true),
});
// Create new automation
router.post("/", async (req, res) => {
    const parseResult = CreateAutomationSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            error: "Invalid automation payload",
            details: parseResult.error.format(),
        });
        return;
    }
    const { user_id, pipeline, is_active } = parseResult.data;
    const supabase = (0, supabase_js_1.getSupabaseAdmin)();
    try {
        const { data, error } = await supabase
            .from("automations")
            .insert({
            user_id,
            title: pipeline.title,
            description: pipeline.description || null,
            schedule_cron: pipeline.schedule_cron,
            steps: pipeline.steps,
            is_active,
        })
            .select("id, user_id, title, schedule_cron, steps, is_active, profiles:user_id(telegram_chat_id, discord_webhook_url)")
            .single();
        if (error) {
            if (error.message.includes("Account Quota Exceeded")) {
                res.status(403).json({
                    error: "Quota Limit Reached",
                    message: "You cannot have more than 5 active automations. Please deactivate one before activating a new one.",
                });
                return;
            }
            throw error;
        }
        // Register with scheduler if active
        if (data.is_active) {
            (0, scheduler_js_1.registerAutomationJob)(data);
        }
        res.status(201).json({
            message: "Automation created successfully",
            automation: data,
        });
    }
    catch (err) {
        console.error("[CREATE AUTOMATION ERROR]:", err.message);
        res.status(500).json({
            error: "Failed to create automation",
            details: err.message,
        });
    }
});
// Toggle active status
router.patch("/:id/toggle", async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") {
        res.status(400).json({ error: "is_active boolean field is required" });
        return;
    }
    const supabase = (0, supabase_js_1.getSupabaseAdmin)();
    try {
        const { data, error } = await supabase
            .from("automations")
            .update({ is_active, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select("id, user_id, title, schedule_cron, steps, is_active, profiles:user_id(telegram_chat_id, discord_webhook_url)")
            .single();
        if (error) {
            if (error.message.includes("Account Quota Exceeded")) {
                res.status(403).json({
                    error: "Quota Limit Reached",
                    message: "You cannot have more than 5 active automations. Please deactivate another automation first.",
                });
                return;
            }
            throw error;
        }
        if (data.is_active) {
            (0, scheduler_js_1.registerAutomationJob)(data);
        }
        else {
            (0, scheduler_js_1.unregisterAutomationJob)(data.id);
        }
        res.json({
            message: `Automation ${data.is_active ? "activated" : "deactivated"}`,
            automation: data,
        });
    }
    catch (err) {
        console.error("[TOGGLE AUTOMATION ERROR]:", err.message);
        res.status(500).json({
            error: "Failed to update automation status",
            details: err.message,
        });
    }
});
// Delete automation
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const supabase = (0, supabase_js_1.getSupabaseAdmin)();
    try {
        (0, scheduler_js_1.unregisterAutomationJob)(id);
        const { error } = await supabase.from("automations").delete().eq("id", id);
        if (error)
            throw error;
        res.json({ message: "Automation deleted successfully", id });
    }
    catch (err) {
        console.error("[DELETE AUTOMATION ERROR]:", err.message);
        res.status(500).json({
            error: "Failed to delete automation",
            details: err.message,
        });
    }
});
exports.default = router;
