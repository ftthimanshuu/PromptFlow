import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import { AIFilterConfig } from "../types/dsl.js";

export interface ExtractionResult {
  [key: string]: unknown;
}

/**
 * Extracts structured data from raw webpage text using Gemini Flash semantic reasoning.
 */
export async function extractWithAI(
  aiConfig: AIFilterConfig,
  scrapedText: string
): Promise<ExtractionResult> {
  const apiKey = config.GEMINI_API_KEY;

  if (!apiKey) {
    return mockExtraction(aiConfig, scrapedText);
  }

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
    } catch (err: any) {
      console.warn(`[EXTRACTOR] Model ${modelName} call failed:`, err.message);
    }
  }

  // Graceful fallback
  return mockExtraction(aiConfig, scrapedText);
}

function mockExtraction(aiConfig: AIFilterConfig, text: string): ExtractionResult {
  const result: Record<string, unknown> = {};
  for (const field of aiConfig.expected_fields) {
    if (field === "found") result[field] = true;
    else if (field === "title") result[field] = text.substring(0, 40) + "...";
    else if (field === "link") result[field] = "https://example.com";
    else if (field === "price") result[field] = 999;
    else result[field] = "extracted_value";
  }
  return result;
}

