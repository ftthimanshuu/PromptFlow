import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { config } from "../config.js";
const COMPILER_SYSTEM_PROMPT = `
You are the PromptFlow AI Automation Compiler.
Your mission is to translate ANY user natural language request into a reliable, executable 4-step micro-automation pipeline JSON.

PromptFlow is a general-purpose, prompt-driven automation platform for everyday tasks:
- Tracking product prices or discounts (e.g., "Alert me if this headphone drops below $100")
- Monitoring job boards or internships (e.g., "Check this careers page for React internships")
- Watching academic / university notice boards (e.g., "Check timetable releases")
- Tech news & releases (e.g., "Monitor this blog for AI updates")
- Government / exam / visa / event announcements

SUPPORTED STEP TYPES (EXACTLY 4 TYPES):
1. "scrape":
   config: { "url": string, "max_length": number (default: 10000) }
2. "ai_filter":
   config: { "instruction": string, "expected_fields": string[] }
   (expected_fields must always include sensible keys, e.g. ["found", "title", "price", "link"])
3. "condition":
   config: {
     "field": string (e.g. "step_2.found" or "step_2.price"),
     "operator": "==" | "!=" | ">" | "<" | ">=" | "<=" | "contains",
     "value": string | number | boolean
   }
4. "notify":
   config: {
     "channel": "telegram" | "discord" | "email",
     "message": string (must use {{step_2.field}} variable interpolation tokens)
   }

RULES:
1. Always construct a complete 4-step pipeline: [scrape -> ai_filter -> condition -> notify].
2. If essential info is missing (e.g., user said "Alert me when laptop drops below 50000" but gave no URL, OR gave a URL but didn't state what condition to check):
   - Set status to "incomplete".
   - Put null for the missing field in the config (e.g. url: null).
   - In the "question" field, ask a friendly, concise clarification question to elicit the missing parameter.
3. If enough info exists:
   - Set status to "complete".
   - Default schedule_cron to "0 9 * * *" (daily at 9 AM) if frequency wasn't mentioned.
   - Default channel to "telegram" if not specified, or "discord" if Discord is mentioned, or "email" if email/mail/inbox is mentioned.
4. MULTI-TURN MEMORY INTEGRATION:
   - When the user supplies a missing value in a follow-up turn (e.g., providing a URL, threshold, or keyword), you MUST MERGE it with the goals stated in previous conversation turns.
   - For example: If turn 1 asked "Alert me if gold drops below 75000" and turn 2 provides "https://goldprice.org", the compiled pipeline MUST have url: "https://goldprice.org" AND condition: { field: "step_2.price", operator: "<", value: 75000 }. Never drop parameters from prior turns.
5. Output MUST be valid JSON conforming to this schema:
{
  "status": "complete" | "incomplete",
  "question": "Clarification question if incomplete, otherwise null",
  "pipeline": {
    "title": "Short descriptive title",
    "description": "What this automation does",
    "schedule_cron": "0 9 * * *",
    "steps": [
      { "step_id": 1, "type": "scrape", "config": { ... } },
      { "step_id": 2, "type": "ai_filter", "config": { ... } },
      { "step_id": 3, "type": "condition", "config": { ... } },
      { "step_id": 4, "type": "notify", "config": { ... } }
    ]
  }
}
`;
/**
 * Compiles a natural language user prompt into an executable pipeline JSON.
 * Supports multi-turn conversational context via chatHistory.
 */
async function compileWithGroq(prompt, chatHistory, apiKey) {
    const groq = new Groq({ apiKey });
    const messages = [
        {
            role: "system",
            content: COMPILER_SYSTEM_PROMPT,
        },
        ...chatHistory.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
        })),
        {
            role: "user",
            content: prompt,
        },
    ];
    const groqModels = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "llama-3.3-70b-versatile",
    ];
    for (const model of groqModels) {
        try {
            const completion = await groq.chat.completions.create({
                model,
                messages,
                response_format: { type: "json_object" },
                temperature: 0.2,
            });
            const rawText = completion.choices[0]?.message?.content?.trim() || "";
            const sanitized = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            return JSON.parse(sanitized);
        }
        catch (err) {
            console.warn(`[COMPILER] Groq model ${model} failed:`, err.message);
        }
    }
    throw new Error("All Groq models failed.");
}
/**
 * Compiles a natural language user prompt into an executable pipeline JSON.
 * Supports multi-turn conversational context via chatHistory.
 * Uses Groq (ultra-fast GPT-OSS-120B / Qwen) or Gemini with seamless automatic failover.
 */
