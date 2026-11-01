# PromptFlow: Autonomous Natural Language Micro-Automation Engine
## Comprehensive Faculty Presentation Deck & Speaker Script (6-Slide Structure)

---

## Slide 1: Title & Project Overview

### Visual Layout & Recommended Assets
* **Background:** Deep obsidian dark mode (`#05070D`) with soft radial ambient glow.
* **Header:** **PromptFlow** (Gradient text `#FFFFFF` $\rightarrow$ `#8E8E93`).
* **Sub-header:** Autonomous Micro-Automation Engine via Natural Language Compilation.
* **Project Details:**
  * **Presenter:** Himanshu Lokhande
  * **Domain:** Artificial Intelligence · Autonomous Web Engineering · Distributed Systems
  * **Repository:** `github.com/ftthimanshuu/PromptFlow`
* **Recommended Screenshot:** High-resolution capture of the **Landing Page Hero Section**, showcasing the translucent Apple glass navbar, floating action pills, and value proposition cards.

### Core Bullet Points
* **Core Paradigm — Hybrid Intelligence:** Combines the flexible semantic understanding of Large Language Models (LLMs) with the rock-solid reliability of deterministic, sandboxed execution runtimes.
* **The Mission:** Eliminating the friction of traditional web scrapers by allowing non-technical and technical users alike to create scheduled automations using conversational plain English.
* **Real-Time Synthesis:** Compiles unstructured natural language prompts into a mathematically validated 4-step execution Domain Specific Language (DSL) in under 2 seconds.
* **Target Audience & Use Cases:** E-commerce price tracking, financial market surveillance, breaking news notifications, regulatory updates, and website availability checks delivered directly to personal chat destinations (Telegram, Discord, Email).

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"Respected faculty members and evaluators, good morning. Today I am proud to present **PromptFlow** — an autonomous micro-automation engine designed to bridge the gap between human natural language intent and deterministic web execution.*
>
> *Every day, millions of users need to monitor information across the internet: tracking price drops on products, watching for breaking regulatory updates, or receiving alerts when stock availability changes. However, existing automation tools are either too complex for ordinary users or too brittle for developers to maintain.*
>
> *PromptFlow solves this through a novel hybrid architecture: we leverage cutting-edge Large Language Models for natural language understanding and semantic extraction, while delegating scheduling, condition evaluation, and network execution to a sandboxed, deterministic runtime. Over the next few minutes, I will demonstrate how our system compiles plain English into a robust 4-step pipeline and executes it live with enterprise-grade security."*

---

## Slide 2: Problem Statement & Existing Limitations

### Visual Layout & Recommended Assets
* **Header:** **The Automation Gap: Fragility, Complexity & Risk**
* **Sub-header:** Why traditional web scraping and RPA tools fail in modern workflows.
* **Recommended Graphic:** Comparison graphic showing a broken CSS selector / Red 500 error stack-trace on the left, contrasted with an everyday user trying to configure complex XPath queries.

### Core Bullet Points
* **1. High Technical Barrier to Entry:**
  * Building custom scrapers requires mastery of Python/Node.js, headless browsers (Playwright, Selenium), and regular expressions.
  * No-code enterprise tools (Zapier, Make.com) impose steep learning curves, rigid node configurations, and aggressive paywalls for basic polling intervals.
* **2. DOM Fragility & Selector Maintenance Fatigue:**
  * Traditional web scrapers depend on hard-coded CSS selectors, XPath strings, or element class hierarchies.
  * When target websites perform routine frontend updates or A/B redesigns, static selectors break silently, causing lost alerts and broken pipelines.
* **3. Severe Security Vulnerabilities (SSRF & Intranet Exploits):**
  * Naive user-defined scraping engines expose servers to **Server-Side Request Forgery (SSRF)**.
  * Attackers can submit malicious URLs pointing to loopback addresses (`127.0.0.1`), cloud metadata endpoints (`169.254.169.254`), or private local area networks (`192.168.0.0/16`), compromising internal infrastructure.
