import { Router, Request, Response } from "express";
import { z } from "zod";
import { registerAutomationJob, unregisterAutomationJob } from "../core/scheduler.js";
import { getSupabaseAdmin } from "../db/supabase.js";
import { PipelineSpecificationSchema } from "../types/dsl.js";

const router = Router();

const CreateAutomationSchema = z.object({
  user_id: z.string().uuid("Valid user UUID is required"),
  pipeline: PipelineSpecificationSchema,
  is_active: z.boolean().default(true),
});

// Create new automation
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parseResult = CreateAutomationSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid automation payload",
      details: parseResult.error.format(),
    });
    return;
  }

  const { user_id, pipeline, is_active } = parseResult.data;
  const supabase = getSupabaseAdmin();

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
      registerAutomationJob(data as any);
    }

    res.status(201).json({
      message: "Automation created successfully",
      automation: data,
    });
  } catch (err: any) {
    console.error("[CREATE AUTOMATION ERROR]:", err.message);
    res.status(500).json({
      error: "Failed to create automation",
      details: err.message,
    });
  }
});

// Toggle active status
router.patch("/:id/toggle", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    res.status(400).json({ error: "is_active boolean field is required" });
    return;
  }

  const supabase = getSupabaseAdmin();

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
      registerAutomationJob(data as any);
    } else {
      unregisterAutomationJob(data.id);
    }

    res.json({
      message: `Automation ${data.is_active ? "activated" : "deactivated"}`,
      automation: data,
    });
  } catch (err: any) {
    console.error("[TOGGLE AUTOMATION ERROR]:", err.message);
    res.status(500).json({
      error: "Failed to update automation status",
      details: err.message,
    });
  }
});

// Delete automation
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const supabase = getSupabaseAdmin();

  try {
    unregisterAutomationJob(id);

    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "Automation deleted successfully", id });
  } catch (err: any) {
    console.error("[DELETE AUTOMATION ERROR]:", err.message);
    res.status(500).json({
      error: "Failed to delete automation",
      details: err.message,
    });
  }
});

export default router;

