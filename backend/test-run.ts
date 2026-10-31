import { validateSafeUrl } from "./src/core/scraper.js";
import { evaluateCondition } from "./src/core/evaluator.js";
import { interpolateTemplate } from "./src/core/template.js";
import { compilePrompt } from "./src/core/compiler.js";

async function runTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING PROMPTFLOW CORE TESTS");
  console.log("==========================================");

  // Test 1: SSRF Defense
  console.log("\n[Test 1] SSRF Defense (Localhost & Private IP check)...");
  try {
    await validateSafeUrl("http://localhost:8080/admin");
    console.error("❌ FAILED: Localhost was not blocked!");
  } catch (err: any) {
    console.log("✅ PASSED: Blocked localhost:", err.message);
  }

  try {
    await validateSafeUrl("http://127.0.0.1:3000");
    console.error("❌ FAILED: 127.0.0.1 was not blocked!");
  } catch (err: any) {
    console.log("✅ PASSED: Blocked 127.0.0.1:", err.message);
  }

  // Test 2: Condition Evaluator
  console.log("\n[Test 2] Condition Evaluator...");
  const mockContext = {
    step_1: { text: "Some raw web text", url: "https://example.com" },
    step_2: { found: true, price: 45000, title: "iPhone 15 Deal", category: "Smartphones" },
  };

  const condition1 = evaluateCondition(
    { field: "step_2.found", operator: "==", value: true },
    mockContext
  );
  console.log("Evaluation (step_2.found == true):", condition1.passed ? "✅ PASSED" : "❌ FAILED");

  const condition2 = evaluateCondition(
    { field: "step_2.price", operator: "<", value: 50000 },
    mockContext
  );
  console.log("Evaluation (step_2.price < 50000):", condition2.passed ? "✅ PASSED" : "❌ FAILED");

  const condition3 = evaluateCondition(
    { field: "step_2.title", operator: "contains", value: "iPhone" },
    mockContext
  );
  console.log("Evaluation (step_2.title contains iPhone):", condition3.passed ? "✅ PASSED" : "❌ FAILED");

  // Test 3: Template Interpolation
  console.log("\n[Test 3] Variable Interpolation...");
  const template = "🚨 Deal Alert: {{step_2.title}} is now only ₹{{step_2.price}}!";
  const resolved = interpolateTemplate(template, mockContext);
  console.log("Resolved message:", resolved);
  if (resolved.includes("iPhone 15 Deal") && resolved.includes("₹45000")) {
    console.log("✅ PASSED: Template tokens correctly interpolated");
  } else {
    console.error("❌ FAILED: Tokens not interpolated properly");
  }

  // Test 4: General Purpose Prompt Compiler
  console.log("\n[Test 4] General-Purpose Prompt Compiler...");
  const samplePrompt = "Alert me when laptop drops below 50000";
  const compileResult = await compilePrompt(samplePrompt);
  console.log("Compilation Status:", compileResult.status);
  if (compileResult.status === "incomplete") {
    console.log("Slot-filling Question:", compileResult.question);
    console.log("✅ PASSED: Detected missing URL and initiated conversational slot-filling");
  } else {
    console.log("Compiled Title:", compileResult.pipeline?.title);
  }

  console.log("\n==========================================");
  console.log("🎉 ALL TESTS EXECUTED");
  console.log("==========================================");
}

runTests().catch(console.error);
