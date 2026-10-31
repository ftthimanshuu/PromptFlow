# PromptFlow: Complete Technical Specification Document (v1.0)
**A Prompt-Driven Autonomous Micro-Automation and Real-Time Web-Monitoring Platform**

---

## 1. Project Overview & System Metadata

* **Project Name**: PromptFlow
* **Formal Title**: A Prompt-Driven Autonomous Micro-Automation and Real-Time Web-Monitoring Platform
* **Architecture Style**: Decoupled Event-Driven Micro-Architecture (SPA Frontend + Cloud BaaS + Async Python Execution Engine)
* **Target Audience**: Non-programmers, students, developers, and small business operators needing lightweight daily web-monitoring, data extraction, and mobile alerting without writing code or building manual node graphs.
* **Operating Budget**: ₹0 (100% Free-Tier Architecture — Zero Paid APIs or Cloud Subscriptions)

---

## 2. Problem Statement & Functional Objectives

### 2.1 Problem Analysis
Commercial workflow automation tools (e.g., Zapier, Make.com, n8n) are fundamentally built for technical operators:
1. **Manual Node Configuration**: Users must manually select triggers, configure HTTP webhooks, map nested JSON payloads, write regex, and configure conditional branches.
2. **Strict API Dependency**: Existing tools fail when a user wants to monitor a simple website, university notice board, or blog that lacks an official public REST API.
3. **High Cognitive & Financial Friction**: 2D node graphs (visual programming) overwhelm non-technical users, and commercial SaaS tools enforce aggressive monthly subscription paywalls on simple multi-step automations.

### 2.2 Functional Objectives
PromptFlow replaces manual configuration with an **AI-First Conversational Interface**:
* **Natural Language Pipeline Compilation**: Users state goals in plain English; an LLM compiles the prompt into a structured, executable JSON Domain-Specific Language (DSL).
* **Linear Step Visualization**: Renders workflows as stacked, intuitive step cards (Fetch $\rightarrow$ AI Extraction $\rightarrow$ Condition $\rightarrow$ Alert) rather than a fragile 2D canvas.
* **Semantic Web Extraction (No-API Scraping)**: Uses asynchronous HTTP fetching combined with LLM semantic reasoning to extract structured data from raw HTML without brittle CSS selectors.
* **Zero-Cost Push Alerts**: Delivers notifications directly to mobile devices via free Telegram Bot API and Discord Webhooks.
* **Resource Governance**: Enforces a strict quota of up to **5 active automations per user account** with instant toggle activation and audit logging.

---

## 3. System Architecture & End-to-End Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (SPA)                           │
│  React (Vite) + Tailwind CSS • Deployed on Vercel                      │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ Conversational Chat Panel    │    │ Linear Pipeline Visualizer   │  │
│  │ (Multi-turn session memory)  │    │ (Live pulsing status cards)  │  │
│  └──────────────┬───────────────┘    └──────────────▲───────────────┘  │
│                 │                                   │                  │
│                 │                                   │ Realtime updates │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │ HTTPS REST                        │ WebSockets
                  ▼                                   │
┌─────────────────────────────────────────────────────┴──────────────────┐
│                     SUPABASE CLOUD PLATFORM                            │
│                                                                        │
│  • Supabase Auth: User identity, email verification, session JWTs      │
│  • PostgreSQL DB: JSONB pipeline definitions, run logs, chat history   │
│  • Row-Level Security (RLS): Strict tenant isolation per user_id       │
│  • Quota Trigger: Enforces maximum 5 active automations per account    │
│  • Realtime Engine: Broadcasts PostgreSQL changes to React UI          │
└─────────────────┬──────────────────────────────────────────────────────┘
                  │ REST / Webhooks
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│               PYTHON EXECUTION ENGINE (FastAPI Runtime)                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Prompt Compiler (Gemini 1.5 Flash + Pydantic JSON validation) │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 2. Asynchronous Web Scraper (HTTPX + BeautifulSoup4 + Text Norm) │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 3. Semantic AI Extractor (In-pipeline LLM structured inference)  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 4. Deterministic Evaluator (Safe operator comparisons)           │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 5. Template Engine (Dynamic {{step.field}} variable injection)   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 6. Background Scheduler (APScheduler cron daemon)                │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 7. Alert Dispatcher (Telegram Bot API & Discord Webhook client)  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 100% Free Technology Stack

