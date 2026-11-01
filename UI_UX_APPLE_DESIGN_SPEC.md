# PromptFlow UI/UX Redesign Specification & Master Prompt
### Apple Human Interface Guidelines (HIG) & Liquid Glass Design System

---

## 1. Executive Summary & Design Vision

PromptFlow is an autonomous micro-automation engine that translates natural language prompts into deterministic, scheduled 4-step web-scraping and AI-extraction pipelines, delivering real-time structured alerts to Discord, Telegram, and Email.

### The Problem
Previous iterations suffered from generic, cheap AI web design patterns: jarring neon purple/cyan glowing meshes, noisy gradient borders, low contrast text, and cluttered controls that lacked tactile weight or hierarchy.

### The Objective
Rebuild the entire frontend UI under Apple's Human Interface Guidelines (HIG) and the **Liquid Glass** dynamic material architecture. The design language must evoke the polish of macOS Sequoia and iOS 18:
* **Quiet Confidence & Restraint:** Content comes first. No decorative AI glows, rainbow borders, or gratuitous animations.
* **Strict Two-Layer Discipline:** Crystal-clear separation between the background content layer and the floating functional glass layer.
* **Editorial Typographic Precision:** Apple SF Pro hierarchy with tightened optical tracking and strict contrast ratios.
* **Tactile Spring Physics:** Micro-interactions that feel snappy, responsive, and grounded.

---

## 2. Design System Foundations

### A. The Two-Layer Architecture (HIG `liquid-glass.md`)
1. **The Content Layer:**
   * Pure obsidian canvas (`#000000`).
   * Subtle elevated surface containers (`#141416` and `#1C1C1E`).
   * Quiet, solid surfaces with gentle ambient drop shadows (`box-shadow: 0 4px 24px rgba(0,0,0,0.4)`).
   * 1px hairline border highlights (`rgba(255, 255, 255, 0.08)` to `0.12`).
   * *Rule:* Never apply translucent blur or Liquid Glass directly onto content cards or body tables.
2. **The Functional Layer:**
   * Floating navigation bars, modal dialog sheets, popover menus, and action dock toolbars.
   * Styled with authentic **Liquid Glass**:
     * Heavy backdrop blur (`backdrop-blur-2xl` / 24–40px).
     * Translucent neutral fill (`rgba(20, 20, 22, 0.75)` in dark appearance).
     * 1px top-lit inner border highlight (`border border-white/[0.12]`).
     * Scroll edge effect: scrolling content subtly blurs and dims as it slips beneath the glass.

### B. Typography & Optical Spacing (HIG `typography.md`)
* **Font Stack:** Apple System Font Stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif`).
* **Monospace Stack:** Apple SF Mono (`ui-monospace, Menlo, Monaco, Consolas, monospace`).
* **Scale & Tracking Hierarchy:**
  * **Large Hero Title:** 48–60px, Bold (700), `letter-spacing: -0.025em`.
  * **Section Title:** 24–28px, Semibold (600), `letter-spacing: -0.02em`.
  * **Card Headline:** 16–17px, Semibold (600), `letter-spacing: -0.01em`.
  * **Body Text:** 14–15px, Regular (400), secondary slate (`#A1A1A6`), `line-height: 1.5`.
  * **Captions & Monospace Badges:** 12–13px, Medium (500), `letter-spacing: -0.005em`.

### C. Color Tokens & Semantic Roles (HIG `color.md`)
* **Deep Canvas:** `#000000` (Pure Black).
* **Surface Background:** `#0D0D0E` (System Base).
* **Elevated Card Surface:** `#141416` (Card Fill).
* **Secondary Surface:** `#1C1C1E` (Inset Containers, Code Blocks).
* **Tertiary Surface:** `#2C2C2E` (Dividers, Borders, Inactive Toggles).
* **Primary System Action:** Apple System Blue (`#007AFF` / `#0A84FF`). Only 1 prominent tinted action button per view.
* **Success & Active Status:** Apple System Emerald (`#30D158` / `#34C759`).
* **Warning & Condition State:** Apple System Amber (`#FF9F0A`).
* **Error & Destructive Action:** Apple System Red (`#FF453A`).
* **Text Hierarchy:**
  * Primary Text: `#F5F5F7` (95% White).
  * Secondary Text: `#A1A1A6` (Muted Slate).
  * Tertiary Text: `#6E6E73` (Subtle Metadata).

### D. Geometry & Tactile Feedback (HIG `controls.md`)
* **Corner Geometry:** Apple continuous squircles:
  * Modal Sheets & Main Windows: `rounded-[28px]`.
  * Cards & Inspector Drawers: `rounded-[20px]`.
  * Buttons & Form Inputs: `rounded-[12px]`.
  * Status Capsules & Pills: `rounded-full`.
* **Tactile Spring Physics:**
  * Interactive controls compress slightly on press: `active:scale-[0.98]`.
  * Transitions use Apple standard timing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 3. Page Architecture & Total Page Count

PromptFlow is composed of **4 Core Views / Pages** and **3 Native Cupertino Sheets / Modals**:

