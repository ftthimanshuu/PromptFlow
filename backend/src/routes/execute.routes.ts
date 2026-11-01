import { Router, Request, Response } from "express";
import { z } from "zod";
import { executePipeline } from "../core/executor.js";
import { PipelineSpecificationSchema } from "../types/dsl.js";

const router = Router();

const TestExecuteRequestSchema = z.object({
  pipeline: PipelineSpecificationSchema,
  user_destinations: z
    .object({
      telegram_chat_id: z.string().nullable().optional(),
      discord_webhook_url: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .optional(),
});

router.post("/test", async (req: Request, res: Response): Promise<void> => {
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
    const report = await executePipeline(pipeline, {
      userDestinations: user_destinations,
      isTestRun: true,
    });

    res.json(report);
  } catch (err: any) {
    console.error("[TEST RUN ERROR]:", err.message);
    res.status(500).json({
      error: "Test run execution encountered an unhandled error",
      details: err.message,
    });
  }
});

export default router;

