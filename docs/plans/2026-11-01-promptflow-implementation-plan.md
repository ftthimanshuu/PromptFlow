# PromptFlow: End-to-End Implementation Plan

> **Project Reference**: `promptflow_project_specification.md`  
> **Tech Stack**: React 18 + Vite + Tailwind CSS (Frontend), FastAPI + Python 3.11+ (Backend), PostgreSQL 15 + Supabase Auth & Realtime (BaaS), Google Gemini 1.5/2.0 Flash (AI Compiler & Extractor), APScheduler (Cron Engine), Telegram Bot & Discord Webhooks (Alerts).  
> **Target Operating Budget**: ₹0 (100% Free Tier).

---

## Architecture Overview

PromptFlow is composed of three cleanly decoupled layers:
1. **Frontend Client (`frontend/`)**: React (Vite) + Tailwind CSS + Lucide Icons. Features a split-view dashboard: conversational multi-turn chat panel on the left, and a linear, interactive pipeline visualizer on the right with real-time execution telemetry.
2. **Backend Engine (`backend/`)**: FastAPI async server running:
   - Natural Language Prompt Compiler (Gemini Flash + Pydantic schema validation).
   - Async Web Scraper (HTTPX + BeautifulSoup4 + SSRF defense).
   - Semantic AI Extractor (In-pipeline structured extraction).
   - Deterministic Condition Evaluator (`==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`).
   - Dynamic Variable Template Engine (`{{step_X.field}}`).
   - Alert Dispatcher (Telegram Bot API & Discord Webhook client).
   - Background Cron Engine (APScheduler with Supabase DB sync).
3. **Database & Auth (`supabase/`)**: Supabase PostgreSQL with Row-Level Security (RLS), real-time change data capture (`postgres_changes`), automated profile provisioning triggers, and a strict 5-active-automation quota enforcement trigger.

---

## File & Directory Structure

```
PromptFlow/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entrypoint, CORS, route registration
│   │   ├── config.py                   # Environment settings & secrets via pydantic-settings
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── compiler.py             # Natural language prompt -> Pipeline DSL compiler
│   │   │   ├── scraper.py              # Async HTTPX scraper with SSRF protection & HTML cleaner
│   │   │   ├── extractor.py            # Gemini semantic structured extractor
│   │   │   ├── evaluator.py            # Safe deterministic condition comparison engine
│   │   │   ├── template.py             # {{step_X.field}} regex variable interpolator
│   │   │   ├── notifier.py             # Telegram and Discord alert dispatchers
│   │   │   ├── executor.py             # Pipeline execution orchestrator & context manager
│   │   │   └── scheduler.py            # APScheduler cron daemon & job sync with Supabase
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── supabase.py             # Supabase admin client (service_role) & user client
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── dsl.py                  # Pydantic schemas for Step, Pipeline, and Configs
│   │   │   └── api.py                  # Request/Response schemas for FastAPI endpoints
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── compile.py              # POST /api/compile (Natural language compiler & chat)
│   │       ├── execute.py              # POST /api/execute/test (Sandbox test run)
│   │       ├── automations.py          # GET, POST, PUT, DELETE /api/automations
│   │       └── health.py               # GET /api/health
│   ├── tests/
│   │   ├── test_scraper.py             # SSRF & HTML cleaning unit tests
│   │   ├── test_evaluator.py           # Condition engine tests
│   │   ├── test_template.py            # Variable interpolation tests
│   │   ├── test_compiler.py            # Gemini compiler schema tests
│   │   └── test_executor.py            # End-to-end sandbox execution tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                     # Main layout & router
│   │   ├── types/
│   │   │   ├── pipeline.ts             # TypeScript definitions for DSL & execution states
│   │   │   └── database.ts             # Supabase table definitions
│   │   ├── lib/
│   │   │   └── supabase.ts             # Supabase client initialization
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # User authentication & session provider
│   │   │   └── AutomationContext.tsx   # Active draft pipeline & execution state
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx          # Brand, quota badge (X/5), profile settings modal
│   │   │   │   └── ProfileModal.tsx    # Telegram Chat ID & Discord Webhook setup
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx       # Conversational prompt input & multi-turn history
│   │   │   │   ├── MessageList.tsx     # Message bubbles (user vs model)
│   │   │   │   └── PromptSuggestions.tsx # One-click starter prompts
│   │   │   ├── visualizer/
│   │   │   │   ├── PipelineVisualizer.tsx # Linear step cards container & action buttons
│   │   │   │   ├── StepCard.tsx        # Individual step card with status badges & pulses
│   │   │   │   └── StepDrawer.tsx      # Inline parameter editor for slot-filling
│   │   │   │   └── ExecutionLogsModal.tsx # Detailed step-by-step audit log viewer
│   │   │   └── dashboard/
│   │   │       └── AutomationList.tsx  # User automations list with toggle switches
│   │   └── services/
│   │       └── api.ts                  # Axios/fetch calls to FastAPI backend
│   └── .env.example
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql       # Core tables, extensions, & RLS policies
│       ├── 02_auth_trigger.sql         # Auto-provision profile on auth.users insert
│       └── 03_quota_trigger.sql        # 5 active automations trigger
└── README.md
```