```
                               ┌──────────────────┐
                               │  TOP NAVBAR      │
                               │  (Liquid Glass)  │
                               └────────┬─────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
   ┌───────────────┐            ┌───────────────┐           ┌───────────────┐
   │    PAGE 1     │            │    PAGE 3     │           │    PAGE 4     │
   │  Landing Page │            │User Dashboard │           │Automation     │
   │ (Apple Stage) │            │(macOS Manager)│           │Studio         │
   └───────────────┘            └───────────────┘           └───────────────┘
           │                            │                           │
           └────────────────────────────┼───────────────────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │       CUPERTINO SHEETS        │
                        ├───────────────────────────────┤
                        │ • Page 2: Auth Sheet (Sign/Up)│
                        │ • Profile & Channel Settings  │
                        │ • Multi-Channel Setup Guide   │
                        └───────────────────────────────┘
```

---

## 4. Detailed Specification of What Each Page Must Have

### Page 1: The Landing Page (Apple Product Stage)
* **1. Floating Liquid Glass Navbar:**
  * Pill container floating 16px from viewport top (`backdrop-blur-2xl bg-black/60 border border-white/10 rounded-full px-5 py-2.5`).
  * SF Pro wordmark with subtle metallic gradient (`PromptFlow`).
  * Real-time operational indicator (`● All Systems Normal`).
  * Navigation links: `Studio`, `Dashboard`, `Channel Setup Guide`.
  * Dynamic auth status button: `Sign In` / `Account Profile`.
* **2. Apple Keynote Hero Section:**
  * Large Display Title: *"Automate the web with plain English."* (56px, -0.025em tracking).
  * Subtitle: *"Describe what you want to monitor. PromptFlow writes the scrapers, evaluates the AI conditions, and dispatches structured alerts directly to Discord, Telegram, and Email."*
  * Call-to-action buttons:
    * Primary: `Open Studio` (Apple Blue glass, `rounded-full`, with arrow icon).
    * Secondary: `Explore Live Demo` (Frosted outline glass).
* **3. Interactive macOS Window Simulator:**
  * High-fidelity macOS window with red/yellow/green traffic lights.
  * Interactive prompt input bar: *"Check tech headlines every morning at 8:00 AM and alert my Discord."*
  * Real-time compilation visualizer showing conversion into a verified 4-step pipeline.
* **4. Three Apple Feature Vignettes:**
  * **Vignette 1 (Natural Language Compiler):** AI converts ambiguous human requests into resilient JSON schema definitions with zero code or regex.
  * **Vignette 2 (Polite & Resilient Scraping):** Built-in user-agent rotation, intelligent parsing, and user-friendly explanations for access-restricted websites (e.g. 403 Forbidden).
  * **Vignette 3 (Multi-Channel Formatted Delivery):** Alerts formatted with clean bullets (`• `) and rich Discord embeds, Telegram HTML, and SMTP Gmail.
* **5. Transparent Fair-Quota Guarantee Card:**
  * Prominent glass card: *"Every account gets 5 active automations included free forever. No credit cards, no hidden limits."*
* **6. Minimalist macOS Dock-Style Footer:**
  * Navigation links, security & privacy statement, and system architecture badges (Supabase, Gemini AI, Nodemailer, Cheerio).

---

### Page 2: Authentication Flow (Cupertino Sheet Modal)
* **1. Native Cupertino Sheet Overlay:**
  * Dark frosted background overlay (`backdrop-blur-3xl bg-black/80`).
  * Modal window with continuous curvature (`rounded-[28px]`, `border border-white/10`, `bg-[#141416]`).
* **2. Cupertino Segmented Control:**
  * Sliding pill tab selector between `Sign In` and `Create Account` with smooth spring animation.
* **3. Official Google OAuth Button:**
  * Full-width dark button with official Google multicolored G logo and Apple SF Pro typography (`Continue with Google`).
  * Built-in Supabase PKCE session recovery.
* **4. Email & Password Inputs:**
  * Deep inset inputs (`bg-[#1C1C1E] border border-white/10 rounded-[12px] px-4 py-3`).
  * Dynamic focus ring (`focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20`).
  * Inline validation with clear, concise error banners.
* **5. Channel Integration Guide Shortcut:**
  * Integrated callout leading to the step-by-step notification setup guide.

---

### Page 3: User Automation Dashboard (macOS System Hub)
* **1. Prominent Quota Banner (Strict Requirement):**
  * Elevated Glass Card at the top of the dashboard.
  * **Counter Pill:** `Active Automations: (X/5 Active)`.
  * **Apple Progress Bar:** Visual bar indicating capacity (e.g. 3 of 5 active slots used).
  * **Policy Text:** *"Each account can maintain up to 5 concurrent active automations. Pause or remove an automation to activate another."*
* **2. Command & Filter Bar:**
  * Search field with SF Symbol search icon (`Filter automations...`).
  * Segmented filter: `All (5)`, `Active (3)`, `Paused (2)`.
  * Primary Action: `+ New Automation` button leading to Studio.
