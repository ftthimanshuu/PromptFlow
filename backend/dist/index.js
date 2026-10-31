"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_js_1 = require("./config.js");
const health_routes_js_1 = __importDefault(require("./routes/health.routes.js"));
const compile_routes_js_1 = __importDefault(require("./routes/compile.routes.js"));
const execute_routes_js_1 = __importDefault(require("./routes/execute.routes.js"));
const automations_routes_js_1 = __importDefault(require("./routes/automations.routes.js"));
const scheduler_js_1 = require("./core/scheduler.js");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "5mb" }));
// Route registrations
app.use("/api/health", health_routes_js_1.default);
app.use("/api/compile", compile_routes_js_1.default);
app.use("/api/execute", execute_routes_js_1.default);
app.use("/api/automations", automations_routes_js_1.default);
// Root greeting
app.get("/", (req, res) => {
    res.json({
        app: "PromptFlow Autonomous Micro-Automation Engine",
        status: "online",
        docs: "/api/health",
    });
});
// Start Express server
const server = app.listen(config_js_1.config.PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🚀 PromptFlow Backend running on http://localhost:${config_js_1.config.PORT}`);
    console.log(`   Environment: ${config_js_1.config.NODE_ENV}`);
    console.log(`=======================================================`);
    // Start background cron scheduler
    await (0, scheduler_js_1.startScheduler)();
});
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n[SHUTDOWN] Terminating PromptFlow server...");
    server.close(() => {
        process.exit(0);
    });
});
