# PromptFlow ⚡
### Autonomous Prompt-Driven Web Monitoring & Micro-Automation Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3ECF8E?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-f55036)](https://groq.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20Flash-4285F4?logo=google)](https://aistudio.google.com/)
[![Design: Apple HIG](https://img.shields.io/badge/Design-Apple%20Glassmorphism-999999?logo=apple)](https://developer.apple.com/design/human-interface-guidelines/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **PromptFlow** eliminates the fragility of CSS-selector web scrapers and the complexity of enterprise RPA node builders (Zapier, Make, n8n). Simply describe what you want to monitor in plain English; PromptFlow compiles your prompt into a deterministic 4-step pipeline DSL, executes in a sandboxed runtime, runs on an autonomous background cron schedule, and dispatches rich push alerts to **Telegram**, **Discord**, or **Email**.

---

## 🌟 Key Highlights & Capabilities

* **Natural Language Compiler:** Converts plain English requests into a strict 4-step execution DSL (`scrape` $\rightarrow$ `ai_filter` $\rightarrow$ `condition` $\rightarrow$ `notify`) in under 2 seconds.
* **Multi-Turn Slot-Filling:** If a prompt lacks essential parameters (e.g. missing product URL or numerical threshold), the AI initiates an interactive clarification dialogue without losing context.
* **Zero-Selector Semantic AI Extraction:** Eliminates fragile CSS selectors and XPath queries. Web HTML is parsed by schema-constrained LLMs (**Groq Llama 3.3 70B** with **Gemini Flash** fallback) that adapt seamlessly if a website updates its frontend layout.
* **Stealth Sandbox with SSRF Firewall:** Browser user-agent rotation and anti-bot headers bypass standard WAF challenges, while a custom **Pre-Socket DNS Firewall** blocks loopbacks (`127.0.0.1`), private subnets (`10.0.0.0/8`, `192.168.0.0/16`), and cloud metadata services (`169.254.169.254`).
* **Deterministic Logic & Short-Circuit Engine:** Safe condition evaluation (`==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`) with automatic currency stripping (`£51.77` $\rightarrow$ `51.77`). When a condition is false, execution short-circuits to avoid spamming the user.
* **Multi-Channel Push Alerts:**
  * ✈️ **Telegram Bot:** Real-time push alerts with HTML formatting.
  * 💬 **Discord Webhooks:** Rich visual embeds with color-coded sidebars and timestamps.
  * 📧 **Email (SMTP / Nodemailer):** Responsive dark-themed HTML emails with formatted bullet points.
* **Apple Glassmorphism UI:** Adheres strictly to Apple Human Interface Guidelines: obsidian `#05070D` ground, translucent glass cards (`rgba(255,255,255,0.07)`), 28px backdrop blur with 170% saturation, ambient neon-green execution glows, and smooth spring physics.
* **Quota Governance:** Database triggers and UI meters strictly enforce a **5 active automations limit** per account.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROMPTFLOW FRONTEND (Vite + React 18)           │
│                                                                        │
│   ┌───────────────────────────┐     ┌──────────────────────────────┐   │
│   │    Conversational Studio  │     │      My Automations Hub      │   │
│   │ (Chat + Pipeline Canvas)  │     │ (5/5 Quota Meter & Run Logs) │   │
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
│   • Chat History: Multi-turn session memory for slot-filling dialogue  │
└─────────────────┬──────────────────────────────────────────────────────┘
                  │ Service Key
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│               NODE.JS + EXPRESS BACKEND ENGINE (TypeScript)            │
│                                                                        │
│   1. Compiler Engine: Natural language -> 4-step validated DSL         │
│   2. Pre-Socket DNS Firewall: Blocks localhost & private IPv4/IPv6 IPs │
│   3. Sandbox Scraper: Axios + Cheerio with UA rotation & timeout guards│
│   4. Semantic AI Extractor: Groq Llama 3.3 70B / Gemini Flash JSON     │
│   5. Deterministic Evaluator: Safe type-coerced condition engine       │
│   6. Template Interpolator: {{step_X.field}} with clean bullet lists   │
│   7. Scheduler Daemon: node-cron background task manager               │
│   8. Notification Dispatcher: Telegram Bot, Discord, & Nodemailer      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 The 4-Step Pipeline DSL

Every automation is compiled into a declarative, schema-validated JSON workflow:

```json
{
  "title": "Books To Scrape - Price Drop Watcher",
  "description": "Monitors book price and pings Telegram when under £60",
  "schedule_cron": "0 9 * * *",
  "steps": [
    {
      "step_id": 1,
      "type": "scrape",
      "config": {
        "url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
        "max_length": 5000
      }
    },
    {
      "step_id": 2,
      "type": "ai_filter",
      "config": {
        "instruction": "Extract the book title and price in GBP as a number.",
        "expected_fields": ["title", "price"]
      }
    },
    {
      "step_id": 3,
      "type": "condition",
      "config": {
        "field": "step_2.price",
        "operator": "<",
        "value": 60
      }
    },
    {
      "step_id": 4,
      "type": "notify",
      "config": {
        "channel": "telegram",
        "message": "🚨 Price Alert: {{step_2.title}} is now £{{step_2.price}}!"
      }
    }
  ]
}
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on v20 & v22)
- **npm** v10+
- Free **Supabase** project ([supabase.com](https://supabase.com))
- Free API key from **Groq** ([console.groq.com](https://console.groq.com)) or **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com))

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

# LLM Engines
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

Build and run the backend:
```bash
npm run build
npm run dev
# Backend running at http://localhost:5000/api
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

Run the Vite client:
```bash
npm run dev
# Frontend running at http://localhost:5173
```

---

### 4. Database Migrations (Supabase)

Execute the SQL scripts in your **Supabase Dashboard $\rightarrow$ SQL Editor** in numerical order:
1. `supabase/migrations/01_initial_schema.sql` — Profiles, automations, execution logs, and RLS policies.
2. `supabase/migrations/02_auth_trigger.sql` — Automatic profile generation upon user registration.
3. `supabase/migrations/03_quota_trigger.sql` — Enforces maximum 5 active automations per account.
4. `supabase/migrations/04_user_profile_metadata.sql` — Stores Telegram Chat ID, Discord Webhook, and preferences.

---

## 🧪 Comprehensive Automated Test Suites

PromptFlow features two automated test suites covering end-to-end integration and specialized automation types:

### 1. Root End-to-End System Test Suite
Validates the entire full-stack pipeline from API health to AI compilation, sandbox execution, SSRF firewalling, and capacity governance:

```bash
node test.js
```

```text
================================================================================
⚡ PROMPTFLOW END-TO-END FEATURE VERIFICATION SUITE
================================================================================
✅ [PASS] [Infrastructure] Backend API Health Check
✅ [PASS] [Infrastructure] Frontend Dev Server Serving Assets
✅ [PASS] [AI Compiler] Compiling Plain English Prompt to 4-Step Validated DSL
✅ [PASS] [Slot-Filling] Ambiguous Prompt Triggers Intelligent Clarification Dialogue
✅ [PASS] [Pipeline Engine] Live Scraping & AI Extraction in Sandbox (Condition True)
✅ [PASS] [Condition Logic] False Condition Short-Circuits Execution Without Alert Dispatch
✅ [PASS] [Security / SSRF] SSRF Pre-Socket Firewall Blocks Localhost & Private Subnets
✅ [PASS] [Alert Formatting] Multi-Item Array Template Interpolation Formats Clean Bullets
✅ [PASS] [Governance] Automation Quota Enforcement (Strict 5 Concurrent Active Limit)

Total Features Tested: 9 | Passed: 9 | Pass Rate: 100%
🎉 ALL PROMPTFLOW FEATURES VERIFIED SUCCESSFULLY!
```

### 2. Backend Specialized Automation Suite
Tests 10 distinct automation archetypes (market monitoring, commodity tracking, Wikipedia events, case-insensitive string matching, Telegram dispatch):

```bash
node backend/test.js
```

```text
================================================================================
📊 PROMPTFLOW COMPREHENSIVE AUTOMATION TEST RESULTS
================================================================================
Total Automation Types Tested: 10 | Passed: 10 | Success Rate: 100%
🎉 ALL 10 AUTOMATION TYPES VERIFIED SUCCESSFULLY!
```

---

## 🚀 Deployment Guide

| Component | Platform | Deployment Instructions |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | Connect repo $\rightarrow$ set Root Directory to `frontend` $\rightarrow$ set `VITE_API_URL` to backend URL $\rightarrow$ Deploy. |
| **Backend** | **Render / Railway** | Connect repo $\rightarrow$ set Root Directory to `backend` $\rightarrow$ Build: `npm install && npm run build` $\rightarrow$ Start: `npm start` $\rightarrow$ Add `.env` keys. |
| **Database** | **Supabase** | Cloud hosted PostgreSQL database with built-in Auth & RLS. |

---

## 📑 Project Documentation & Presentation Suite

| Resource | File | Purpose |
| :--- | :--- | :--- |
| **Comprehensive Technical Docs** | [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) | Exhaustive 14-section architectural and implementation specification |
| **Offline Printable PDF** | [`PROJECT_DOCUMENTATION.pdf`](./PROJECT_DOCUMENTATION.pdf) | Formatted offline PDF of the complete technical specification |
| **Interview & Viva Defense Guide** | [`INTERVIEW_DEFENSE_GUIDE.md`](./INTERVIEW_DEFENSE_GUIDE.md) | 25 tough faculty questions with model answers + architectural tradeoffs |
| **PowerPoint Presentation Deck** | [`PromptFlow_Presentation.pptx`](./PromptFlow_Presentation.pptx) | Complete 16:9 widescreen presentation deck with embedded speaker notes |
| **Interactive HTML Slides** | [`PRESENTATION.html`](./PRESENTATION.html) | Browser slide presentation with fullscreen mode and notes drawer |
| **Presentation Script Markdown** | [`PRESENTATION_DECK.md`](./PRESENTATION_DECK.md) | Verbatim speaker scripts and slide outlines |

---

## 🛡️ Security & Reliability Architecture

* **Pre-Socket SSRF Firewall:** Uses Node.js `dns/promises` to resolve target hostnames before socket connection. Rejects loopbacks, private CIDR subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS link-local addresses (`169.254.169.254`).
* **Deterministic Short-Circuiting:** Halts pipelines immediately with a `SKIPPED` state if conditions evaluate to false, preventing notification spam.
* **Adaptive Error Recovery:** Translates HTTP 403 / WAF challenge pages into helpful alternative source recommendations.
* **Quota Enforcement:** Database-level trigger prevents any user account from activating more than 5 concurrent automations.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
