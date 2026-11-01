# PromptFlow ⚡
### Autonomous Prompt-Driven Web Monitoring & Micro-Automation Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3ECF8E?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-f55036)](https://groq.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20Flash-4285F4?logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **PromptFlow** eliminates the fragility of CSS-selector web scrapers and the complexity of 2D node graphs (Zapier, Make, n8n). Simply describe what you want to monitor in plain English; PromptFlow compiles your prompt into a deterministic 4-step pipeline DSL, runs on an autonomous background cron schedule, and dispatches rich push alerts to **Telegram**, **Discord**, or **Email**.

---

## 🌟 Key Highlights & Capabilities

* **Natural Language Compiler:** Turns plain English requests into a strict 4-step execution DSL (`scrape` $\rightarrow$ `ai_filter` $\rightarrow$ `condition` $\rightarrow$ `notify`).
* **Multi-Turn Slot-Filling:** If a prompt lacks essential parameters (e.g. missing product URL or threshold), the AI drafts what it can and asks a friendly clarification question without dropping context.
* **Hybrid LLM Architecture:** Ultra-fast sub-second extraction powered by **Groq Llama 3.3 70B** with seamless fallback to **Google Gemini 3.5 Flash**.
* **Stealth Scraper with SSRF Firewall:** Modern browser header spoofing bypasses standard WAF blocks while pre-socket DNS inspection blocks internal subnets, loopbacks (`127.0.0.1`), and AWS metadata endpoints (`169.254.169.254`).
* **Deterministic Logic Engine:** Type-safe condition evaluations (`==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`) with automatic currency stripping (`£51.77` $\rightarrow$ `51.77`).
* **Multi-Channel Push Alerts:**
  * ✈️ **Telegram Bot:** Direct push messages with HTML formatting.
  * 💬 **Discord Webhooks:** Rich visual embeds with color-coded sidebars and timestamps.
  * 📧 **Email (SMTP / Gmail):** Responsive dark-themed HTML emails with formatted bullet points.
* **Fair Resource Governance:** Supabase database triggers strictly enforce **5 active automations per user account**.
* **Modern Studio & Dashboard:** Built on Tailwind CSS and UI-UX-Pro-Max design patterns with Linear/Raycast OLED dark aesthetic, live pipeline visualizer, step drawers, and real-time execution logs.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROMPTFLOW FRONTEND (Vite + React)              │
│                                                                        │
│   ┌───────────────────────────┐     ┌──────────────────────────────┐   │
│   │   AI Automation Studio    │     │      My Automations Hub      │   │
│   │ (Conversational Compiler) │     │ (5/5 Quota Meter & Run Logs) │   │
│   └─────────────┬─────────────┘     └──────────────▲───────────────┘   │
└─────────────────┼──────────────────────────────────┼───────────────────┘
                  │ REST API                         │ RLS Realtime Sync
                  ▼                                  │
┌────────────────────────────────────────────────────┴───────────────────┐
│                      SUPABASE CLOUD PLATFORM                           │
│                                                                        │
│   • Supabase Auth: Email/Password + One-Click Google OAuth             │
│   • PostgreSQL: Strict tenant isolation via Row-Level Security (RLS)   │
│   • Trigger Enforcer: BEFORE INSERT/UPDATE restricts active slots <= 5 │
│   • Profiles Table: Stores Telegram Chat ID & Discord Webhook URL      │
└─────────────────┬──────────────────────────────────────────────────────┘
                  │ Service Key
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS BACKEND ENGINE (TypeScript)            │
│                                                                        │
│   1. Compiler Engine: Natural language -> 4-step validated DSL        │
│   2. Stealth Scraper: Axios + Cheerio with pre-socket SSRF defense    │
│   3. Semantic AI Extractor: Groq Llama 3.3 70B / Gemini Flash JSON    │
│   4. Deterministic Evaluator: Safe type-coerced condition engine      │
│   5. Template Interpolator: {{step_X.field}} with clean bullet lists  │
│   6. Scheduler Daemon: node-cron background task manager              │
│   7. Notification Dispatcher: Telegram Bot, Discord, & Nodemailer     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 The 4-Step Pipeline DSL

Every automation is compiled into a lightweight, declarative JSON schema:

