import React from "react";
import { useAuth } from "../../context/AuthContext";

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
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <>
      {/* Hero Section */}
      <section style={{ maxWidth: "900px", margin: "96px auto 0", textAlign: "center" }}>
        <h1 style={{ fontSize: "60px", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-.025em" }}>
          Automate the web with plain English.
        </h1>
        <p className="s" style={{ fontSize: "17px", maxWidth: "720px", margin: "24px auto 0" }}>
          Describe what you want to monitor. PromptFlow writes the scrapers, evaluates the AI conditions, and dispatches structured alerts directly to Discord, Telegram, and Email.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", margin: "32px 0 0 0" }}>
          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="bl"
                style={{ borderRadius: "999px", padding: "0 28px", fontSize: "14px", fontWeight: 600 }}
                onClick={onOpenDashboard}
              >
                Go to Dashboard →
              </button>
              <button
                type="button"
                className="ol"
                style={{ borderRadius: "999px", padding: "0 24px", fontSize: "14px" }}
                onClick={onOpenStudio}
              >
                Open Studio
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bl"
                style={{ borderRadius: "999px", padding: "0 28px", fontSize: "14px", fontWeight: 600 }}
                onClick={() => onOpenAuth("signup")}
              >
                Get Started Free →
              </button>
              <button
                type="button"
                className="ol"
                style={{ borderRadius: "999px", padding: "0 24px", fontSize: "14px" }}
                onClick={() => onOpenAuth("signin")}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </section>

      {/* macOS Studio Simulation Window */}
      <section className="c" style={{ maxWidth: "920px", margin: "64px auto 0", borderRadius: "28px", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "8px", padding: "14px 18px", background: "rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.08)", alignItems: "center" }}>
          <i style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FF453A", display: "inline-block" }}></i>
          <i style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FF9F0A", display: "inline-block" }}></i>
          <i style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#30D158", display: "inline-block" }}></i>
          <span className="t" style={{ flex: 1, textAlign: "center", fontSize: "12px" }}>
            PromptFlow Studio
          </span>
        </div>
        <div style={{ padding: "28px" }}>
          <div
            onClick={onOpenStudio}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              cursor: "pointer",
            }}
          >
            <span>Check tech headlines every morning at 8:00 AM and alert my Discord.</span>
            <span className="m t">Return ↵</span>
          </div>
          <p className="m" style={{ color: "#30D158", margin: "20px 0 12px" }}>
            ✓ Compiled and verified · 4-step pipeline · 0 8 * * *
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
            <div className="stp" style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px" }}>
              <span className="m t">STEP 1</span>
              <h3 style={{ fontSize: "15px", margin: "4px 0" }}>Scrape</h3>
              <p className="m s">news.ycombinator.com</p>
            </div>
            <div className="stp" style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px" }}>
              <span className="m t">STEP 2</span>
              <h3 style={{ fontSize: "15px", margin: "4px 0" }}>Extract</h3>
              <p className="m s">headlines, found</p>
            </div>
            <div className="stp" style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px" }}>
              <span className="m t">STEP 3</span>
              <h3 style={{ fontSize: "15px", margin: "4px 0" }}>Condition</h3>
              <p className="m s">step_2.found == true</p>
            </div>
            <div className="stp" style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "14px" }}>
              <span className="m t">STEP 4</span>
              <h3 style={{ fontSize: "15px", margin: "4px 0" }}>Alert</h3>
              <p className="m s">Discord embed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section style={{ maxWidth: "1080px", margin: "64px auto 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
        <div className="c" style={{ padding: "28px" }}>
          <span className="p">Compiler</span>
          <h3 style={{ fontSize: "17px", letterSpacing: "-.01em", margin: "16px 0 8px" }}>Natural Language Compiler</h3>
          <p className="s">AI turns ambiguous human requests into resilient JSON schema definitions. No code, no regex.</p>
        </div>
        <div className="c" style={{ padding: "28px" }}>
          <span className="p">Scraping</span>
          <h3 style={{ fontSize: "17px", letterSpacing: "-.01em", margin: "16px 0 8px" }}>Polite &amp; Resilient Scraping</h3>
          <p className="s">User-agent rotation, intelligent parsing, and friendly explanations when a site blocks access, such as a 403 Forbidden.</p>
        </div>
        <div className="c" style={{ padding: "28px" }}>
          <span className="p">Delivery</span>
          <h3 style={{ fontSize: "17px", letterSpacing: "-.01em", margin: "16px 0 8px" }}>Multi-Channel Delivery</h3>
          <p className="s">Clean bullet lists (• ) in rich Discord embeds, Telegram HTML, and SMTP Gmail.</p>
        </div>
      </section>

      {/* Quota Banner */}
      <section className="g" style={{ maxWidth: "1080px", margin: "20px auto 0", borderRadius: "20px", padding: "32px", display: "flex", alignItems: "center", gap: "24px" }}>
        <span style={{ fontSize: "48px", fontWeight: 700, letterSpacing: "-.025em", color: "#30D158" }}>5</span>
        <div>
          <h2 style={{ fontSize: "24px", letterSpacing: "-.02em" }}>Free forever. Fair by design.</h2>
          <p className="s" style={{ marginTop: "4px" }}>Every account gets 5 active automations included free forever. No credit cards, no hidden limits.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="g" style={{ maxWidth: "1080px", margin: "64px auto 0", borderRadius: "28px", padding: "24px 32px" }}>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <a
            href="/studio"
            onClick={(e) => {
              e.preventDefault();
              onOpenStudio();
            }}
          >
            Studio
          </a>
          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              onOpenDashboard();
            }}
          >
            Dashboard
          </a>
          <a
            href="/guide"
            onClick={(e) => {
              e.preventDefault();
              onOpenGuide?.();
            }}
          >
            Channel Setup Guide
          </a>
          <a href="#privacy">Privacy</a>
        </div>
        <p className="t" style={{ margin: "12px 0 16px", fontSize: "13px" }}>
          Your credentials stay encrypted. Scrapers respect robots rules and never store page content beyond a run.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span className="p m">Supabase</span>
          <span className="p m">Gemini AI</span>
          <span className="p m">Nodemailer</span>
          <span className="p m">Cheerio</span>
        </div>
      </footer>
    </>
  );
};
