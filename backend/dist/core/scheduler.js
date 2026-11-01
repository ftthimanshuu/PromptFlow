import cron from "node-cron";
import { getSupabaseAdmin } from "../db/supabase.js";
import { executePipeline } from "./executor.js";
const scheduledTasks = new Map();
/**
 * Validates that a cron string doesn't execute faster than every 15 minutes.
 */
function isSafeFrequency(cronExpr) {
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length >= 5) {
        // If minute is '*', it runs every minute (unsafe)
        if (parts[0] === "*")
            return false;
        // If minute is step */1 .. */14, it runs too fast
        if (parts[0].startsWith("*/")) {
            const step = parseInt(parts[0].replace("*/", ""), 10);
            if (step < 15)
                return false;
        }
    }
    return true;
}
/**
 * Registers a single automation as a background cron job.
 */
export function registerAutomationJob(automation) {
    // Cancel existing task if any
    unregisterAutomationJob(automation.id);
    if (!automation.is_active)
        return false;
    let cronExpr = automation.schedule_cron || "0 9 * * *";
    if (!cron.validate(cronExpr)) {
        console.warn(`[SCHEDULER] Invalid cron expression "${cronExpr}" for automation ${automation.id}. Defaulting to daily 9 AM.`);
        cronExpr = "0 9 * * *";
    }
    if (!isSafeFrequency(cronExpr)) {
        console.warn(`[SCHEDULER] Cron expression "${cronExpr}" executes faster than 15 min limit. Adjusting to every 15 min.`);
        cronExpr = "*/15 * * * *";
    }
    const task = cron.schedule(cronExpr, async () => {
        console.log(`[CRON RUN] Executing scheduled automation "${automation.title}" (${automation.id})`);
        try {
            const pipeline = {
                title: automation.title,
                schedule_cron: cronExpr,
                steps: automation.steps,
            };
            const userDestinations = {
                telegram_chat_id: automation.profiles?.telegram_chat_id,
                discord_webhook_url: automation.profiles?.discord_webhook_url,
                email: automation.profiles?.email,
            };
            await executePipeline(pipeline, {
                automation_id: automation.id,
                userDestinations,
                isTestRun: false,
            });
        }
        catch (err) {
            console.error(`[CRON RUN ERROR] Automation ${automation.id} failed:`, err.message);
        }
    });
    scheduledTasks.set(automation.id, task);
    console.log(`[SCHEDULER] Scheduled "${automation.title}" with cron: "${cronExpr}"`);
    return true;
}
/**
 * Unregisters and stops a running automation cron job.
 */
export function unregisterAutomationJob(automationId) {
    const task = scheduledTasks.get(automationId);
    if (task) {
        task.stop();
        scheduledTasks.delete(automationId);
        console.log(`[SCHEDULER] Stopped job for automation ${automationId}`);
    }
}
/**
 * Initializes the background scheduler, loading all active automations from Supabase.
 */
export async function startScheduler() {
    console.log("[SCHEDULER] Bootstrapping background scheduler daemon...");
    try {
        const supabase = getSupabaseAdmin();
        const { data: automations, error } = await supabase
            .from("automations")
            .select("id, user_id, title, schedule_cron, steps, is_active, profiles:user_id(telegram_chat_id, discord_webhook_url)")
            .eq("is_active", true);
        if (error) {
            console.warn("[SCHEDULER] Unable to load automations from Supabase:", error.message);
            return;
        }
        if (!automations || automations.length === 0) {
            console.log("[SCHEDULER] No active automations found to schedule.");
            return;
        }
        let loadedCount = 0;
        for (const auto of automations) {
            const scheduled = registerAutomationJob(auto);
            if (scheduled)
                loadedCount++;
        }
        console.log(`[SCHEDULER] Successfully loaded and scheduled ${loadedCount} active automations.`);
    }
    catch (err) {
        console.error("[SCHEDULER INIT ERROR]:", err.message);
    }
}
