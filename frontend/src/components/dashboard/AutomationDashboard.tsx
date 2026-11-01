import React, { useEffect, useState } from "react";
import { Loader2, Play, Search, Trash2, Edit3, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import type { Automation } from "../../types/pipeline";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

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
            schedule_cron: "0 8 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://www.timeanddate.com/on-this-day/", max_length: 5000 } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract headlines", expected_fields: ["headlines", "date"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.headlines.length", operator: ">", value: 0 } },
              { step_id: 4, type: "notify", config: { channel: "discord", message: "Today's headlines: {{step_2.headlines}}" } },
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
            schedule_cron: "0 * * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://news.ycombinator.com" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract #1 story title", expected_fields: ["title"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.title", operator: "!=", value: "" } },
              { step_id: 4, type: "notify", config: { channel: "telegram", message: "HN Top Story: {{step_2.title}}" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-3",
            user_id: profile?.id || "demo-user",
            title: "Amazon Price Drop Alert",
            description: "Watches item price and alerts if lower than threshold",
            schedule_cron: "0 */6 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://amazon.in/dp/B09XS7JWHH" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract price", expected_fields: ["price"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.price", operator: "<", value: 250 } },
              { step_id: 4, type: "notify", config: { channel: "email", message: "Price drop: £{{step_2.price}}" } },
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
            schedule_cron: "0 9 * * 1",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://github.com/nodejs/node/releases" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract version and changes", expected_fields: ["version"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.version", operator: "!=", value: "" } },
              { step_id: 4, type: "notify", config: { channel: "email", message: "Node.js Released: {{step_2.version}}" } },
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
        "Quota Limit Reached: Each user can maintain up to 5 concurrent active automations. Please pause one active automation first."
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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this automation? This action cannot be undone.")) return;
    try {
      if (!demoMode) {
        await api.deleteAutomation(id);
      }
      const deleted = automations.find((a) => a.id === id);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      if (deleted?.is_active) {
        setActiveCount((prev) => Math.max(0, prev - 1));
      }
      showToast("Automation deleted");
    } catch (err: any) {
      alert("Failed to delete automation: " + err.message);
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
        showToast(`✓ "${auto.title}" ran successfully in ${report.total_duration_ms}ms`);
      } else if (report.status === "SKIPPED") {
        showToast(`Condition false: pipeline halted cleanly (${report.total_duration_ms}ms)`);
      } else {
        showToast(`Run failed: ${report.error_message || "Error during step execution"}`);
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
    }, 3000);
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
    <div className="relative min-h-full box-border px-6 py-10 bg-black text-[#F5F5F7]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 g border border-white/20 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white shadow-2xl backdrop-blur-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto text-left space-y-6">
        {/* Page Title & New Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Automations
          </h1>
          <button
            type="button"
            className="bl rounded-full px-5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 active:scale-95 transition-all min-h-0 shadow-lg shadow-[#0071E3]/25"
            onClick={onNewAutomation}
          >
            <Plus className="w-4 h-4" />
            <span>New Automation</span>
          </button>
        </div>

        {/* Quota Banner Section (Mention user active automations 3/5) */}
        <section className="g rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Automation Capacity
              </h2>
              <p className="text-xs text-[#A1A1A6] mt-0.5">
                Each user can have 5 active automations. Pause an automation to activate another.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
              <span className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158] animate-pulse" />
              <span className="text-xs font-semibold text-[#30D158]">
                Active Automations: ({activeCount}/5 Active)
              </span>
            </div>
          </div>

          {/* Apple Progress Bar */}
          <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#30D158] to-[#34C759] rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(48,209,88,0.5)]"
              style={{ width: `${Math.min(100, (activeCount / 5) * 100)}%` }}
            />
          </div>
        </section>

        {/* Quota Alert Banner */}
        {quotaError && (
          <div className="p-4 rounded-xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-xs text-[#FF9F0A] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{quotaError}</span>
            </div>
            <button
              type="button"
              onClick={() => setQuotaError(null)}
              className="text-[#FF9F0A] hover:text-white transition-colors min-h-0 p-0 text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-sm">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Filter automations"
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white placeholder-[#8E8E93] focus:border-[#0A84FF] focus:outline-none transition-all"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`min-h-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                filter === "all"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-[#A1A1A6] hover:text-white"
              }`}
            >
              All ({automations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`min-h-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                filter === "active"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-[#A1A1A6] hover:text-white"
              }`}
            >
              Active ({activeAutomationsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("paused")}
              className={`min-h-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                filter === "paused"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-[#A1A1A6] hover:text-white"
              }`}
            >
              Paused ({pausedAutomationsCount})
            </button>
          </div>
        </div>

        {/* Automations Grid */}
        {loading ? (
          <div className="text-center py-20 text-[#A1A1A6]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#0A84FF]" />
            <p className="text-xs font-medium">Loading automations...</p>
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="c text-center py-16 px-6 border border-white/10">
            <p className="text-base font-semibold text-white">
              {filter === "all" ? "No automations yet." : `No ${filter} automations found.`}
            </p>
            <p className="text-xs text-[#A1A1A6] mt-1 max-w-sm mx-auto">
              Create your first automation in the Studio in plain English.
            </p>
            <button
              type="button"
              className="bl rounded-full px-6 py-2.5 text-xs font-semibold mt-5 min-h-0 active:scale-95 transition-all"
              onClick={onNewAutomation}
            >
              Open Studio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAutomations.map((auto) => {
              const scrapeStep = auto.steps?.find((s: any) => s.type === "scrape");
              const notifyStep = auto.steps?.find((s: any) => s.type === "notify");
              const channel = notifyStep?.config?.channel || "discord";
              const targetUrl = scrapeStep?.config?.url || "news.ycombinator.com";

              return (
                <div
                  key={auto.id}
                  className="c p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Top Header: Active badge in front of title as requested */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shrink-0 ${
                            auto.is_active
                              ? "bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/25"
                              : "bg-white/[0.06] text-[#8E8E93] border border-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              auto.is_active ? "bg-[#30D158]" : "bg-[#8E8E93]"
                            }`}
                          />
                          {auto.is_active ? "ACTIVE" : "PAUSED"}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                          {auto.title}
                        </h3>
                      </div>
                    </div>

                    {/* Meta Tags: Schedule & Channel */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-[#A1A1A6] mb-3">
                      <span className="p text-[11px] bg-white/[0.04]">
                        ◷ {auto.schedule_cron}
                      </span>
                      <span className="p text-[11px] bg-white/[0.04] capitalize">
                        {channel}
                      </span>
                      <span className="m text-[11px] text-[#8E8E93] truncate max-w-[200px]">
                        {targetUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </div>

                    {/* Short Description */}
                    {auto.description && (
                      <p className="text-xs text-[#8E8E93] line-clamp-1 mb-4 leading-relaxed">
                        {auto.description}
                      </p>
                    )}
                  </div>

                  {/* Clean Bottom Controls: Apple Buttons with Spring Dynamics */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="ol rounded-full px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 min-h-0 active:scale-95 transition-all"
                        disabled={runningId === auto.id}
                        onClick={() => handleRunNow(auto)}
                      >
                        {runningId === auto.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                        ) : (
                          <Play className="w-3 h-3 text-white fill-white" />
                        )}
                        <span>{runningId === auto.id ? "Running..." : "Run Now"}</span>
                      </button>

                      <button
                        type="button"
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium min-h-0 active:scale-95 transition-all ${
                          auto.is_active
                            ? "ol text-[#A1A1A6] hover:text-white"
                            : "bl font-semibold"
                        }`}
                        onClick={() => handleToggle(auto.id, auto.is_active)}
                      >
                        {auto.is_active ? "Pause" : "Resume"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onEditInStudio ? onEditInStudio(auto) : onNewAutomation()
                        }
                        className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#8E8E93] hover:text-white transition-all min-h-0"
                        title="Edit in Studio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(auto.id)}
                        className="p-1.5 rounded-full hover:bg-[#FF453A]/10 text-[#8E8E93] hover:text-[#FF453A] transition-all min-h-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
