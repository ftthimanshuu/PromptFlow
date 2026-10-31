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
    throw new Error(
      "GEMINI_API_KEY is not configured in backend/.env. Please provide your Google AI Studio key."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1, // Low temperature for deterministic, factual extraction
    },
  });

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

  const result = await model.generateContent(prompt);
  const rawResponse = result.response.text().trim();

  try {
    // Strip possible markdown backticks if model wrapped json
    const sanitized = rawResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(sanitized);
    return parsed;
  } catch (err: any) {
    throw new Error(
      `Failed to parse Gemini extractor JSON output: ${err.message}. Raw output: ${rawResponse.substring(0, 200)}`
    );
  }
}
