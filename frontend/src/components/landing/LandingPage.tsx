import React from "react";

interface LandingPageProps {
  onOpenStudio: () => void;
  onOpenDashboard: () => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
  onOpenGuide?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenDashboard,
  onOpenAuth,
  onOpenGuide,
}) => {
  return (
    <div className="relative min-h-full box-border px-6 py-12 md:py-16 bg-black text-[#F5F5F7] overflow-hidden">
      {/* Ambient Apple Glow behind hero */}
      <div className="ambient-glow-top" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto text-center pt-8 md:pt-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-[#0071E3] shadow-[0_0_8px_#0071E3]" />
          <span className="text-xs font-medium text-white/90 tracking-wide">
            Next-Gen Autonomous Web Intelligence
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-[68px] font-bold tracking-tight leading-[1.06] text-white">
          Automate the web with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            plain English.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#A1A1A6] max-w-2xl mx-auto font-normal leading-relaxed">
          Describe what you want to monitor. PromptFlow writes the scrapers, evaluates the AI conditions, and dispatches structured alerts directly to Discord, Telegram, and Email.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            className="bl rounded-full px-8 py-3 text-sm font-semibold shadow-lg shadow-[#0071E3]/25 active:scale-95 transition-all"
            onClick={onOpenStudio}
          >
            Open Studio →
          </button>
          <button
            type="button"
            className="ol rounded-full px-8 py-3 text-sm font-semibold active:scale-95 transition-all"
            onClick={() => onOpenAuth("signup")}
          >
            Explore Live Demo
          </button>
        </div>
      </section>

      {/* macOS Studio Simulation Window */}
      <section className="relative z-10 max-w-4xl mx-auto mt-16 md:mt-24 c overflow-hidden text-left border border-white/10 shadow-2xl">
        {/* Title Bar with Traffic Lights */}
        <div className="flex items-center gap-2 px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06]">
          <span className="w-3 h-3 rounded-full bg-[#FF453A]" />
          <span className="w-3 h-3 rounded-full bg-[#FF9F0A]" />
          <span className="w-3 h-3 rounded-full bg-[#30D158]" />
          <span className="flex-1 text-center text-xs font-medium text-[#8E8E93] pr-12">
            PromptFlow Studio Preview
          </span>
        </div>

        {/* Window Content */}
        <div className="p-6 sm:p-8">
          {/* Prompt Bar */}
          <div
            onClick={onOpenStudio}
            className="group cursor-pointer in flex items-center justify-between gap-4 p-4 hover:border-white/20 transition-all duration-200"
          >
            <span className="text-sm sm:text-base text-white/90 font-medium">
              Check tech headlines every morning at 8:00 AM and alert my Discord.
            </span>
            <span className="m text-xs text-[#8E8E93] group-hover:text-white px-2 py-1 rounded bg-white/[0.06] transition-colors">
              Return ↵
            </span>
          </div>

          <p className="m text-xs text-[#30D158] my-5 flex items-center gap-2">
            <span>✓</span> Compiled and verified · 4-step pipeline · 0 8 * * *
          </p>

          {/* 4-Step Pipeline Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="in p-4 bg-white/[0.02]">
              <span className="m text-[11px] text-[#8E8E93] font-medium tracking-wider">STEP 1</span>
              <h3 className="text-sm font-semibold text-white mt-1 mb-0.5">Scrape</h3>
              <p className="m text-xs text-[#A1A1A6] truncate">news.ycombinator.com</p>
            </div>
            <div className="in p-4 bg-white/[0.02]">
              <span className="m text-[11px] text-[#8E8E93] font-medium tracking-wider">STEP 2</span>
              <h3 className="text-sm font-semibold text-white mt-1 mb-0.5">Extract</h3>
              <p className="m text-xs text-[#A1A1A6] truncate">headlines, found</p>
            </div>
            <div className="in p-4 bg-white/[0.02]">
              <span className="m text-[11px] text-[#8E8E93] font-medium tracking-wider">STEP 3</span>
              <h3 className="text-sm font-semibold text-white mt-1 mb-0.5">Condition</h3>
              <p className="m text-xs text-[#A1A1A6] truncate">step_2.found == true</p>
            </div>
            <div className="in p-4 bg-white/[0.02]">
              <span className="m text-[11px] text-[#8E8E93] font-medium tracking-wider">STEP 4</span>
              <h3 className="text-sm font-semibold text-white mt-1 mb-0.5">Alert</h3>
              <p className="m text-xs text-[#A1A1A6] truncate">Discord embed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Minimal Feature Cards */}
      <section className="relative z-10 max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="c p-7 hover:border-white/20 transition-all duration-300">
          <span className="p text-[11px] font-semibold text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/20">
            COMPILER
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-white mt-4 mb-2">
            Natural Language Compiler
          </h3>
          <p className="text-sm text-[#A1A1A6] leading-relaxed">
            AI turns ambiguous human requests into resilient JSON schema definitions. No regex, no fragile CSS selectors.
          </p>
        </div>

        <div className="c p-7 hover:border-white/20 transition-all duration-300">
          <span className="p text-[11px] font-semibold text-[#30D158] bg-[#30D158]/10 border-[#30D158]/20">
            SCRAPING
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-white mt-4 mb-2">
            Polite &amp; Resilient Scraping
          </h3>
          <p className="text-sm text-[#A1A1A6] leading-relaxed">
            Automated user-agent rotation, intelligent parsing, and polite fallback guidance when a site restricts access (such as 403 Forbidden).
          </p>
        </div>

        <div className="c p-7 hover:border-white/20 transition-all duration-300">
          <span className="p text-[11px] font-semibold text-[#BF5AF2] bg-[#BF5AF2]/10 border-[#BF5AF2]/20">
            DELIVERY
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-white mt-4 mb-2">
            Multi-Channel Delivery
          </h3>
          <p className="text-sm text-[#A1A1A6] leading-relaxed">
            Clean formatted bullet points in rich Discord embeds, Telegram HTML messages, and automated SMTP emails.
          </p>
        </div>
      </section>

      {/* Clean Quota Glass Banner */}
      <section className="relative z-10 max-w-5xl mx-auto mt-8 g rounded-2xl p-7 sm:p-8 flex items-center gap-6 text-left border border-white/10">
        <span className="text-5xl font-bold tracking-tight text-[#30D158] select-none">
          5
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Free forever. Fair by design.
          </h2>
          <p className="text-sm text-[#A1A1A6] mt-1 leading-relaxed">
            Every user gets up to 5 concurrent active automations included free forever. No credit cards, no hidden limits.
          </p>
        </div>
      </section>

      {/* Minimalist Apple Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto mt-20 g rounded-3xl p-6 sm:p-8 text-left border border-white/10">
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <button
            type="button"
            onClick={onOpenStudio}
            className="bg-transparent border-0 p-0 text-[#A1A1A6] hover:text-white transition-colors cursor-pointer text-xs"
          >
            Studio
          </button>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="bg-transparent border-0 p-0 text-[#A1A1A6] hover:text-white transition-colors cursor-pointer text-xs"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onOpenGuide?.()}
            className="bg-transparent border-0 p-0 text-[#A1A1A6] hover:text-white transition-colors cursor-pointer text-xs"
          >
            Channel Setup Guide
          </button>
        </div>

        <p className="text-xs text-[#8E8E93] mt-4 mb-5 leading-relaxed">
          Your credentials stay securely encrypted. Scrapers respect robots rules and never store page content beyond an execution run.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="p m text-[11px]">Supabase</span>
          <span className="p m text-[11px]">Gemini AI</span>
          <span className="p m text-[11px]">Nodemailer</span>
          <span className="p m text-[11px]">Cheerio</span>
        </div>
      </footer>
    </div>
  );
};
