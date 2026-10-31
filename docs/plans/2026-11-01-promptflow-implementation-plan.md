# PromptFlow: Implementation Plan (Node.js + TypeScript Edition)

> **Goal**: Build an AI-first, prompt-driven autonomous micro-automation platform where users can describe any day-to-day web monitoring task in plain English (e.g., job alerts, price watchers, notice board monitors, release trackers) and get an executable, scheduled pipeline with zero manual configuration.  
> **Tech Stack**: 
> - **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
> - **Backend**: Node.js + Express + TypeScript
> - **BaaS / Database**: Supabase (PostgreSQL 15, Auth, JSONB, Realtime)
> - **AI Engine**: Google Gemini 1.5/2.0 Flash (`@google/genai`)
> - **Scraping**: `axios` + `cheerio` (Fast async HTML fetching + DOM sanitization)
> - **Validation**: `zod` (Strict DSL parsing and runtime type safety)
> - **Scheduler**: `node-cron` (In-process cron manager)
> - **Alert Channels**: Telegram Bot API + Discord Webhooks
> - **Operating Budget**: ₹0 (100% Free-Tier Architecture)

---

## Architecture & Project Structure

```
PromptFlow/
├── backend/                            # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts                    # Express entrypoint, middleware, routes, scheduler startup
│   │   ├── config.ts                   # Environment variables (dotenv + zod validation)
│   │   ├── types/
│   │   │   └── dsl.ts                  # TypeScript types & Zod schemas for Step & Pipeline DSL
│   │   ├── core/
│   │   │   ├── compiler.ts             # Gemini-powered natural language prompt -> Pipeline DSL
│   │   │   ├── scraper.ts              # SSRF-protected async web scraper + HTML text cleaner
│   │   │   ├── extractor.ts            # Gemini semantic structured key-value extractor
│   │   │   ├── evaluator.ts            # Safe deterministic operator evaluation (==, !=, >, <, contains)
│   │   │   ├── template.ts             # Variable interpolation engine ({{step_X.field}})
│   │   │   ├── notifier.ts             # Telegram and Discord alert dispatcher
│   │   │   ├── executor.ts             # End-to-end pipeline execution orchestrator
│   │   │   └── scheduler.ts            # node-cron scheduler synced with Supabase
│   │   ├── db/
│   │   │   └── supabase.ts             # Supabase service-role client & helpers
│   │   └── routes/
│   │       ├── compile.routes.ts       # POST /api/compile (Natural language chat & compile)
│   │       ├── execute.routes.ts       # POST /api/execute/test (Sandbox test run)
│   │       ├── automations.routes.ts   # CRUD /api/automations & active toggle
│   │       └── health.routes.ts        # GET /api/health
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                           # React + Vite + Tailwind CSS + TypeScript
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                     # Layout & view switcher (Studio vs Dashboard)
│   │   ├── types/
│   │   │   └── pipeline.ts             # Shared DSL interfaces & execution states
│   │   ├── lib/
│   │   │   ├── supabase.ts             # Supabase client (Auth + Realtime)
│   │   │   └── api.ts                  # Axios client for backend endpoints
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # User session & profile context
│   │   │   └── AutomationContext.tsx   # Active draft pipeline & execution state
│   │   └── components/
│   │       ├── layout/
│   │       │   ├── Navbar.tsx          # Brand, quota badge (X/5 Active), profile settings
│   │       │   └── ProfileModal.tsx    # Telegram Chat ID & Discord Webhook setup guide
│   │       ├── chat/
│   │       │   ├── ChatPanel.tsx       # Multi-turn chat interface
│   │       │   ├── MessageList.tsx     # Chat bubbles
│   │       │   └── PromptSuggestions.tsx # Everyday use-case chips (Jobs, Prices, Notices, News)
│   │       ├── visualizer/
│   │       │   ├── PipelineVisualizer.tsx # Linear step cards container & action buttons
│   │       │   ├── StepCard.tsx        # Card with status badge (Draft, Running, Success, Skipped)
│   │       │   ├── StepDrawer.tsx      # Inline parameter editor for slot-filling
│   │       │   └── ExecutionLogsModal.tsx # Step-by-step audit logs
│   │       └── dashboard/
│   │           └── AutomationList.tsx  # User automations list with toggle switches
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql       # Tables (profiles, automations, logs, chat_history) + RLS
│       ├── 02_auth_trigger.sql         # Auto-provision profile on auth.users signup
│       └── 03_quota_trigger.sql        # Enforce max 5 active automations per user
└── promptflow_project_specification.md
```