* **3. Automations macOS List / Grid View:**
  * **Active Status Badge (Strict Requirement):** Every automation card features a prominent **`[● ACTIVE]`** emerald badge or **`[○ PAUSED]`** gray badge positioned **directly in front of the automation title**.
  * **Header:** `[● ACTIVE] Daily Historical Headlines`
  * **Schedule Capsule:** Clock icon with humanized cron schedule (`Every day at 8:00 AM`).
  * **Destination Badges:** Channel icons (`Discord`, `Telegram`, `Email`).
  * **Target URL Preview:** Monospace URL chip (`timeanddate.com/...`).
  * **Action Controls:**
    * **`Run Now` Button:** Instant test trigger with live spinning indicator and immediate toast feedback.
    * **`Toggle Active/Pause`:** Instant switch that toggles schedule and updates the `(X/5)` quota counter.
    * **`Edit in Studio`:** Opens the automation pipeline in the Studio visualizer.
    * **`Delete` Button:** Apple destructive style confirmation.
* **4. Recent Execution Log Popover / Drawer:**
  * Displays the last 3 execution runs: timestamp, execution duration (e.g., `412ms`), status (`Success` / `Failed`), and delivered payload snippet.

---

### Page 4: Automation Studio (Compiler & Visual Pipeline Workspace)
* **1. Split macOS Pro Workspace:**
  * **Left Pane (5 Columns): Conversational Compiler**
    * Dark iMessage style chat history (user messages in `#2C2C2E`, AI responses in transparent glass with blue accents).
    * Auto-scrolling transcript.
    * Quick suggestion chips:
      * `Historical headlines from Wikipedia`
      * `Amazon price drop tracker`
      * `Hacker News top story alert`
    * Chat input with keyboard shortcut tooltip (`Return ↵ to compile`).
  * **Right Pane (7 Columns): 4-Step Linear Visual Pipeline**
    * **Studio Toolbar:** Automation title, cron schedule badge, `Test Run` button, and `Save & Activate` button.
    * **Step 1 (Scraper / Source):**
      * Target URL input, HTTP method pill (`GET`), and Scrape Engine selector.
      * **Graceful Scraping Error Handling:** When a website blocks automated access (e.g. 403 Forbidden on `timeanddate.com`), an Apple warning banner is displayed:
        * *"Website Access Restricted: This target website blocked automated access. Try an alternate source (e.g. Wikipedia's 'On this day') or verify if an RSS feed/API exists."*
    * **Step 2 (Semantic AI Extraction):**
      * Extraction prompt area.
      * Schema output pills displaying extracted keys (`headlines`, `date`, `found`).
    * **Step 3 (Deterministic Rule Condition):**
      * Logical condition expression (`step_2.found == true`).
      * Human-readable condition summary.
    * **Step 4 (Multi-Channel Alert Dispatch):**
      * Target channel toggles: Discord, Telegram, Email.
      * Template preview showing live interpolation with clean bullet points (`• `).
    * **Parameter Inspector Drawer:** Clicking any step card slides out a macOS-style parameter drawer from the right to adjust headers, selectors, or formulas.

---

### Supporting Feature: Multi-Channel Integration & Setup Guide Modal
* **Step-by-Step Interactive Guide accessible from Navbar, Profile, and Studio:**
  * **Discord Tab:** Step-by-step instructions on creating a Discord Server $\rightarrow$ Channel Settings $\rightarrow$ Integrations $\rightarrow$ New Webhook $\rightarrow$ Copy Webhook URL.
  * **Telegram Tab:** Clear instructions to search `@BotFather`, create `/newbot`, obtain bot token, and message `@userinfobot` to retrieve user Chat ID.
  * **Gmail / Email Tab:** Step-by-step guide on generating a Google **16-character App Password** (Manage Google Account $\rightarrow$ Security $\rightarrow$ 2-Step Verification $\rightarrow$ App Passwords $\rightarrow$ Copy 16-char key).

---

## 5. Technical Implementation Checklist

- [ ] **CSS & Tokens:** Define Apple dark theme tokens, hairline borders, and Liquid Glass utility classes in `frontend/src/index.css` and `frontend/tailwind.config.js`.
- [ ] **Landing Page:** Rebuild `frontend/src/components/landing/LandingPage.tsx` with Apple hero typography, macOS simulator window, and fair-quota card.
- [ ] **Authentication:** Polish `frontend/src/components/auth/AuthModal.tsx` with Cupertino segmented controls, clean Google OAuth, and channel guide link.
- [ ] **User Dashboard:** Rebuild `frontend/src/components/dashboard/AutomationDashboard.tsx` and `AutomationList.tsx` with the `(X/5 Active)` quota banner and `[● ACTIVE]` prefix badges.
- [ ] **Automation Studio:** Refactor `frontend/src/components/chat/ChatPanel.tsx`, `frontend/src/components/visualizer/PipelineVisualizer.tsx`, and `StepCard.tsx` with the 4-step pipeline and 403 fallback handling.
- [ ] **Integration Guide:** Update `frontend/src/components/layout/IntegrationGuideModal.tsx` with step-by-step instructions for Discord, Telegram, and Gmail.
- [ ] **Typecheck & Build:** Verify clean compilation via `cd frontend; npm run build`.