```json
{
  "title": "Daily Exam Timetable Watcher",
  "description": "Monitors university notices for 7th-sem schedules",
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
        "instruction": "Scan page for 7th sem timetable notices. Return found and title.",
        "expected_fields": ["found", "title"]
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
        "message": "🚨 Exam Schedule Released: {{step_2.title}}"
      }
    }
  ]
}
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v20 & v24)
- **npm** v10+
- A free **Supabase** account ([supabase.com](https://supabase.com))
- Free API keys from **Groq** ([console.groq.com](https://console.groq.com)) or **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com))

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# LLM Engines (at least one recommended)
GROQ_API_KEY=gsk_your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Telegram Alerts (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Email Dispatcher via SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

Compile and start the backend:
```bash
npm run build
npm run dev
# Server running at http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the Vite development server:
```bash
npm run dev
# Client running at http://localhost:5173
```

---

### 4. Database Migrations (Supabase)

Run the SQL migration scripts in your **Supabase Dashboard $\rightarrow$ SQL Editor** in order:
1. `supabase/migrations/01_initial_schema.sql` — Profiles, automations, execution logs, and RLS policies.
2. `supabase/migrations/02_auth_trigger.sql` — Automatic profile provisioning upon Supabase signup.
3. `supabase/migrations/03_quota_trigger.sql` — Enforces the 5 active automation limit per account.
4. `supabase/migrations/04_user_profile_metadata.sql` — Syncs Telegram Chat ID, Discord Webhook, and display name into profiles.

---

## 🧪 Comprehensive Automated Test Suite

PromptFlow includes a complete automated test runner testing all 10 core execution branches:

```bash
# Run the test suite from root
node backend/test.js
```

```text
================================================================================
📊 PROMPTFLOW COMPREHENSIVE AUTOMATION TEST RESULTS
================================================================================
Total Automation Types Tested: 10
Passed: 10
Failed: 0
Success Rate: 100%

┌─────────┬────┬────────────────────┬─────────────────────────────────────────────────┬────────┐
│ (index) │ #  │ Category           │ Test                                            │ Status │
├─────────┼────┼────────────────────┼─────────────────────────────────────────────────┼────────┤
│ 0       │ 1  │ 'Numeric Watcher'  │ 'E-Commerce Price Drop (< 60) Triggered Succes' │ 'PASS' │
│ 1       │ 2  │ 'Condition Logic'  │ 'Negative Threshold Gracefully Short-Circuits ' │ 'PASS' │
│ 2       │ 3  │ 'Market Monitor'   │ 'Commodity Live Price Extraction & Threshold T' │ 'PASS' │
│ 3       │ 4  │ 'Content Monitor'  │ 'Semantic Topic Matching on Live Wikipedia Eve' │ 'PASS' │
│ 4       │ 5  │ 'Operator Engine'  │ "Case-Insensitive 'contains' Operator Validati" │ 'PASS' │
│ 5       │ 6  │ 'Template Engine'  │ 'Multi-Variable Dynamic Token Replacement ({{s' │ 'PASS' │
│ 6       │ 7  │ 'AI Compiler'      │ 'Translating Natural Language to 4-Step Valida' │ 'PASS' │
│ 7       │ 8  │ 'Slot-Filling'     │ 'Automatic Detection of Missing Parameters & C' │ 'PASS' │
│ 8       │ 9  │ 'Security / SSRF'  │ 'Pre-Socket DNS Inspection Blocking Localhost ' │ 'PASS' │
│ 9       │ 10 │ 'Alert Dispatcher' │ 'Telegram Bot API Live Delivery to Mobile Devi' │ 'PASS' │
└─────────┴────┴────────────────────┴─────────────────────────────────────────────────┴────────┘
🎉 ALL 10 AUTOMATION TYPES VERIFIED SUCCESSFULLY!
```

---

## 🛡️ Security & Reliability Architecture

* **Pre-Socket SSRF Firewall:** Uses Node.js `dns/promises` to resolve hostnames before dispatching network sockets. Explicitly rejects `localhost`, `127.0.0.0/8`, private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud link-local addresses (`169.254.169.254`).
* **Graceful Short-Circuiting:** When a condition evaluates to `false`, the pipeline immediately halts with a `SKIPPED` status, avoiding unnecessary notification spam.
* **Defensive Error Handling:** HTTP 403 / Cloudflare WAF challenges are translated into clean, human-actionable instructions.
* **Offline Mock Fallbacks:** If remote LLM providers experience rate-limiting or outages, PromptFlow fails over gracefully to deterministic mock heuristics so testing is never blocked.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