* **4. Lack of Conversational Error Recovery (Ambiguity Problem):**
  * When a user inputs an incomplete prompt (e.g., *"Check price drops and alert me"*), conventional scripts simply crash. They lack the intelligence to detect missing parameters and engage in clarification dialogues.

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"To understand why PromptFlow is necessary, we must examine the fundamental flaws of current web automation.*
>
> *First is **technical inaccessibility**. Non-programmers cannot write Puppeteer or Cheerio scripts. Even experienced developers dread maintaining scrapers because of **DOM fragility**. The moment an e-commerce platform updates its CSS classes or changes a parent `<div>` hierarchy, traditional XPath selectors break silently. Developers spend more time fixing broken selectors than using the actual data.*
>
> *Second is the **security hazard**. Allowing users to specify arbitrary URLs to be fetched by a server opens up severe Server-Side Request Forgery vulnerabilities. Without strict pre-socket inspection, attackers can probe internal cloud infrastructure and AWS metadata services.*
>
> *Finally, existing tools are rigid. If a user omits a critical parameter like a threshold or a URL, traditional systems fail with unhelpful error traces. There is no conversational mechanism to guide the user toward a complete specification. PromptFlow was engineered from the ground up to eradicate all four of these pain points."*

---

## Slide 3: Our Solution — The PromptFlow Paradigm

### Visual Layout & Recommended Assets
* **Header:** **PromptFlow: Natural Language to Deterministic Execution**
* **Sub-header:** Transforming conversational intent into a validated, resilient 4-step pipeline.
* **Recommended Screenshot:** Studio view showing the **Conversational Compiler** chat on the left side and the compiled **4-Step Pipeline Canvas** on the right side.

### Core Bullet Points
* **1. Conversational AI Compiler (Sub-2s Compilation):**
  * Accepts arbitrary natural language prompts and maps them directly into an execution DSL (Domain Specific Language) validated against strict Zod schemas.
* **2. Intelligent Slot-Filling & Dialogue Memory:**
  * If the user's prompt is underspecified, the compiler identifies the missing parameters (e.g., target URL, numerical threshold, or alert frequency) and responds with an intelligent clarification question before generating the workflow.
* **3. Zero-Selector Semantic Extraction:**
  * Eliminates fragile CSS selectors entirely. PromptFlow fetches raw page HTML and passes it to an LLM semantic extraction sandbox with instruction constraints (`expected_fields: ["title", "price"]`), ensuring resilience against frontend redesigns.
* **4. Deterministic Rule & Short-Circuit Engine:**
  * Compares extracted values against mathematical and string operators (`<`, `>`, `==`, `contains`).
  * If the condition is false, the execution halts instantly in a `SKIPPED` state, preventing notification spam and saving compute.
* **5. Multi-Channel Alert Dispatch:**
  * Automatically populates dynamic template variables (e.g., `{{step_2.title}} is now £{{step_2.price}}`) and dispatches notifications via Telegram Bot API, Discord Webhooks, or SMTP Email.

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"Our solution is built on a clear design principle: **Use AI where flexibility is needed, and use deterministic code where reliability is mandatory.**
>
> *When a user interacts with PromptFlow, they simply express their intent in plain conversational English. Our AI compiler analyzes the request. If parameters are missing, it initiates an intelligent slot-filling dialogue. Once the intent is fully articulated, it synthesizes a strict 4-step Domain Specific Language workflow.*
>
> *Look at how resilient the pipeline is: Step 1 fetches the raw page. Step 2 performs **Semantic AI Extraction** — rather than looking for a specific class like `.product-price-v2`, our model understands the context and extracts the price as a clean float. If the website changes its layout tomorrow, PromptFlow continues to work without maintenance.*
>
> *Step 3 runs a deterministic condition check. If a book price is £51 and the user's alert threshold was £40, the condition evaluates to false, and the pipeline gracefully short-circuits. It never sends unnecessary alerts. When the condition is met, Step 4 delivers a formatted alert straight to the user's Telegram or Discord channel."*

---

## Slide 4: Full-Stack Architecture & Engineering Stack

### Visual Layout & Recommended Assets
* **Header:** **System Architecture & Production Tech Stack**
* **Sub-header:** Engineered for low latency, memory safety, and cross-platform fidelity.
* **Recommended Graphic:** Multi-tier architectural diagram showing:
  $$\text{React Vite Client} \iff \text{Express REST API} \iff \text{Groq / Gemini AI} \iff \text{Pre-Socket DNS Firewall} \iff \text{Supabase DB}$$

