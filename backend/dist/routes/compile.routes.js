"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const compiler_js_1 = require("../core/compiler.js");
const supabase_js_1 = require("../db/supabase.js");
const router = (0, express_1.Router)();
const CompileRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1, "Prompt cannot be empty"),
    session_id: zod_1.z.string().uuid().optional(),
    user_id: zod_1.z.string().uuid().optional(),
});
router.post("/", async (req, res) => {
    const parseResult = CompileRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({
            error: "Invalid request payload",
            details: parseResult.error.format(),
        });
        return;
    }
    const { prompt, session_id, user_id } = parseResult.data;
    let history = [];
    const supabase = (0, supabase_js_1.getSupabaseAdmin)();
    // If session_id and user_id are supplied, retrieve multi-turn conversation memory
    if (session_id && user_id) {
        try {
            const { data: dbHistory } = await supabase
                .from("chat_history")
                .select("role, content")
                .eq("session_id", session_id)
                .order("created_at", { ascending: true })
                .limit(10);
            if (dbHistory && dbHistory.length > 0) {
                history = dbHistory.map((item) => ({
                    role: item.role,
                    content: item.content,
                }));
            }
        }
        catch (err) {
            console.warn("[CHAT HISTORY FETCH WARNING]:", err.message);
        }
    }
    try {
        const compileResult = await (0, compiler_js_1.compilePrompt)(prompt, history);
        // Save user prompt & assistant response to chat_history
        if (session_id && user_id) {
            try {
                const assistantReply = compileResult.status === "incomplete"
                    ? compileResult.question || "I have prepared the draft. Could you clarify the missing details?"
                    : `I have compiled your automation: "${compileResult.pipeline?.title}". You can review the steps and test run it!`;
                await supabase.from("chat_history").insert([
                    { session_id, user_id, role: "user", content: prompt },
                    { session_id, user_id, role: "model", content: assistantReply },
                ]);
            }
            catch (saveErr) {
                console.warn("[CHAT HISTORY SAVE WARNING]:", saveErr.message);
            }
        }
        res.json(compileResult);
    }
    catch (err) {
        console.error("[COMPILE ERROR]:", err.message);
        res.status(500).json({
            error: "Failed to compile prompt",
            details: err.message,
        });
    }
});
exports.default = router;
