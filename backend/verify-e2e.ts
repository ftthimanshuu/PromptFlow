import { validateSafeUrl } from "./src/core/scraper.js";
import { executePipeline } from "./src/core/executor.js";
import { compilePrompt } from "./src/core/compiler.js";
import { PipelineSpecification } from "./src/types/dsl.js";

async function verifyEndToEnd() {
  console.log("================================================================");
  console.log("🚀 STARTING PROMPTFLOW END-TO-END VERIFICATION SUITE");
  console.log("================================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Security & SSRF Defense Boundary
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 1] SSRF & Private IP Interception...");

  const dangerousUrls = [
    "http://localhost:8080/admin",
    "http://127.0.0.1:5432",
    "http://169.254.169.254/latest/meta-data/",
    "http://192.168.1.1/router",
    "ftp://example.com/file.txt",
    "file:///etc/passwd",
  ];

  for (const badUrl of dangerousUrls) {
    try {
      await validateSafeUrl(badUrl);
      assert(false, `Block ${badUrl}`, "Failed to throw security exception");
    } catch (err: any) {
      assert(true, `Block dangerous target: ${badUrl}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 2: General-Purpose Compiler Slot-Filling
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 2] Conversational Slot-Filling for Everyday Prompts...");

  const incompletePrompt = "Notify my Telegram if MacBook Air M2 price drops below 70000";
  const compileResult1 = await compilePrompt(incompletePrompt);

  assert(
    compileResult1.status === "incomplete",
    "Detect missing website URL in incomplete prompt"
  );
  assert(
    typeof compileResult1.question === "string" && compileResult1.question.length > 0,
    "Generate conversational clarification question"
  );

  const completePrompt = "Check https://news.ycombinator.com every morning at 9 AM. If there is a post about AI, notify my Telegram.";
  const compileResult2 = await compilePrompt(completePrompt);
  assert(
    compileResult2.status === "complete" || compileResult2.pipeline !== undefined,
    "Compile complete pipeline from natural language prompt"
  );

  // --------------------------------------------------------------------------
  // TEST 3: Execution Engine & Condition Short-Circuiting (SKIPPED state)
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 3] Execution Engine Lifecycle & Short-Circuiting...");

  // Mock a pipeline where condition evaluates to FALSE (should SKIP notification)
  const falseConditionPipeline: PipelineSpecification = {
    title: "Price Monitor Test (Unmet Condition)",
    schedule_cron: "0 9 * * *",
    steps: [
      {
        step_id: 1,
        type: "scrape",
        config: { url: "https://example.com", max_length: 5000 },
      },
      {
        step_id: 2,
        type: "condition",
        config: { field: "step_1.char_count", operator: ">", value: 9999999 }, // impossible length
      },
      {
        step_id: 3,
        type: "notify",
        config: { channel: "telegram", message: "Alert! {{step_1.title}}" },
      },
    ],
  };

  const skipReport = await executePipeline(falseConditionPipeline, { isTestRun: true });
  assert(skipReport.status === "SKIPPED", "Halt pipeline with SKIPPED status when condition is unmet");
  assert(
    skipReport.step_results.length === 2,
    "Short-circuit and do NOT execute notify step when condition is false"
  );

  // --------------------------------------------------------------------------
  // TEST 4: Successful Pipeline Execution with Live Fetch & Interpolation
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 4] Full Pipeline Execution (Live Fetch + Condition + Interpolation)...");

  const successPipeline: PipelineSpecification = {
    title: "Example Domain Monitor",
    schedule_cron: "0 9 * * *",
    steps: [
      {
        step_id: 1,
        type: "scrape",
        config: { url: "https://example.com", max_length: 5000 },
      },
      {
        step_id: 2,
        type: "condition",
        config: { field: "step_1.title", operator: "contains", value: "Example" },
      },
      {
        step_id: 3,
        type: "notify",
        config: {
          channel: "telegram",
          message: "🚨 PromptFlow Alert: Scraped '{{step_1.title}}' from {{step_1.url}} ({{step_1.char_count}} chars)!",
        },
      },
    ],
  };

  const destinations = {
    telegram_chat_id: "998877665",
  };

  const successReport = await executePipeline(successPipeline, {
    userDestinations: destinations,
    isTestRun: true,
  });

  assert(successReport.status === "SUCCESS", "Live fetch pipeline succeeds");
  const notifyStep = successReport.step_results.find((s) => s.type === "notify");
  assert(
    notifyStep !== undefined && notifyStep.status === "SUCCESS",
    "Notification step completed successfully"
  );
  assert(
    notifyStep?.output_data?.message?.includes("Example Domain"),
    "Variable interpolation accurately replaced template tokens"
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 ALL END-TO-END ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("❌ SOME TESTS FAILED.");
    process.exit(1);
  }
}

verifyEndToEnd().catch((err) => {
  console.error("Fatal test suite crash:", err);
  process.exit(1);
});