| Layer | Technology | Specification / Configuration | Cost / Free Tier |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Single Page Application (SPA), TypeScript/JavaScript | 100% Free / Open Source |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Responsive modern design, dark/light themes | 100% Free / Open Source |
| **Hosting (Client)** | Vercel | Global Edge CDN with continuous deployment | Free Hobby Plan |
| **Authentication** | Supabase Auth | Email & Password, JWT verification, session refresh | Free Tier included |
| **Database** | PostgreSQL 15 (Supabase) | Relational tables with native JSONB column support | Free Tier (500 MB storage) |
| **Live UI Sync** | Supabase Realtime | WebSocket-based change data capture (`postgres_changes`) | Free Tier included |
| **Backend Runtime** | Python 3.11 + FastAPI | Async ASGI server (Uvicorn), Pydantic validation | 100% Free / Open Source |
| **AI / LLM Engine** | Google Gemini 1.5 Flash | Structured JSON mode, 1M context window | 100% Free (15 RPM via AI Studio) |
| **Web Scraping** | HTTPX + BeautifulSoup4 | Asynchronous HTTP client with connection pooling | 100% Free / Open Source |
| **Background Cron** | APScheduler | In-process asynchronous cron and interval job runner | 100% Free / Open Source |
| **Alert Channels** | Telegram Bot API / Discord | Telegram bot via `@BotFather`, Discord incoming webhooks | 100% Free forever |

---

## 5. Complete Database Schema & Data Dictionary

All tables are implemented in PostgreSQL on Supabase with strict Row-Level Security (RLS) enabled.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  telegram_chat_id text,
  discord_webhook_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- 2. AUTOMATIONS TABLE (Stores compiled pipeline JSON)
-- ============================================================================
create table public.automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  schedule_cron text default '0 9 * * *', -- Default: Daily at 9:00 AM UTC
  steps jsonb not null,                    -- Array of compiled step definitions
  is_active boolean default true,
  last_run_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- 3. QUOTA ENFORCEMENT: Max 5 Active Automations per User Account
-- ============================================================================
create or replace function check_active_automation_limit()
returns trigger as $$
declare
  active_count integer;
begin
  if new.is_active = true then
    select count(*) into active_count
    from public.automations
    where user_id = new.user_id 
      and is_active = true 
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if active_count >= 5 then
      raise exception 'Account Quota Exceeded: You cannot have more than 5 active automations. Please deactivate an existing automation.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_automation_quota
before insert or update on public.automations
for each row execute function check_active_automation_limit();

