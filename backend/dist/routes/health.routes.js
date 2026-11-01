import { Router } from "express";
const router = Router();
router.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "PromptFlow Execution Engine",
        timestamp: new Date().toISOString(),
        uptime_seconds: process.uptime(),
    });
});
export default router;
