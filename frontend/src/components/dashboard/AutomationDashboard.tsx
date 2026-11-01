import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Search, Plus } from "lucide-react";
import type { Automation } from "../../types/pipeline";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { SegmentedControl } from "../common/SegmentedControl";

interface AutomationDashboardProps {
  onNewAutomation: () => void;
  onEditInStudio?: (auto: Automation) => void;
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({
  onNewAutomation,
  onEditInStudio,
}) => {
  const { profile, activeCount, setActiveCount, demoMode } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomations();
  }, [profile?.id]);

  async function fetchAutomations() {
    setLoading(true);
    try {
      if (demoMode || !profile?.id) {
        const mockList: Automation[] = [
          {
            id: "demo-auto-1",
            user_id: profile?.id || "demo-user",
            title: "Daily Historical Headlines",
            description: "Fetches historical events from timeanddate.com / Wikipedia",
            schedule_cron: "Every day at 8:00 AM",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "timeanddate.com/..." } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract headlines", expected_fields: ["headlines", "date"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.headlines.length", operator: ">", value: 0 } },
              { step_id: 4, type: "notify", config: { channel: "discord", message: "Today's headlines" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-2",
            user_id: profile?.id || "demo-user",
            title: "Hacker News Top Story",
            description: "Pings Telegram when top story exceeds threshold",
            schedule_cron: "Every hour",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "news.ycombinator.com" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract #1 story title", expected_fields: ["title"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.title", operator: "!=", value: "" } },
              { step_id: 4, type: "notify", config: { channel: "telegram", message: "HN Top Story" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-3",
            user_id: profile?.id || "demo-user",
            title: "Amazon Price Drop",
            description: "Watches item price and alerts if lower than threshold",
            schedule_cron: "Every 6 hours",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "amazon.in/dp/..." } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract price", expected_fields: ["price"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.price", operator: "<", value: 250 } },
              { step_id: 4, type: "notify", config: { channel: "email", message: "Price drop" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 14400000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-4",
            user_id: profile?.id || "demo-user",
            title: "Weekly Release Notes",
            description: "Monitors GitHub releases every Monday",
            schedule_cron: "Every Monday at 9:00 AM",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "github.com/..." } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract version", expected_fields: ["version"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.version", operator: "!=", value: "" } },
              { step_id: 4, type: "notify", config: { channel: "email", message: "Node.js Released" } },
            ],
            is_active: false,
            last_run_at: new Date(Date.now() - 86400000).toISOString(),
            created_at: new Date().toISOString(),
          },
        ];
        setAutomations(mockList);
        setActiveCount(3);
      } else {
        const { data, error } = await supabase
          .from("automations")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setAutomations(data);
          setActiveCount(data.filter((a) => a.is_active).length);
        }
      }
    } catch (err: any) {
      console.warn("Could not fetch automations:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    setQuotaError(null);
    const newStatus = !currentStatus;

    if (newStatus && activeCount >= 5) {
      setQuotaError(
        "Quota Limit: Each account can maintain up to 5 concurrent active automations. Please pause one active automation first."
      );
      return;
    }

    try {
      if (!demoMode) {
        await api.toggleAutomation(id, newStatus);
      }
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: newStatus } : a))
      );
      setActiveCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
      showToast(newStatus ? "Automation resumed" : "Automation paused");
    } catch (err: any) {
      setQuotaError(err.response?.data?.message || "Failed to update status. Please try again.");
    }
  }

  async function confirmDelete(id: string) {
    try {
      if (!demoMode) {
        await api.deleteAutomation(id);
      }
      const deleted = automations.find((a) => a.id === id);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      if (deleted?.is_active) {
        setActiveCount((prev) => Math.max(0, prev - 1));
      }
      setDeletingId(null);
      showToast("Automation deleted");
    } catch (err: any) {
      showToast("Failed to delete: " + err.message);
    }
  }

  async function handleRunNow(auto: Automation) {
    setRunningId(auto.id);
    try {
      const pipeline = {
        title: auto.title,
        description: auto.description || undefined,
        schedule_cron: auto.schedule_cron,
        steps: auto.steps,
      };
      const destinations = {
        telegram_chat_id: profile?.telegram_chat_id,
        discord_webhook_url: profile?.discord_webhook_url,
        email: profile?.email,
      };
      const report = await api.executeTestRun(pipeline, destinations);

      await fetchAutomations();

      if (report.status === "SUCCESS") {
        showToast(`✓ "${auto.title}" ran successfully (${report.total_duration_ms}ms)`);
      } else if (report.status === "SKIPPED") {
        showToast(`Condition false: pipeline halted cleanly (${report.total_duration_ms}ms)`);
      } else {
        showToast(`Run failed: ${report.error_message || "Execution error"}`);
      }
    } catch (err: any) {
      showToast("Run error: " + (err.response?.data?.details || err.message));
    } finally {
      setRunningId(null);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }

  const activeAutomationsCount = automations.filter((a) => a.is_active).length;
  const pausedAutomationsCount = automations.filter((a) => !a.is_active).length;

  const filteredAutomations = automations.filter((a) => {
    if (filter === "active" && !a.is_active) return false;
    if (filter === "paused" && a.is_active) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      style={{
        maxWidth: "1080px",
        width: "100%",
        margin: "0 auto",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="apple-spring-modal"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 80,
            background: "rgba(255,255,255,.09)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255,255,255,.16)",
            borderRadius: "14px",
            padding: "12px 20px",
            color: "#F5F5F7",
            fontSize: "13px",
            boxShadow: "0 8px 32px rgba(0,0,0,.55)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#30D158" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Glass Dialog */}
      {deletingId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0,0,0,.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div
            className="c apple-spring-modal text-left"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
              borderRadius: "20px",
              border: "1px solid rgba(255,69,58,.4)",
              boxShadow: "0 0 32px rgba(255,69,58,.2), 0 20px 48px rgba(0,0,0,.6)",
            }}
          >
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#F5F5F7" }}>
              Delete Automation?
            </h3>
            <p className="s" style={{ fontSize: "13px", margin: "8px 0 20px", lineHeight: 1.5 }}>
              This will permanently stop and remove this automation. This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="ol"
                style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dg"
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "rgba(255,69,58,.16)",
                  border: "1px solid rgba(255,69,58,.4)",
                  color: "#FF453A",
                }}
                onClick={() => confirmDelete(deletingId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-.02em" }}>Automations</h1>

        {/* Capacity Banner */}
        <section className="g" style={{ marginTop: "20px", borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-.01em" }}>Automation capacity</h2>
            <span className="p on" style={{ fontSize: "12.5px", fontWeight: 600 }}>
              Active Automations: ({activeCount}/5 Active)
            </span>
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,.12)",
              margin: "16px 0 12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (activeCount / 5) * 100)}%`,
                height: "100%",
                background: "#30D158",
                borderRadius: "999px",
                transformOrigin: "left",
                animation: "grow 1.4s cubic-bezier(.16,1,.3,1) .4s backwards",
                boxShadow: "0 0 12px rgba(48,209,88,.6)",
              }}
            />
          </div>
          <p className="s" style={{ fontSize: "13px" }}>
            Each account can maintain up to 5 concurrent active automations. Pause or remove an automation to activate another.
          </p>
        </section>

        {/* Quota Error Notification if any */}
        {quotaError && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(255,159,10,.14)",
              border: "1px solid rgba(255,159,10,.3)",
              color: "#FF9F0A",
              fontSize: "13px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{quotaError}</span>
            <button
              type="button"
              onClick={() => setQuotaError(null)}
              style={{ background: "transparent", border: 0, color: "#FF9F0A", cursor: "pointer", padding: "0 4px" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Search, Filter, New Automation Bar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "24px 0", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", width: "280px" }}>
            <input
              aria-label="Filter automations"
              placeholder="Filter automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: "12px",
                padding: "9px 14px 9px 34px",
                color: "#F5F5F7",
                fontSize: "13px",
                outline: 0,
              }}
            />
            <Search
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "#8E8E93",
                pointerEvents: "none",
              }}
            />
          </div>

          <SegmentedControl<"all" | "active" | "paused">
            name="fl"
            options={[
              { value: "all", label: `All (${automations.length})` },
              { value: "active", label: `Active (${activeAutomationsCount})` },
              { value: "paused", label: `Paused (${pausedAutomationsCount})` },
            ]}
            value={filter}
            onChange={(val) => setFilter(val)}
            style={{ width: "310px" }}
          />

          <span style={{ flex: 1 }} />

          <button
            type="button"
            className="bl"
            style={{
              minHeight: "40px",
              padding: "0 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 4px 16px rgba(10,113,227,.4)",
            }}
            onClick={onNewAutomation}
          >
            <Plus style={{ width: "15px", height: "15px" }} />
            <span>New Automation</span>
          </button>
        </div>

        {/* Grid of Automation Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#A1A1A6" }}>
            <Loader2 style={{ width: "24px", height: "24px", margin: "0 auto 12px", color: "#0A84FF" }} className="animate-spin" />
            <p className="s" style={{ fontSize: "13px" }}>Loading automations...</p>
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="c" style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600 }}>
              {filter === "all" ? "No automations yet." : `No ${filter} automations found.`}
            </p>
            <p className="s" style={{ marginTop: "6px", fontSize: "13px" }}>
              Create your first automation in the Studio using plain English.
            </p>
            <button
              type="button"
              className="bl"
              style={{ marginTop: "20px", borderRadius: "999px", padding: "0 24px", minHeight: "38px" }}
              onClick={onNewAutomation}
            >
              Open Studio
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {filteredAutomations.map((auto, index) => {
              const scrapeStep = auto.steps?.find((s: any) => s.type === "scrape");
              const notifyStep = auto.steps?.find((s: any) => s.type === "notify");
              const channel = notifyStep?.config?.channel || "discord";
              const rawUrl = scrapeStep?.config?.url || "news.ycombinator.com";
              const targetUrl = rawUrl.replace(/^https?:\/\//, "");
              const isFirstCard = index === 0;

              return (
                <div
                  key={auto.id}
                  className="c"
                  style={isFirstCard ? { gridRow: "span 2", padding: "22px" } : { padding: "22px" }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className={`p ${auto.is_active ? "on" : ""}`}>
                      ● {auto.is_active ? "ACTIVE" : "PAUSED"}
                    </span>
                    <h3 className="t1" style={{ margin: 0, fontSize: "15.5px" }}>{auto.title}</h3>
                  </div>

                  <div className="row" style={{ marginTop: "12px" }}>
                    <span className="p">◷ {auto.schedule_cron}</span>
                    <span className="p" style={{ textTransform: "capitalize" }}>
                      {channel}
                    </span>
                    {channel === "discord" && <span className="p">Email</span>}
                  </div>

                  <div className="row" style={{ marginTop: "8px" }}>
                    <span className="p m" style={{ fontSize: "11.5px" }}>{targetUrl}</span>
                  </div>

                  {/* Clean Button Action Row with Proper Margins & Padding */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <button
                      type="button"
                      className="ol"
                      style={{
                        padding: "7px 13px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        minHeight: "34px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      disabled={runningId === auto.id}
                      onClick={() => handleRunNow(auto)}
                    >
                      {runningId === auto.id ? (
                        <>
                          <Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <span>▶ Run Now</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="ol"
                      style={{
                        padding: "7px 13px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        minHeight: "34px",
                        color: auto.is_active ? "#A1A1A6" : "#30D158",
                      }}
                      onClick={() => handleToggle(auto.id, auto.is_active)}
                    >
                      {auto.is_active ? "Pause" : "Resume"}
                    </button>

                    <button
                      type="button"
                      className="ol"
                      style={{
                        padding: "7px 13px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        minHeight: "34px",
                      }}
                      onClick={() => (onEditInStudio ? onEditInStudio(auto) : onNewAutomation())}
                    >
                      Edit in Studio
                    </button>

                    <button
                      type="button"
                      className="dg"
                      style={{
                        padding: "7px 13px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        minHeight: "34px",
                        background: "rgba(255,69,58,.08)",
                        border: "1px solid rgba(255,69,58,.3)",
                        color: "#FF453A",
                      }}
                      onClick={() => setDeletingId(auto.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {isFirstCard && (
                    <div
                      style={{
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid rgba(255,255,255,.07)",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        marginTop: "16px",
                      }}
                    >
                      <p className="t" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: ".02em", marginBottom: "8px" }}>
                        RECENT RUNS
                      </p>
                      <p className="m" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px" }}>
                        <span>Today 8:00 AM · 412ms</span>
                        <span style={{ color: "#30D158" }}>Success</span>
                      </p>
                      <p className="m s" style={{ padding: "0 0 6px", fontSize: "11.5px" }}>
                        • 1512: Sistine Chapel ceiling is first shown
                      </p>
                      <p
                        className="m"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderTop: "1px solid rgba(255,255,255,.07)",
                          fontSize: "12px",
                        }}
                      >
                        <span>Yesterday 8:00 AM · 388ms</span>
                        <span style={{ color: "#30D158" }}>Success</span>
                      </p>
                      <p
                        className="m"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderTop: "1px solid rgba(255,255,255,.07)",
                          fontSize: "12px",
                        }}
                      >
                        <span>Oct 30 8:00 AM · 1.2s</span>
                        <span style={{ color: "#FF453A" }}>Failed</span>
                      </p>
                      <p className="m s" style={{ fontSize: "11.5px" }}>403 Forbidden: website access restricted</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