-- ============================================================================
-- 4. EXECUTION LOGS TABLE (Run history and step-level audit)
-- ============================================================================
create table public.execution_logs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) on delete cascade not null,
  status text check (status in ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED')) default 'PENDING',
  step_results jsonb default '[]'::jsonb, -- Array of execution outputs per step
  error_message text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- ============================================================================
-- 5. CHAT HISTORY TABLE (Multi-turn session memory)
-- ============================================================================
create table public.chat_history (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('user', 'model')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- 6. SECURITY: Row-Level Security (RLS) Policies
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.automations enable row level security;
alter table public.execution_logs enable row level security;
alter table public.chat_history enable row level security;

-- Profiles: Users can only read/update their own profile
create policy "Users manage own profile" 
  on public.profiles for all using (auth.uid() = id);

-- Automations: Users can only view, insert, update, or delete their own automations
create policy "Users manage own automations" 
  on public.automations for all using (auth.uid() = user_id);

-- Execution Logs: Users can only view logs of automations they own
create policy "Users view own logs" 
  on public.execution_logs for select 
  using (exists (
    select 1 from public.automations 
    where automations.id = execution_logs.automation_id 
      and automations.user_id = auth.uid()
  ));

-- Chat History: Users can only view and append their own chat messages
create policy "Users manage own chat" 
  on public.chat_history for all using (auth.uid() = user_id);
```

---

## 6. The Pipeline Step Domain-Specific Language (DSL)

Every automation pipeline is compiled into a deterministic JSON schema containing an array of steps. The engine supports four core step types:

### 6.1 Step Type 1: `scrape`
Fetches raw public website content asynchronously without headless browser overhead.
* **Configuration Parameters**:
  * `url` (string, required): Full target web URL (`https://...`).
  * `max_length` (integer, optional): Maximum characters of extracted text to process (default: 5,000).

### 6.2 Step Type 2: `ai_filter`
Analyzes raw webpage text using Gemini 1.5 Flash to extract structured key-value pairs semantically.
* **Configuration Parameters**:
  * `instruction` (string, required): Precise extraction prompt (e.g., *"Extract the 7th sem exam timetable title and download link"*).
  * `expected_fields` (array of strings, required): Key names the model must output (e.g., `["found", "title", "link"]`).

### 6.3 Step Type 3: `condition`
Performs deterministic evaluation to determine if the pipeline should proceed or halt.
* **Configuration Parameters**:
  * `field` (string, required): JSON path reference to preceding step output (e.g., `step_2.found`).
  * `operator` (string, required): Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`.
  * `value` (primitive, required): Comparison target (boolean, number, or string).

### 6.4 Step Type 4: `notify`
Constructs and dispatches the final alert to the user's mobile device or desktop.
* **Configuration Parameters**:
  * `channel` (string, required): `'telegram'` or `'discord'`.
  * `message` (string, required): Text template supporting variable interpolation syntax `{{step_X.field}}`.

---

## 7. Natural Language Compiler & Conversational Slot-Filling

### 7.1 Compiler System Instructions
The FastAPI backend interfaces with Google Gemini 1.5 Flash using strict JSON mode (`response_mime_type: "application/json"`). The prompt specification is structured as follows:

```text
You are the PromptFlow Compiler. Your responsibility is to translate user natural language requests into an executable automation pipeline JSON object.

Strict Rules:
1. Output MUST be valid JSON conforming to the PipelineSpecification.
2. Supported step types are ONLY: "scrape", "ai_filter", "condition", "notify".
3. If essential parameters (such as the website URL or alert threshold) are missing or ambiguous, output status "incomplete", leave the missing field null, and supply a friendly clarification question in the "question" field.
4. Default assumptions: If frequency is omitted, default schedule_cron to "0 9 * * *" (daily at 9 AM). If alert destination is omitted, default to "telegram".
```

### 7.2 Multi-Turn Memory Architecture
1. **Stateless API Handling**: Because Gemini API is stateless, PromptFlow persists all user and assistant turns in the `chat_history` table keyed by `session_id`.
2. **Context Reconstruction**: On every incoming prompt, FastAPI retrieves previous messages for that session in chronological order and loads them via `model.start_chat(history=...)`.
3. **Session Resetting**: When the user clicks **"New Automation / Reset Chat"**, the frontend generates a fresh UUID for `session_id`. Past conversations remain archived in PostgreSQL.

### 7.3 Missing Parameter Resolution (Slot-Filling)
* **Conversational Fallback**: When an incomplete prompt is submitted (e.g., *"Alert me if laptop price drops"*), the assistant responds directly in chat:
  > *"I have drafted your laptop price watcher. What is the product URL, and at what price threshold should I alert you?"*
* **Visual Card Status**: The corresponding step card on the frontend lights up with a yellow warning badge (`⚠️ Missing Target URL`).
* **Dual Resolution**: The user can either type the missing details in chat or click the card to open an inline property drawer and input the value directly.

---

## 8. Backend Execution Engine Mechanics

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STEP EXECUTION PIPELINE                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. INITIALIZATION                                                      │
│    • Load automation definition from Supabase                          │
│    • Initialize empty in-memory context: execution_context = {}         │
│    • Create run record in execution_logs with status 'RUNNING'         │
├────────────────────────────────────────────────────────────────────────┤
│ 2. STEP 1: SCRAPE                                                      │
│    • Dispatch async HTTP GET via HTTPX with custom User-Agent          │
│    • Parse HTML with BeautifulSoup4; strip <script>, <style>, <nav>    │
│    • Normalize whitespace and truncate text to max 5,000 characters    │
│    • Store output: execution_context["step_1"] = clean_text            │
├────────────────────────────────────────────────────────────────────────┤
│ 3. STEP 2: AI FILTER                                                   │
│    • Construct extraction prompt using clean_text                      │
│    • Call Gemini 1.5 Flash in JSON mode                                │
│    • Parse returned JSON payload into structured dictionary            │
│    • Store output: execution_context["step_2"] = ai_result             │
├────────────────────────────────────────────────────────────────────────┤
│ 4. STEP 3: CONDITION EVALUATION                                        │
│    • Resolve dynamic field path (e.g., execution_context["step_2"]["found"])│
│    • Compare against target value using safe operator dictionary       │
│    • If condition fails: Mark status 'SKIPPED', log, and terminate run │
│    • If condition passes: Proceed to Step 4                            │
├────────────────────────────────────────────────────────────────────────┤
│ 5. STEP 4: VARIABLE INTERPOLATION & NOTIFICATION                       │
│    • Execute regex scanner: pattern = r"\{\{(step_\d+)\.([a-zA-Z0-9_]+)\}\}"│
│    • Replace tokens with runtime values from execution_context         │
│    • Query user's telegram_chat_id from profiles table                 │
│    • Post message via Telegram Bot API: /sendMessage                   │
├────────────────────────────────────────────────────────────────────────┤
│ 6. COMPLETION                                                          │
│    • Update execution_logs: status = 'SUCCESS', completed_at = now()   │
│    • Update automations: last_run_at = now()                           │
│    • Supabase Realtime pushes status update to React frontend          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Comprehensive End-to-End Walkthrough

### Scenario: Monitoring University Examination Notice Board
* **User Input**:
  > *"Check the RGPV university notice board daily at 9 AM. If there is a notice regarding the 7th-semester B.Tech exam timetable, alert my Telegram."*

#### Step 1: Compilation Phase
Gemini compiles the prompt into the following validated JSON pipeline:
```json
{
  "title": "RGPV 7th Sem Exam Alert",
  "schedule_cron": "0 9 * * *",
  "steps": [
    {
      "step_id": 1,
      "type": "scrape",
      "config": {
        "url": "https://www.rgpv.ac.in",
        "max_length": 5000
      }
    },
    {
      "step_id": 2,
      "type": "ai_filter",
      "config": {
        "instruction": "Scan the notices and check if there is an announcement regarding 7th Semester B.Tech Exam Timetable or Schedule. Return JSON with 'found' (boolean), 'title' (string), and 'link' (string).",
        "expected_fields": ["found", "title", "link"]
      }
    },
    {
      "step_id": 3,
      "type": "condition",
      "config": {
        "field": "step_2.found",
        "operator": "==",
        "value": true
      }
    },
    {
      "step_id": 4,
      "type": "notify",
      "config": {
        "channel": "telegram",
        "message": "🚨 Exam Schedule Released: {{step_2.title}}!\nDownload Link: {{step_2.link}}"
      }
    }
  ]
}
```

#### Step 2: Sandbox Testing (`[▶ Test Run]`)
1. User clicks **"Test Run"** on the dashboard.
2. Step 1 card pulses yellow (`RUNNING`), fetches the HTML, extracts 3,840 text characters, and turns green (`SUCCESS`).
3. Step 2 card pulses yellow. Gemini analyzes the text and outputs:
   ```json
   { "found": true, "title": "B.Tech VII Semester Exam Schedule Nov 2026", "link": "https://www.rgpv.ac.in/notices/nov26.pdf" }
   ```
4. Step 3 card validates that `step_2.found == true`. Card turns green (`SUCCESS`).
5. Step 4 card resolves the template tokens, hits `https://api.telegram.org/bot<TOKEN>/sendMessage`, and sends the push notification.
6. User's mobile device buzzes with the live alert.

#### Step 3: Activation & Persistence
* User clicks **"Activate & Save"**.
* The pipeline is committed to the `automations` table in Supabase.
* The APScheduler registers the cron trigger `0 9 * * *` to run automatically in the background.

---

## 10. Security, Rate Limiting & Safety Engineering

### 10.1 Server-Side Request Forgery (SSRF) Defense
Because the `scrape` step fetches external URLs, PromptFlow enforces strict networking safeguards:
* **DNS Resolution Check**: Before opening a socket, the hostname is resolved to its target IP address.
* **Subnet Filtering**: Requests to loopback addresses (`127.0.0.1`, `localhost`), link-local metadata endpoints (`169.254.169.254`), and RFC1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are aborted immediately.
* **Protocol Whitelist**: Only `http://` and `https://` schemes are permitted; `file://`, `ftp://`, and `gopher://` are rejected.

### 10.2 System Resource Quotas
* **Account Automation Limit**: Maximum of **5 active automations** enforced at the database level via a PostgreSQL `BEFORE INSERT OR UPDATE` trigger.
* **Execution Interval Capping**: Automated background executions cannot be scheduled faster than once every 15 minutes.
* **Payload Truncation**: Scraped web text is strictly bounded to a maximum of 5,000 characters before forwarding to the LLM, preventing context overflow and controlling processing latency.

---

## 11. Viva Defense & Technical Q&A Guide

1. **"Why use an LLM inside the workflow rather than standard web scraping with regex or CSS selectors?"**
   * *Answer*: Traditional scraping breaks whenever a target website updates its CSS classes or HTML layout (e.g., changing `.notice-link` to `.post-title`). PromptFlow strips HTML tags down to readable plain text and uses Gemini for semantic reasoning, allowing the system to extract data accurately even if the underlying HTML structure changes completely.
2. **"Does sending conversational history on every turn exhaust the LLM token budget?"**
   * *Answer*: No. A typical automation creation session takes between 3 and 8 conversational turns (approximately 1,000 to 2,000 tokens). Gemini 1.5 Flash provides a 1,000,000 token context window on its free tier, utilizing less than 0.2% of capacity per session.
3. **"How does the system ensure multi-user isolation and data privacy?"**
   * *Answer*: We enforce PostgreSQL Row-Level Security (RLS) directly in Supabase. Every query executes under the authenticated user's JWT (`auth.uid()`). A user cannot read, update, or execute another user's automations, chat history, or execution logs.
4. **"What happens if an external website is slow or down during a scheduled run?"**
   * *Answer*: The Python execution engine enforces a 10-second timeout on all outbound HTTP requests. If a request times out or returns an HTTP 5xx error, the run records a `FAILED` state in `execution_logs` with the exact error details, ensuring the scheduler does not hang or block subsequent queued jobs.