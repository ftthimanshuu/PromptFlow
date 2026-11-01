import express from "express";
import cors from "cors";
import { config } from "./config.js";
import healthRoutes from "./routes/health.routes.js";
import compileRoutes from "./routes/compile.routes.js";
import executeRoutes from "./routes/execute.routes.js";
import automationsRoutes from "./routes/automations.routes.js";
import { startScheduler } from "./core/scheduler.js";
const app = express();
// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
// Route registrations
app.use("/api/health", healthRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/automations", automationsRoutes);
// Root greeting
app.get("/", (req, res) => {
    res.json({
        app: "PromptFlow Autonomous Micro-Automation Engine",
        status: "online",
        docs: "/api/health",
    });
});
// Start Express server
const server = app.listen(config.PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🚀 PromptFlow Backend running on http://localhost:${config.PORT}`);
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`=======================================================`);
    // Start background cron scheduler
    await startScheduler();
});
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n[SHUTDOWN] Terminating PromptFlow server...");
    server.close(() => {
        process.exit(0);
    });
});