---

## Generalized Prompt-to-DSL Philosophy

Rather than hardcoding academic notice board patterns, the compiler prompt instructions will train Gemini to analyze **any user intention**:
1. **Source Discovery**: Target URL or resource to monitor.
2. **Extraction Intent**: What key fields should be extracted (e.g. `price`, `status`, `title`, `available`, `date`, `found`).
3. **Condition Logic**: What condition constitutes a meaningful event worth alerting for (`price < target`, `found == true`, `status != 'Closed'`).
4. **Action Template**: Human-friendly message format injecting the extracted variables.
5. **Schedule**: Frequency (e.g., daily at 9 AM, every 4 hours, hourly).
6. **Slot-Filling Clarification**: If the prompt is incomplete (e.g. "Watch iPhone price on Amazon"), Gemini drafts what it can, sets missing fields to `null`, and returns a polite question asking for the specific product URL and price target.

---

## Step-by-Step Task Breakdown

### Phase 1: Database Setup & Supabase Migrations
- [ ] **Task 1.1: Core Tables & RLS Migration** (`supabase/migrations/01_initial_schema.sql`)
  - Create `profiles`, `automations`, `execution_logs`, and `chat_history`.
  - Enable Row Level Security (RLS) on all tables with tenant isolation policies.
- [ ] **Task 1.2: User Signup Trigger** (`supabase/migrations/02_auth_trigger.sql`)
  - PostgreSQL function and trigger to automatically create a row in `public.profiles` when a user signs up.
- [ ] **Task 1.3: Quota Enforcement Trigger** (`supabase/migrations/03_quota_trigger.sql`)
  - PostgreSQL trigger `check_active_automation_limit` preventing more than 5 active automations per account.

---

### Phase 2: Node.js + Express Backend Foundation & Core Execution Engine
- [ ] **Task 2.1: Backend Project Scaffolding & Configuration**
  - Initialize `backend/` with `package.json`, `tsconfig.json`, Express, CORS, dotenv, and Zod.
  - Create `backend/src/config.ts` validating environment variables (Supabase URL, Service Key, Gemini API Key, Telegram Bot Token).
- [ ] **Task 2.2: DSL Zod Schemas & Types** (`backend/src/types/dsl.ts`)
  - Define Zod schemas and TypeScript interfaces for:
    - Step types: `scrape`, `ai_filter`, `condition`, `notify`.
    - `StepDefinition` and `PipelineSpecification`.
    - Standardized `StepResult` with structured output dictionary.
- [ ] **Task 2.3: SSRF-Protected Web Scraper & HTML Cleaner** (`backend/src/core/scraper.ts`)
  - DNS resolution check blocking loopback (`127.0.0.1`), link-local (`169.254.169.254`), and RFC1918 private subnets.
  - Async HTTP fetch with timeout and custom browser User-Agent.
  - Cheerio parser stripping `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<svg>`.
  - Whitespace normalization and bounded text extraction (max 10,000 characters).
