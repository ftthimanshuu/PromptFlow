"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const executor_js_1 = require("../core/executor.js");
const dsl_js_1 = require("../types/dsl.js");
const router = (0, express_1.Router)();
const TestExecuteRequestSchema = zod_1.z.object({
    pipeline: dsl_js_1.PipelineSpecificationSchema,
    user_destinations: zod_1.z
        .object({
        telegram_chat_id: zod_1.z.string().nullable().optional(),
        discord_webhook_url: zod_1.z.string().nullable().optional(),
    })
        .optional(),
});
router.post("/test", async (req, res) => {
    const parseResult = TestExecuteRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            error: "Invalid pipeline payload for test run",
            details: parseResult.error.format(),
        });
        return;
    }
    const { pipeline, user_destinations } = parseResult.data;
    try {
        const report = await (0, executor_js_1.executePipeline)(pipeline, {
            userDestinations: user_destinations,
            isTestRun: true,
        });
        res.json(report);
    }
    catch (err) {
        console.error("[TEST RUN ERROR]:", err.message);
        res.status(500).json({
            error: "Test run execution encountered an unhandled error",
            details: err.message,
        });
    }
});
exports.default = router;
