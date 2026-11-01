# PromptFlow UI (Glass edition): build this design exactly, with no changes

Rebuild the UI in `reference/*.html` inside the existing React + TypeScript + Tailwind frontend (`frontend/`).
Zero creative freedom: do not redesign, simplify, "improve", or skip any animation.

## Sources of truth
1. `reference/*.html` (5 files): the finished screens. They include the glass styling, the animated background, and ALL animations. Copy values from their inline styles and `<helmet><style>` classes.
2. `glass-animations.css`: the full glass + animation layer, extracted from those files. Paste it into `frontend/src/index.css` verbatim, then use its classes (`.c`, `.g`, `.orb`, `.o1-.o3`, `.stp`, `.col`, `.dot`, `.sg`, `.pl`, `.bl`) or equivalent Tailwind/component classes with IDENTICAL values.
3. `UI_UX_APPLE_DESIGN_SPEC.md`: written requirements and behavior. Where it says "never use glass on content cards", this edition OVERRIDES that: cards ARE glass here. Everything else in the spec still applies.
4. Ignore the design-tool wrappers: `<x-dc>`, `<helmet>`, `support.js`, `<script type="text/x-dc">`. `{{date}}` is a template placeholder (sample "Nov 1").

## Glass recipe
- Page ground: `#05070D`. Root of each screen: `position:relative; isolation:isolate; overflow:hidden`, containing three `.orb` divs (`o1` deep blue #0A3A7A, `o2` teal #12475C, `o3` indigo #3A2F63; each 420-520px, `filter:blur(90px)`, `z-index:-1`, `drift` 24s ease-in-out infinite, delays 0 / -8s / -14s).
- Glass card (`.c`): bg `rgba(255,255,255,.07)`, `backdrop-filter: blur(28px) saturate(170%)`, border `1px solid rgba(255,255,255,.1)`, radius 20px, shadow `inset 0 1px 0 rgba(255,255,255,.2), 0 8px 32px rgba(0,0,0,.32)`.
- Glass bar/pill (`.g`): bg `rgba(255,255,255,.08)`, `blur(32px) saturate(170%)`, border `1px solid rgba(255,255,255,.12)`.
- Insets: `rgba(255,255,255,.06)`; inactive/pill fill: `rgba(255,255,255,.12)`.
- Primary button (`.bl`): `rgba(10,113,227,.88)`, white text, `inset 0 1px 0 rgba(255,255,255,.35)`. One primary per view.
- Text: primary #F5F5F7, secondary #A1A1A6, tertiary #8E8E93. Blue text/focus: #0A84FF (ring `0 0 0 3px rgba(10,132,255,.2)`). Success #30D158, warning #FF9F0A, error #FF453A.
- Radii: sheets/windows 28px, cards 20px, buttons/inputs 12px, pills full. Fonts: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`; mono `ui-monospace, Menlo, Monaco, Consolas, monospace`.

## Animations (all must be implemented exactly; values are in glass-animations.css)
- `rise` entrance on cards/bars (0.9s `cubic-bezier(.16,1,.3,1)`, fill `backwards`), staggered by child index (0 / .08s / .16s / .24s / .32s / .4s); hero `h1` rises over 1s.
- Landing pipeline steps (`.stp`) appear in sequence at 0.8s / 0.95s / 1.1s / 1.25s.
- Setup-guide columns (`.col`) stagger 0 / .1s / .2s.
- `drift` on background orbs; `ping` on the green status dot (`.dot`); `grow` on the dashboard quota progress bar (scaleX from 0, 1.4s, delay .4s, origin left).
- Hover: `.c` lifts `translateY(-3px)`; buttons `brightness(1.14)`; press `scale(.97)`; all with `cubic-bezier(.16,1,.3,1)`.
- Segmented controls (auth Sign In/Create Account, dashboard All/Active/Paused, guide tabs): a sliding glass pill (`.pl`) moves with `translateX` over .55s `cubic-bezier(.16,1,.3,1)`. In React, drive it with state; keep the same markup, sizes and easing. Selected label turns #F5F5F7.
- `@media (prefers-reduced-motion: reduce)` disables all animation and transitions.

## Files to build
| Reference | Target |
|---|---|
| reference/1-landing.html | frontend/src/components/landing/LandingPage.tsx |
| reference/2-auth-sheet.html | frontend/src/components/auth/AuthModal.tsx |
| reference/3-dashboard.html | frontend/src/components/dashboard/AutomationDashboard.tsx, AutomationList.tsx |
| reference/4-studio.html | frontend/src/components/chat/ChatPanel.tsx, visualizer/PipelineVisualizer.tsx, StepCard.tsx |
| reference/5-integration-guide.html | frontend/src/components/layout/IntegrationGuideModal.tsx |
Shared pieces (navbar pill, status dot, buttons, inputs, segmented control, orb background) must be single reusable components.

## Behavior the static reference does not show (see the spec)
- Navbar auth button toggles Sign In / Account Profile.
- Dashboard: filter and search work; Pause/Resume updates the (X/5 Active) counter and progress bar; block a 6th active automation; Run Now shows a spinner and a toast; Delete asks for destructive confirmation; run log shows the last 3 runs.
- Studio: chat auto-scrolls; chips fill the input; Return compiles; clicking a step opens the right-side Parameter Inspector drawer; Step 1 shows the 403 "Website Access Restricted" banner when a scrape is blocked.
- Guide: Discord / Telegram / Email tabs switch content; reachable from navbar, profile and Studio.
- Keep existing API calls, Supabase auth and state logic. Change presentation only. Replace sample data with real data.

## Done when
1. Each screen matches its reference at 1280px (side by side), including blur, borders, shadows, spacing, text and every animation.
2. Mobile width stacks cleanly; contrast is at least 4.5:1; real `<button>`/`<input>`/`<label>` elements.
3. `cd frontend && npm run build` passes with no type errors.