- [ ] **Task 2.4: Deterministic Condition Evaluator** (`backend/src/core/evaluator.ts`)
  - Safe evaluation of operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`.
  - Dot-notation resolver (`step_2.found` $\rightarrow$ `context.step_2.found`).
- [ ] **Task 2.5: Variable Interpolation Template Engine** (`backend/src/core/template.ts`)
  - Dynamic token replacement for `{{step_X.field}}` with runtime context values and safe fallback.
- [ ] **Task 2.6: Telegram & Discord Notifier** (`backend/src/core/notifier.ts`)
  - Direct HTTP calls to Telegram Bot API `/sendMessage` and Discord Incoming Webhooks.
- [ ] **Task 2.7: Gemini Semantic Structured Extractor** (`backend/src/core/extractor.ts`)
  - Calls Gemini Flash with strict JSON schema mode based on `expected_fields`.

---

### Phase 3: AI Prompt Compiler & Execution Orchestrator
- [ ] **Task 3.1: Natural Language Prompt Compiler** (`backend/src/core/compiler.ts`)
  - Generalized Gemini prompt translating any day-to-day request into `PipelineSpecification`.
  - Multi-turn conversation handling using `chat_history`.
  - Slot-filling detection: returns structured response with either a complete pipeline or friendly clarification question.
- [ ] **Task 3.2: Pipeline Execution Orchestrator** (`backend/src/core/executor.ts`)
  - Sequences execution: `scrape` $\rightarrow$ `ai_filter` $\rightarrow$ `condition` $\rightarrow$ `notify`.
  - Handles `SKIPPED` execution state when condition evaluates to false.
  - Persists execution runs in Supabase `execution_logs`.

---

### Phase 4: Cron Scheduler & API Endpoints
- [ ] **Task 4.1: node-cron Scheduler Daemon** (`backend/src/core/scheduler.ts`)
  - Loads active automations on boot and registers cron triggers.
  - Provides dynamic reload/reschedule functions when automations are created, updated, or toggled.
- [ ] **Task 4.2: Express REST API Routes** (`backend/src/routes/`)
  - `POST /api/compile`: Conversational prompt compiler.
  - `POST /api/execute/test`: Sandbox test run with live step outputs.
  - `GET/POST/PUT/DELETE /api/automations`: Automation management & active status toggle.
  - `GET /api/health`: Service health check.

---

### Phase 5: React Frontend Client
- [ ] **Task 5.1: Vite + React + Tailwind Scaffolding**
  - Initialize `frontend/` with Tailwind CSS, Lucide Icons, and Supabase client.
- [ ] **Task 5.2: Authentication & Profile Setup**
  - Supabase Auth provider with Login / Signup modal.
  - Navbar with Quota Badge (`X/5 Active Automations`) and Profile Modal for Telegram / Discord setup.
- [ ] **Task 5.3: Conversational Chat Panel (Left Pane)**
  - Chat history bubbles with instant prompt suggestion chips:
    - *"Monitor website for keyword"*
    - *"Track product price drop"*
    - *"Alert if job posting appears"*
    - *"Daily morning news/weather alert"*
  - "New Automation / Reset Chat" button.
- [ ] **Task 5.4: Linear Pipeline Visualizer (Right Pane)**
  - Stacked linear cards: Scrape $\rightarrow$ AI Filter $\rightarrow$ Condition $\rightarrow$ Notify.
  - Visual status badges: `Draft`, `Configured`, `Running (Pulsing Yellow)`, `Success (Green)`, `Skipped (Grey)`.
  - Missing field alert badges (`⚠️ Missing Target URL`) with click-to-edit drawer.
- [ ] **Task 5.5: Sandbox Test Run & Save Flow**
  - `[▶ Test Run]` button with live visual step progress.
  - `[Save & Activate]` committing to Supabase with instant active toggle.
- [ ] **Task 5.6: Automations Dashboard View**
  - Tab to switch between "Studio (Builder)" and "My Automations".
  - List of active/inactive automations with toggle switches and Execution Log history modal.

---

### Phase 6: Verification & Testing
- [ ] **Task 6.1: Diverse Use-Case Testing**
  - Test 1: Price drop monitoring prompt.
  - Test 2: University / portal announcement monitor.
  - Test 3: Tech release / blog monitor.
  - Test 4: Incomplete prompt testing slot-filling dialogue.
- [ ] **Task 6.2: Security & Quota Verification**
  - SSRF test on local/private addresses.
  - 5-automation limit enforcement trigger test.