---

## Detailed Task Breakdown

### Phase 1: Database & Supabase Infrastructure
- [ ] **Task 1.1: Database Schema & Migration Setup**
  - Create `supabase/migrations/01_initial_schema.sql` with tables: `profiles`, `automations`, `execution_logs`, `chat_history`.
  - Configure UUID extensions and foreign keys.
- [ ] **Task 1.2: User Provisioning Trigger**
  - Create `supabase/migrations/02_auth_trigger.sql` attaching an `AFTER INSERT` trigger on `auth.users` to automatically populate `public.profiles(id, email)`.
- [ ] **Task 1.3: Quota Enforcement & RLS Policies**
  - Implement `check_active_automation_limit` trigger function enforcing maximum 5 active automations per `user_id`.
  - Configure Row Level Security (RLS) for tenant isolation on all tables.
  - Add service-role policy / documentation for backend daemon access.

---

### Phase 2: Python Backend Foundation & Core Execution Engine
- [ ] **Task 2.1: Project Setup & Pydantic DSL Models**
  - Initialize `backend/` with `requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `httpx`, `beautifulsoup4`, `google-genai`, `apscheduler`, `supabase`, `pytest`).
  - Create `backend/app/models/dsl.py` defining:
    - `ScrapeConfig`, `AIFilterConfig`, `ConditionConfig`, `NotifyConfig`.
    - `StepDefinition` (`step_id`, `type`, `config`, `status`).
    - `PipelineSpecification` (`title`, `schedule_cron`, `steps`).
    - Standardized step execution outputs: `StepResult(step_id, status, output_data, error)`.
- [ ] **Task 2.2: Web Scraper with SSRF Defense & HTML Cleaner**
  - Create `backend/app/core/scraper.py`:
    - DNS resolution check ensuring host does not resolve to private IPs (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`).
    - Protocol enforcement (only `http` and `https`).
    - HTTPX async fetch with 10-second timeout and custom User-Agent.
    - BeautifulSoup4 parser removing `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<svg>`.
    - Whitespace normalization and bounded text extraction (max 5,000–10,000 chars).
  - Create unit tests in `backend/tests/test_scraper.py`.
- [ ] **Task 2.3: Deterministic Condition Evaluator**
  - Create `backend/app/core/evaluator.py`:
    - Safe evaluation for operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`.
    - Dot-notation path resolution (e.g., `step_2.found` -> `execution_context["step_2"]["found"]`).
    - Strict type-coercion handling (numbers, booleans, string trimming).
  - Create unit tests in `backend/tests/test_evaluator.py`.
- [ ] **Task 2.4: Template Variable Interpolator**
  - Create `backend/app/core/template.py`:
    - Regex pattern: `r"\{\{(step_\d+)\.([a-zA-Z0-9_]+)\}\}"`.
    - Replace tokens with dynamic runtime values from `execution_context`.
    - Graceful fallback for missing tokens (`[N/A]`).
  - Create unit tests in `backend/tests/test_template.py`.
- [ ] **Task 2.5: Alert Notification Dispatcher**
  - Create `backend/app/core/notifier.py`:
    - Telegram Bot API client: `https://api.telegram.org/bot{TOKEN}/sendMessage`.
    - Discord Webhook client: POST payload `{"content": message}`.
    - Format and markdown escaping support.
- [ ] **Task 2.6: AI Extractor & Semantic Filter**
  - Create `backend/app/core/extractor.py`:
    - Google Gemini Flash structured inference (`response_mime_type: "application/json"`).
    - Dynamic JSON schema generation based on `expected_fields`.
    - Context injection using clean webpage text and instruction.

---

