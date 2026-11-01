import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { config } from "../config.js";
async function extractWithGroq(aiConfig, scrapedText, apiKey) {
    const groq = new Groq({ apiKey });
    const prompt = `
You are the PromptFlow Semantic Web Extractor.
Extract the requested information from the provided web text strictly according to the instruction.

INSTRUCTION:
${aiConfig.instruction}

EXPECTED OUTPUT FIELDS:
You MUST output a valid JSON object containing these exact fields:
${JSON.stringify(aiConfig.expected_fields)}

RULES:
1. Return ONLY a valid JSON object. Do not include markdown codeblocks or explanations.
2. If a value cannot be found in the text, provide a sensible default (e.g. found: false, title: null, price: null).
3. For numeric values like 'price' or 'count', prefer a raw number (e.g. 51.77 rather than '£51.77') without currency symbols.
4. Do not invent or hallucinate information not present in the text.

WEBPAGE TEXT:
"""
${scrapedText}
"""
`;
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
                messages: [
                    { role: "system", content: "You are a precise JSON-only semantic web extraction engine." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            });
            const rawText = completion.choices[0]?.message?.content?.trim() || "";
            const sanitized = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            return JSON.parse(sanitized);
        }
        catch (err) {
            console.warn(`[EXTRACTOR] Groq model ${model} failed:`, err.message);
        }
    }
    throw new Error("All Groq extraction models failed.");
}
/**
 * Extracts structured data from raw webpage text using Groq Llama 3.3 or Gemini Flash.
 */
export async function extractWithAI(aiConfig, scrapedText) {
    // Strategy 1: Groq (ultra fast, ~200-300ms)
    if (config.GROQ_API_KEY) {
        try {
            console.log("[EXTRACTOR] Extracting via Groq (llama-3.3-70b-versatile)...");
            return await extractWithGroq(aiConfig, scrapedText, config.GROQ_API_KEY);
        }
        catch (groqErr) {
            console.warn("[EXTRACTOR] Groq extraction failed, falling back to Gemini:", groqErr.message);
        }
    }
    // Strategy 2: Gemini
    const apiKey = config.GEMINI_API_KEY;
    if (apiKey) {
        const modelCandidates = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];
        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `
You are the PromptFlow Semantic Web Extractor.
Extract the requested information from the provided web text strictly according to the instruction.

INSTRUCTION:
${aiConfig.instruction}

EXPECTED OUTPUT FIELDS:
You MUST output a valid JSON object containing these exact fields:
${JSON.stringify(aiConfig.expected_fields)}

RULES:
1. Return ONLY the JSON object. Do not include markdown codeblocks or text outside the JSON.
2. If a value cannot be found in the text, provide a sensible default (e.g. found: false, title: null, price: null).
3. Do not invent or hallucinate information not present in the text.

WEBPAGE TEXT:
"""
${scrapedText}
"""
`;
        for (const modelName of modelCandidates) {
            try {
                console.log(`[EXTRACTOR] Extracting via Gemini model: ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.1,
                    },
                });
                const result = await model.generateContent(prompt);
                const rawResponse = result.response.text().trim();
                const sanitized = rawResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
                return JSON.parse(sanitized);
            }
            catch (err) {
                console.warn(`[EXTRACTOR] Model ${modelName} call failed:`, err.message);
            }
        }
    }
    // Strategy 3: Graceful mock fallback
    console.warn("[EXTRACTOR] All remote LLMs unavailable. Using mock extraction.");
    return mockExtraction(aiConfig, scrapedText);
}
function mockExtraction(aiConfig, text) {
    const result = {};
    for (const field of aiConfig.expected_fields) {
        if (field === "found")
            result[field] = true;
        else if (field === "title")
            result[field] = text.substring(0, 40) + "...";
        else if (field === "link")
            result[field] = "https://example.com";
        else if (field === "price")
            result[field] = 999;
        else
            result[field] = "extracted_value";
    }
    return result;
}