export async function compilePrompt(prompt, chatHistory = []) {
    // Strategy 1: If Groq API Key is configured, use Groq (blazing fast, ~300ms, zero 503 errors)
    if (config.GROQ_API_KEY) {
        try {
            console.log("[COMPILER] Compiling via Groq...");
            const result = await compileWithGroq(prompt, chatHistory, config.GROQ_API_KEY);
            return result;
        }
        catch (groqErr) {
            console.warn("[COMPILER] Groq compilation failed, falling back to Gemini:", groqErr.message);
        }
    }
    // Strategy 2: Google Gemini (gemini-3.5-flash / gemini-3.8-flash)
    const geminiApiKey = config.GEMINI_API_KEY;
    if (geminiApiKey) {
        const modelCandidates = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const formattedHistory = chatHistory.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));
        for (const modelName of modelCandidates) {
            try {
                console.log(`[COMPILER] Trying Gemini model: ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: COMPILER_SYSTEM_PROMPT,
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.2,
                    },
                });
                const chat = model.startChat({
                    history: formattedHistory,
                });
                const response = await chat.sendMessage(prompt);
                const rawText = response.response.text().trim();
                const sanitized = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
                const parsed = JSON.parse(sanitized);
                return parsed;
            }
            catch (err) {
                console.warn(`[COMPILER] Model ${modelName} call failed:`, err.message);
            }
        }
    }
    // Strategy 3: Graceful heuristic fallback if all remote APIs are offline/overloaded
    console.warn("[COMPILER] All remote LLM models unavailable. Using heuristic fallback.");
    return mockCompile(prompt);
}
/**
 * Smart heuristic fallback for offline development/testing
 */
function mockCompile(prompt) {
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/i);
    const hasUrl = Boolean(urlMatch);
    const detectedUrl = urlMatch ? urlMatch[0] : null;
    if (!hasUrl) {
        return {
            status: "incomplete",
            question: "I've drafted your automation! Which website URL would you like me to monitor?",
            pipeline: {
                title: "Web Monitor Alert",
                description: "Monitors website and notifies user",
                schedule_cron: "0 9 * * *",
                steps: [
                    { step_id: 1, type: "scrape", config: { url: null, max_length: 10000 } },
                    {
                        step_id: 2,
                        type: "ai_filter",
                        config: {
                            instruction: "Scan the webpage text for the requested condition.",
                            expected_fields: ["found", "title", "details"],
                        },
                    },
                    {
                        step_id: 3,
                        type: "condition",
                        config: { field: "step_2.found", operator: "==", value: true },
                    },
                    {
                        step_id: 4,
                        type: "notify",
                        config: {
                            channel: "telegram",
                            message: "🚨 PromptFlow Alert: {{step_2.title}}\nDetails: {{step_2.details}}",
                        },
                    },
                ],
            },
        };
    }
    return {
        status: "complete",
        pipeline: {
            title: "Daily Web Alert",
            description: `Monitors ${detectedUrl} daily for updates`,
            schedule_cron: "0 9 * * *",
            steps: [
                {
                    step_id: 1,
                    type: "scrape",
                    config: { url: detectedUrl, max_length: 10000 },
                },
                {
                    step_id: 2,
                    type: "ai_filter",
                    config: {
                        instruction: "Extract the latest updates matching the user goal.",
                        expected_fields: ["found", "title", "link"],
                    },
                },
                {
                    step_id: 3,
                    type: "condition",
                    config: { field: "step_2.found", operator: "==", value: true },
                },
                {
                    step_id: 4,
                    type: "notify",
                    config: {
                        channel: "telegram",
                        message: "🚨 Update Detected: {{step_2.title}}\nLink: {{step_2.link}}",
                    },
                },
            ],
        },
    };
}