### Phase 3: AI Prompt Compiler & Pipeline Orchestration
- [ ] **Task 3.1: Natural Language Prompt Compiler**
  - Create `backend/app/core/compiler.py`:
    - Gemini system instructions for translating user goals into `PipelineSpecification`.
    - Multi-turn conversational session context management from `chat_history`.
    - Incomplete parameter detection and conversational clarification questions (slot-filling).
- [ ] **Task 3.2: Pipeline Execution Orchestrator**
  - Create `backend/app/core/executor.py`:
    - Coordinates execution flow: `scrape` -> `ai_filter` -> `condition` -> `notify`.
    - Maintains uniform dictionary-based `execution_context`.
    - Short-circuits with `SKIPPED` status when a condition evaluates to `False`.
    - Updates `execution_logs` in Supabase with step-level timings and status.

---

### Phase 4: Scheduling & REST API Layer
- [ ] **Task 4.1: Background Scheduler Daemon**
  - Create `backend/app/core/scheduler.py`:
    - APScheduler `AsyncIOScheduler` instance.
    - Startup routine fetching all `is_active = true` automations from Supabase.
    - Dynamic cron job registration and cancellation on automation updates/deletions.
    - Minimum execution interval protection (enforcing >= 15 minutes).
- [ ] **Task 4.2: FastAPI Endpoints**
  - Create `backend/app/api/`:
    - `POST /api/compile`: Accepts prompt + `session_id`, returns compiled pipeline JSON or clarification question.
    - `POST /api/execute/test`: Executes pipeline in dry-run/sandbox mode, returning real-time step outputs.
    - `POST /api/automations/sync`: Reschedules active automations in APScheduler.
    - `GET /api/health`: Health status endpoint.
  - Implement CORS and authentication middleware.

---

### Phase 5: React Frontend Application
- [ ] **Task 5.1: Frontend Scaffolding & Setup**
  - Initialize Vite React + TypeScript project with Tailwind CSS and Lucide Icons.
  - Configure Supabase client and Auth context (login, signup, session persistence).
- [ ] **Task 5.2: Header & Profile Management**
  - Create `Navbar.tsx` displaying:
    - App branding.
    - Quota indicator pill (e.g. `2/5 Automations Active`).
    - User email & profile settings button.
  - Create `ProfileModal.tsx` for configuring Telegram Chat ID (with simple 3-step setup guide) and Discord Webhook URL.
- [ ] **Task 5.3: Conversational Chat Panel (Left Pane)**
  - Create `ChatPanel.tsx` with:
    - Multi-turn conversation display.
    - Quick-start starter prompts ("Notice Board Monitor", "Price Drop Alert", "Blog Post Tracker").
    - "Reset Chat / New Automation" action button.
    - Real-time compilation loading states.
- [ ] **Task 5.4: Linear Pipeline Visualizer (Right Pane)**
  - Create `PipelineVisualizer.tsx` rendering stacked linear cards:
    - `Fetch Website` (`scrape`).
    - `Extract Data with AI` (`ai_filter`).
    - `Evaluate Condition` (`condition`).
    - `Send Notification` (`notify`).
  - Implement visual status states: `Draft`, `Configured`, `Pulsing Yellow (Running)`, `Green (Success)`, `Red (Failed)`, `Grey (Skipped)`.
  - Add missing field warnings (`⚠️ Missing Target URL`) with click-to-edit step drawer.
- [ ] **Task 5.5: Sandbox Test Run & Save Flow**
  - Implement `[▶ Test Run]` button triggering live step-by-step visual execution feedback.
  - Implement `[Save & Activate]` committing the pipeline to Supabase `automations` table.
- [ ] **Task 5.6: Automations Management & Execution Log Viewer**
  - Create dashboard view/tab listing user's saved automations.
  - Instant toggle switch for `is_active` (handling database quota error with friendly toast notification).
  - `ExecutionLogsModal.tsx` showing past run timestamp, status, error details, and step outputs.

---

### Phase 6: End-to-End Testing & Verification
- [ ] **Task 6.1: End-to-End Walkthrough Verification**
  - Run the University Notice Board scenario:
    - User prompt -> Gemini compiles pipeline -> Missing slot detection -> Test Run -> Real-time status pulse -> Push alert dispatched to Telegram/Discord -> Saved to DB.
- [ ] **Task 6.2: Security & Edge Case Verification**
  - Test SSRF protection against `http://127.0.0.1` and `http://169.254.169.254`.
  - Test 5-automation quota enforcement trigger.
  - Test website failure / timeout handling and `SKIPPED` condition evaluation.