### Core Bullet Points
* **1. Frontend Presentation Layer:**
  * **React 18 & TypeScript:** Full end-to-end type safety spanning the compiler, execution reports, and dashboard states.
  * **Apple Human Interface Design Language:** Dark glassmorphism (`#05070D` canvas, `rgba(255,255,255,0.07)` card surfaces, `backdrop-filter: blur(28px) saturate(170%)`, and spring pop physics).
  * **Custom Responsive Layout:** Center-aligned adaptive viewports with dedicated non-intrusive internal scroll containers.
* **2. Backend Execution Engine:**
  * **Node.js & Express (TypeScript):** High-throughput asynchronous runtime.
  * **Cheerio & Axios Sandbox:** Low-overhead HTML fetching with realistic user-agent rotation and anti-bot headers.
  * **Node-Cron Scheduler:** Autonomous scheduler maintaining independent recurring cron jobs for active automations.
* **3. Machine Intelligence & LLM Plane:**
  * **Groq Cloud (`llama-3.3-70b-versatile`):** Powers sub-second compilation and structured entity extraction.
  * **Google Gemini API:** Resilient fallback intelligence provider.
* **4. Cloud Data & Security Plane:**
  * **Supabase PostgreSQL & Auth:** Stores automations, user preferences, and chat history with Row-Level Security (RLS).
  * **Pre-Socket DNS Inspection Firewall:** Custom DNS resolver inspecting IP resolutions *before* opening TCP sockets, actively rejecting private subnets, loopbacks, and AWS metadata IPs (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`).

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"Let us examine the architectural foundation that powers PromptFlow. The architecture is deliberately structured into three decoupled layers:
>
> *On the **Frontend**, we built a fluid interface adhering strictly to Apple’s Human Interface Guidelines. We avoided heavy generic UI libraries; every component — from our sliding segmented controls to our ambient glowing step cards and spring celebration modals — was custom engineered using React 18, TypeScript, and Tailwind tokens.*
>
> *On the **Backend**, we run a high-performance Node.js service written in TypeScript. Web scraping is executed via an isolated sandbox with automated user-agent rotation and timeout guards. Scheduled tasks are managed dynamically by an in-memory cron engine linked directly to our database.*
>
> *For the **AI Layer**, latency is critical. We integrate with Groq’s LPU infrastructure running Llama-3.3 70B, which returns compiled pipelines in under 1.5 seconds, backed by Google’s Gemini as an automatic fallback.*
>
> *Finally, regarding **Security**: we implemented a specialized Pre-Socket DNS Firewall. Before any HTTP request leaves our server, the hostname is resolved and verified against private IPv4 and IPv6 CIDR blocks. Any attempt to target internal network services or cloud metadata endpoints is intercepted and neutralized at the socket level."*

---

## Slide 5: Practical Demonstration & Verified Capabilities

### Visual Layout & Recommended Assets
* **Header:** **Live Demonstration Walkthrough & Core Verification**
* **Sub-header:** End-to-end execution evidence across real-world testing scenarios.
* **Recommended Screenshots (Side-by-side):**
  1. **Studio Test Run:** Step cards glowing vivid Apple neon-green (`✓ Success`) with extracted runtime variables (`price: 51.77`, duration: `3007ms`).
  2. **Dashboard Management:** Automation Capacity Bar showing `(4/5 Active)` with card actions (`Run Now`, `Pause`, `Delete`).

### Core Bullet Points
* **Live Test Scenario — E-Commerce Price Drop Watcher:**
  * Target: `books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html`
  * Rule: Check daily at 9:00 AM; alert Telegram if price $< \text{£}60$.
* **Demonstrated Capabilities:**
  * **Sub-2s Compilation:** Instant synthesis of title, cron schedule, and 4 sequential steps.
  * **Sandbox Dry Run:** Real-time extraction of `title: "A Light in the Attic"` and `price: 51.77` with step latency breakdown.
  * **Condition Evaluation:** Mathematical verification ($51.77 < 60 \rightarrow \text{TRUE}$).
  * **Celebratory Modal:** Non-intrusive Apple spring celebration modal confirming activation.
* **Dashboard Lifecycle Management:**
  * **Capacity Governance:** Strict 5-concurrent active automations quota enforced in real-time.
  * **Immediate Execution:** `▶ Run Now` triggers instant background runs with execution logs.
  * **Safe Deletion:** Glass confirmation dialog preventing accidental pipeline removal.
* **Automated Verification Scoreboard:**
  * **9 out of 9 Core System Features PASS (100% Pass Rate)** verified via `node test.js`.
  * **10 out of 10 Automation Types PASS (100% Pass Rate)** verified via `node backend/test.js`.

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"Now, let us walk through the practical demonstration of PromptFlow in action.*
>
> *We provide the system with a real prompt: 'Check books.toscrape.com every morning at 9:00 AM and alert my Telegram when the price is less than 60'. In less than two seconds, the AI compiler produces our 4-step pipeline: Scrape, AI Filter, Condition Check, and Notify.*
>
> *When we trigger 'Run Test', the sandbox executes live. Notice the visual feedback: each step card illuminates with an Apple neon-green glow, confirming a sub-4-second end-to-end execution. Step 2 clearly shows our extracted JSON payload — price 51.77. Step 3 verifies that 51.77 is indeed less than 60.*
>
> *When we activate this pipeline, an Apple spring modal confirms the schedule, and navigating to the Dashboard updates our capacity progress bar to 4 out of 5 active automations. Here, the user has complete lifecycle control: they can pause to free up quota, trigger an instant run on demand, or edit the pipeline in Studio.*
>
> *This is not just a UI mockup — our accompanying test suite validates 9 comprehensive end-to-end integration points and 10 specialized automation types with a 100% pass rate."*

---

## Slide 6: Future Roadmap, Scalability & Conclusion

### Visual Layout & Recommended Assets
* **Header:** **Future Enhancements, Scalability & Conclusion**
* **Sub-header:** Expanding autonomous workflows to enterprise-scale environments.
* **Recommended Graphic:** Visual roadmap timeline showing Phase 1 (Core Engine), Phase 2 (Distributed DAGs & Webhooks), and Phase 3 (Enterprise Ecosystem).

### Core Bullet Points
* **1. Complex Logical Branching (DAGs):**
  * Extending from linear 4-step pipelines to Directed Acyclic Graphs (DAGs) supporting multi-branch conditional trees (`IF / ELSE / SWITCH`).
* **2. Webhook & Event-Driven Triggers:**
  * Augmenting time-based cron scheduling with event-driven incoming webhooks (e.g., GitHub commit pushes, Stripe payment confirmations, Shopify inventory events).
* **3. Distributed Worker Architecture:**
  * Decoupling background execution using Redis and BullMQ job queues to scale horizontally across distributed multi-region worker clusters.
* **4. Expanded Destination Ecosystem:**
  * Native integrations for WhatsApp Business Cloud API, Slack Enterprise, Microsoft Teams, and Notion databases.
* **5. Project Summary & Key Takeaway:**
  * PromptFlow successfully proves that Large Language Models can make complex automation accessible to non-technical users while preserving deterministic execution rigor, enterprise security, and production reliability.

### 🎙️ Extended Speaker Script (What to say to the faculty)
> *"To conclude, PromptFlow represents a significant step forward in autonomous computing.*
>
> *Looking ahead, our architectural roadmap includes transitioning from linear pipelines to full Directed Acyclic Graphs, allowing users to build complex branching logic such as 'If price is below 60 notify Telegram, else if below 80 notify Discord, otherwise log to Notion'.*
>
> *We also plan to add event-driven webhook listeners alongside our existing cron scheduler, and scale our background executor horizontally using Redis and worker pools to handle thousands of concurrent automations.*
>
> *In summary, PromptFlow bridges accessibility and reliability. It demonstrates how modern generative AI can eliminate technical friction without sacrificing deterministic correctness or security.*
>
> *Thank you for your time and consideration. I would now be delighted to answer any questions from the faculty."*
