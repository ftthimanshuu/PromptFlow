# PromptFlow ⚡
### A Prompt-Driven Autonomous Micro-Automation and Real-Time Web-Monitoring Platform

> **Major Project / Academic Capstone Edition**  
> Built with: **React 18 (Vite) + Tailwind CSS** (Frontend) • **Node.js + Express + TypeScript** (Backend) • **Supabase** (PostgreSQL 15, Auth, JSONB, Realtime) • **Google Gemini Flash** (AI Compiler & Semantic Extractor) • **100% Free-Tier Architecture (₹0 Budget)**

---

## 🌟 Overview & Core Value Proposition

PromptFlow replaces traditional, brittle CSS web-scrapers and complex 2D node graphs (Zapier, Make.com, n8n) with an **AI-first conversational micro-automation platform**.

Instead of manually picking DOM selectors, writing regex, or configuring webhooks:
1. **Natural Language Compilation**: Describe any day-to-day automation in plain English (price watchers, university notice monitors, job/internship boards, tech release alerts).
2. **Deterministic 4-Step Pipeline DSL**: Compiled into a linear, validated Domain-Specific Language (`scrape` $\rightarrow$ `ai_filter` $\rightarrow$ `condition` $\rightarrow$ `notify`).
3. **Conversational Slot-Filling**: If a prompt is missing details (e.g. product URL or price threshold), PromptFlow drafts the pipeline, flags the card with `⚠️ Missing Details`, and asks a friendly clarification question.
4. **Interactive Studio & Live Pulse**: Step cards pulse live yellow/green during dry-run sandbox testing with step-level telemetry.
5. **Resource & Security Governance**: Built-in SSRF defense (blocking private subnets and loopback addresses) and database-level quota enforcement of up to **5 active automations per account**.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (SPA)                           │
│  React 18 (Vite) + Tailwind CSS + Lucide Icons                         │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ Conversational Chat Panel    │    │ Linear Pipeline Visualizer   │  │
│  │ (Multi-turn session memory)  │    │ (Live pulsing status cards)  │  │
│  └──────────────┬───────────────┘    └──────────────▲───────────────┘  │
│                 │                                   │                  │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │ HTTPS REST                        │ Realtime sync
                  ▼                                   │
┌─────────────────────────────────────────────────────┴──────────────────┐
│                     SUPABASE CLOUD PLATFORM                            │
│                                                                        │
│  • Supabase Auth: User identity & JWT verification                     │
│  • PostgreSQL DB: JSONB pipeline definitions, run logs, chat history   │
│  • Row-Level Security (RLS): Strict tenant isolation per user_id       │
│  • Quota Trigger: Max 5 active automations per account                 │
└─────────────────┬──────────────────────────────────────────────────────┘
                  │ REST
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS BACKEND ENGINE (TypeScript)            │
│                                                                        │
│  1. Prompt Compiler: Gemini Flash + Multi-turn memory                  │
│  2. Web Scraper: Axios + Cheerio with strict SSRF defense              │
│  3. Semantic AI Extractor: Gemini structured key extraction            │
│  4. Evaluator: Safe deterministic operators (==, !=, >, <, contains)   │
│  5. Template Engine: Dynamic {{step_X.field}} variable interpolation   │
│  6. Background Scheduler: node-cron daemon                             │
│  7. Alert Dispatcher: Telegram Bot API & Discord Webhook client        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v10+

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```
Configure your keys in `backend/.env`:
- `GEMINI_API_KEY`: Get free API key from [Google AI Studio](https://aistudio.google.com/)
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: From your free [Supabase](https://supabase.com/) project
- `TELEGRAM_BOT_TOKEN`: (Optional) From `@BotFather` on Telegram

Run backend tests:
```bash
npm test
# Or run complete end-to-end suite:
npx tsx verify-e2e.ts
```

Start backend development server:
```bash
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite React development server:
npm run dev
# Running on http://localhost:5173
```

### 3. Database Setup (Supabase)
In your Supabase project's SQL Editor, execute the migration scripts in order:
1. `supabase/migrations/01_initial_schema.sql` (Tables & RLS)
2. `supabase/migrations/02_auth_trigger.sql` (Auto-creates profile on signup)
3. `supabase/migrations/03_quota_trigger.sql` (Enforces 5-automation account limit)

---

## 🛡️ Security & Reliability Engineering
- **SSRF Defense**: Target hostnames are resolved through DNS prior to socket connection, blocking `localhost`, `127.0.0.1`, RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS metadata (`169.254.169.254`).
- **Quota Enforcer**: PostgreSQL `BEFORE INSERT OR UPDATE` trigger prevents account abuse.
- **Graceful Short-Circuiting**: If a condition fails, the pipeline transitions to `SKIPPED` status and halts without sending spam alerts.
- **Fail-Safe Offline Mode**: Includes mock fallbacks so the application runs seamlessly even before API keys are connected.
