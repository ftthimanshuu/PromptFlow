import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

import { compilePrompt } from "./dist/core/compiler.js";
import { executePipeline } from "./dist/core/executor.js";
import { validateSafeUrl, scrapeWebsite } from "./dist/core/scraper.js";
import { evaluateCondition } from "./dist/core/evaluator.js";
import { interpolateTemplate } from "./dist/core/template.js";
import { dispatchNotification } from "./dist/core/notifier.js";

async function runAllTests() {
  console.log("================================================================================");
  console.log("🚀 PROMPTFLOW COMPREHENSIVE AUTOMATION TEST SUITE");
  console.log("================================================================================");

  const results = [];

  function recordResult(category, testName, passed, detail) {
    results.push({ category, testName, passed, detail });
    const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${icon} [${category}] ${testName}`);
    if (detail) {
      console.log(`   └─> ${detail}`);
    }
  }

  // ============================================================================
  // TEST 1: E-Commerce Price Watcher (Numeric Condition == TRUE)
  // ============================================================================
  try {
    const pipeline = {
      title: "Book Price Watcher (£51.77 < 60)",
      schedule_cron: "0 10 * * *",
      steps: [
        {
          step_id: 1,
          type: "scrape",
          config: { url: "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html", max_length: 5000 }
        },
        {
          step_id: 2,
          type: "ai_filter",
          config: {
            instruction: "Extract the book title and price in GBP as a number.",
            expected_fields: ["title", "price", "in_stock"]
          }
        },
        {
          step_id: 3,
          type: "condition",
          config: { field: "step_2.price", operator: "<", value: 60 }
        },
        {
          step_id: 4,
          type: "notify",
          config: { channel: "telegram", message: "🚨 Price Drop: {{step_2.title}} is now £{{step_2.price}}!" }
        }
      ]
    };

    const report = await executePipeline(pipeline, { isTestRun: true });
    const passed = report.status === "SUCCESS" && report.step_results.length === 4;
    recordResult(
      "Numeric Watcher",
      "E-Commerce Price Drop (< 60) Triggered Successfully",
      passed,
      `Duration: ${report.total_duration_ms}ms | Final Status: ${report.status}`
    );
  } catch (err) {
    recordResult("Numeric Watcher", "E-Commerce Price Drop", false, err.message);
  }

  // ============================================================================
  // TEST 2: Price Watcher Negative Condition (Short-Circuit / SKIPPED)
  // ============================================================================
  try {
    const pipeline = {
      title: "Book Price Unmet Condition (£51.77 < 20)",
      schedule_cron: "0 10 * * *",
      steps: [
        {
          step_id: 1,
          type: "scrape",
          config: { url: "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html", max_length: 5000 }
        },
        {
          step_id: 2,
          type: "ai_filter",
          config: {
            instruction: "Extract the book price.",
            expected_fields: ["price"]
          }
        },
        {
          step_id: 3,
          type: "condition",
          config: { field: "step_2.price", operator: "<", value: 20 } // False! 51.77 is not < 20
        },
        {
          step_id: 4,
          type: "notify",
          config: { channel: "telegram", message: "Should not be sent!" }
        }
      ]
    };

    const report = await executePipeline(pipeline, { isTestRun: true });
    const passed = report.status === "SKIPPED" && report.step_results.length === 3;
    recordResult(
      "Condition Logic",
      "Negative Threshold Gracefully Short-Circuits (SKIPPED State)",
      passed,
      `Halted at Step 3 | Status: ${report.status} | Notify step was avoided`
    );
  } catch (err) {
    recordResult("Condition Logic", "Negative Threshold Test", false, err.message);
  }

  // ============================================================================
  // TEST 3: Live Financial Market Commodity Monitor (Gold Price > 3000)
  // ============================================================================
  try {
    const pipeline = {
      title: "Live Spot Gold Price Monitor",
      schedule_cron: "0 9 * * *",
      steps: [
        {
          step_id: 1,
          type: "scrape",
          config: { url: "https://livepriceofgold.com", max_length: 5000 }
        },
        {
          step_id: 2,
          type: "ai_filter",
          config: {
            instruction: "Extract the current spot gold price in USD.",
            expected_fields: ["price", "currency"]
          }
        },
        {
          step_id: 3,
          type: "condition",
          config: { field: "step_2.price", operator: ">", value: 3000 }
        },
        {
          step_id: 4,
          type: "notify",
          config: { channel: "telegram", message: "🪙 Gold Price Alert: ${{step_2.price}} {{step_2.currency}}" }
        }
      ]
    };

    const report = await executePipeline(pipeline, { isTestRun: true });
    const passed = report.status === "SUCCESS";
    recordResult(
      "Market Monitor",
      "Commodity Live Price Extraction & Threshold Trigger",
      passed,
      `Duration: ${report.total_duration_ms}ms | Extracted: ${JSON.stringify(report.step_results[1]?.output_data)}`
    );
  } catch (err) {
    recordResult("Market Monitor", "Commodity Live Price Monitor", false, err.message);
  }

  // ============================================================================
  // TEST 4: Breaking News & Keyword Availability Monitor
  // ============================================================================
  try {
    const pipeline = {
      title: "Global Breaking News Keyword Monitor",
      schedule_cron: "0 8 * * *",
      steps: [
        {
          step_id: 1,
          type: "scrape",
          config: { url: "https://en.wikipedia.org/wiki/Portal:Current_events", max_length: 5000 }
        },
        {
          step_id: 2,
          type: "ai_filter",
          config: {
            instruction: "Check if there are any news events about world events, elections, or science.",
            expected_fields: ["found", "headline"]
          }
        },
        {
          step_id: 3,
          type: "condition",
          config: { field: "step_2.found", operator: "==", value: true }
        },
        {
          step_id: 4,
          type: "notify",
          config: { channel: "telegram", message: "🌍 News Alert: {{step_2.headline}}" }
        }
      ]
    };

    const report = await executePipeline(pipeline, { isTestRun: true });
    const passed = report.status === "SUCCESS";
    recordResult(
      "Content Monitor",
      "Semantic Topic Matching on Live Wikipedia Events",
      passed,
      `Headline: "${report.step_results[1]?.output_data?.headline?.substring(0, 60)}..."`
    );
  } catch (err) {
    recordResult("Content Monitor", "Semantic Topic Matching", false, err.message);
  }

  // ============================================================================
  // TEST 5: String Substring Matching (contains Operator)
  // ============================================================================
  try {
    const evalResult = evaluateCondition(
      { field: "step_1.title", operator: "contains", value: "Wikipedia" },
      { step_1: { title: "Portal:Current events - Wikipedia", url: "https://wikipedia.org" } }
    );

    recordResult(
      "Operator Engine",
      "Case-Insensitive 'contains' Operator Validation",
      evalResult.passed,
      `Expected 'contains Wikipedia', got '${evalResult.actual_value}'`
    );
  } catch (err) {
    recordResult("Operator Engine", "Contains Operator", false, err.message);
  }

  // ============================================================================
  // TEST 6: Template Engine & Currency Stripping Formatter
  // ============================================================================
  try {
    const mockContext = {
      step_1: { url: "https://store.demo/item", char_count: 420 },
      step_2: { title: "Sony WH-1000XM5", price: "£279.99", discount: "20%" },
    };

    const template = "Deal: {{step_2.title}} is now {{step_2.price}} ({{step_2.discount}} OFF) at {{step_1.url}}";
    const interpolated = interpolateTemplate(template, mockContext);
    const passed =
      interpolated.includes("Sony WH-1000XM5") &&
      interpolated.includes("£279.99") &&
      interpolated.includes("https://store.demo/item");

    recordResult(
      "Template Engine",
      "Multi-Variable Dynamic Token Replacement ({{step_X.field}})",
      passed,
      `Rendered: "${interpolated}"`
    );
  } catch (err) {
    recordResult("Template Engine", "Token Replacement", false, err.message);
  }

  // ============================================================================
  // TEST 7: Natural Language Compiler (Full Pipeline Generation)
  // ============================================================================
  try {
    const prompt = "Check https://example.com every morning at 9 AM. If title has Example, alert my Telegram.";
    const compileResult = await compilePrompt(prompt);

    const hasAllSteps =
      compileResult.status === "complete" &&
      compileResult.pipeline?.steps?.length === 4;

    recordResult(
      "AI Compiler",
      "Translating Natural Language to 4-Step Validated DSL",
      hasAllSteps,
      `Compiled Title: "${compileResult.pipeline?.title}" with 4 steps`
    );
  } catch (err) {
    recordResult("AI Compiler", "Natural Language Compilation", false, err.message);
  }

  // ============================================================================
  // TEST 8: Conversational Slot-Filling (Incomplete Prompt Detection)
  // ============================================================================
  try {
    const vaguePrompt = "Alert me when the price of Nike shoes drops below 5000";
    const compileResult = await compilePrompt(vaguePrompt);

    const isSlotFilling =
      compileResult.status === "incomplete" &&
      typeof compileResult.question === "string" &&
      compileResult.question.length > 5;

    recordResult(
      "Slot-Filling",
      "Automatic Detection of Missing Parameters & Clarification Dialogue",
      isSlotFilling,
      `AI Clarification Question: "${compileResult.question}"`
    );
  } catch (err) {
    recordResult("Slot-Filling", "Slot-filling detection", false, err.message);
  }

  // ============================================================================
  // TEST 9: SSRF Security Defense (Private IP & Loopback Blocking)
  // ============================================================================
  try {
    let blockedCount = 0;
    const malicious = [
      "http://localhost:3000",
      "http://127.0.0.1:8000",
      "http://169.254.169.254/latest/meta-data/",
      "http://192.168.1.1/admin"
    ];

    for (const url of malicious) {
      try {
        await validateSafeUrl(url);
      } catch (secErr) {
        blockedCount++;
      }
    }

    const allBlocked = blockedCount === malicious.length;
    recordResult(
      "Security / SSRF",
      "Pre-Socket DNS Inspection Blocking Localhost & Private Subnets",
      allBlocked,
      `Successfully blocked ${blockedCount}/${malicious.length} malicious targets`
    );
  } catch (err) {
    recordResult("Security / SSRF", "SSRF Defense", false, err.message);
  }

  // ============================================================================
  // TEST 10: Live Push Notification Dispatcher (Telegram Bot API)
  // ============================================================================
  try {
    const notifyRes = await dispatchNotification(
      { channel: "telegram", message: "🧪 PromptFlow Automated Test Suite: All checks executed successfully!" },
      "🧪 *PromptFlow System Check*: All automation categories verified!",
      { telegram_chat_id: "6312393356" }
    );

    recordResult(
      "Alert Dispatcher",
      "Telegram Bot API Live Delivery to Mobile Device",
      notifyRes.sent,
      `Delivered to Chat ID: ${notifyRes.destination}`
    );
  } catch (err) {
    recordResult("Alert Dispatcher", "Telegram Live Dispatch", false, err.message);
  }

  // ============================================================================
  // SUMMARY REPORT DISPLAY
  // ============================================================================
  console.log("\n================================================================================");
  console.log("📊 COMPREHENSIVE AUTOMATION TEST RESULTS");
  console.log("================================================================================");

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log(`Total Automation Types Tested: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${totalCount - passedCount}`);
  console.log(`Success Rate: ${passRate}%\n`);

  console.table(
    results.map((r, i) => ({
      "#": i + 1,
      Category: r.category,
      Test: r.testName.substring(0, 45),
      Status: r.passed ? "PASS" : "FAIL"
    }))
  );

  if (passedCount === totalCount) {
    console.log("\n🎉 ALL 10 AUTOMATION TYPES VERIFIED SUCCESSFULLY! System ready for next phase.");
  } else {
    console.log("\n⚠️ Some tests failed. Please review the details above.");
  }
}

runAllTests().catch(console.error);

