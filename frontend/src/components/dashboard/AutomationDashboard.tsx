import React, { useEffect, useState } from "react";
import {
  Layers,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  X,
  Plus,
  AlertTriangle,
  Play,
  RotateCcw,
  Loader2,
  Sparkles,
  Send,
  Disc as Discord,
  Mail,
  Search,
} from "lucide-react";
import type { Automation } from "../../types/pipeline";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface AutomationDashboardProps {
  onNewAutomation: () => void;
}

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ onNewAutomation }) => {
  const { profile, activeCount, setActiveCount, demoMode } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);
  const [logsModalTitle, setLogsModalTitle] = useState("");
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
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
            description: "Fetches historical events from Wikipedia and sends structured highlights to Discord",
            schedule_cron: "0 8 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://en.wikipedia.org/wiki/Portal:Current_events", max_length: 5000 } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract headlines", expected_fields: ["headlines", "date"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.headlines.length", operator: ">", value: 0 } },
              { step_id: 4, type: "notify", config: { channel: "discord", message: "Today's historical events: {{step_2.headlines}}" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-2",
            user_id: profile?.id || "demo-user",
            title: "Sony Headphones Price Watcher",
            description: "Monitors Amazon price and alerts Telegram if below £250",
            schedule_cron: "0 */2 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://amazon.com/dp/B09XS7JWHH" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract price", expected_fields: ["price"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.price", operator: "<", value: 250 } },
              { step_id: 4, type: "notify", config: { channel: "telegram", message: "Price drop: £{{step_2.price}}" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 7200000).toISOString(),
            created_at: new Date().toISOString(),
          },
        ];
        setAutomations(mockList);
        setActiveCount(2);
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
        "Active Quota Exceeded: Each user can maintain up to 5 concurrent active automations. Pause an active automation before activating this one."
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
    } catch (err: any) {
      if (err.response?.data?.message) {
        setQuotaError(err.response.data.message);
      } else {
        setQuotaError("Failed to update status. Please try again.");
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      if (!demoMode) {
        await api.deleteAutomation(id);
      }
      const deleted = automations.find((a) => a.id === id);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      if (deleted?.is_active) {
        setActiveCount((prev) => Math.max(0, prev - 1));
      }
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
        alert(`✅ "${auto.title}" completed successfully in ${report.total_duration_ms}ms!`);
      } else if (report.status === "SKIPPED") {
        alert(`ℹ️ Condition evaluated to false. Pipeline stopped cleanly (${report.total_duration_ms}ms).`);
      } else {
        alert(`⚠️ Run encountered an error: ${report.error_message || "Step failed"}`);
      }
    } catch (err: any) {
      alert("Manual execution error: " + (err.response?.data?.details || err.message));
    } finally {
      setRunningId(null);
    }
  }

  async function handleViewLogs(automation: Automation) {
    setLogsModalTitle(automation.title);
    if (demoMode) {
      setSelectedLogs([
        {
          id: "log-1",
          status: "SUCCESS",
          started_at: automation.last_run_at || new Date().toISOString(),
          step_results: [
            { step_id: 1, type: "scrape", status: "SUCCESS", duration_ms: 320 },
            { step_id: 2, type: "ai_filter", status: "SUCCESS", duration_ms: 780 },
            { step_id: 3, type: "condition", status: "SUCCESS", duration_ms: 12 },
            { step_id: 4, type: "notify", status: "SUCCESS", duration_ms: 210 },
          ],
        },
      ]);
      return;
    }

    try {
      const { data } = await supabase
        .from("execution_logs")
        .select("*")
        .eq("automation_id", automation.id)
        .order("started_at", { ascending: false })
        .limit(10);

      setSelectedLogs(data || []);
    } catch {
      setSelectedLogs([]);
    }
  }

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
    <div className="max-w-5xl mx-auto px-6 py-10 md:py-14 space-y-8 font-sans selection:bg-[#007AFF]/30 selection:text-white">
      {/* Prominent Apple Glass Quota Card */}
      <div className="apple-card p-6 md:p-8 relative overflow-hidden border border-white/[0.12] bg-[#141416]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                User Capacity & Policy
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Active Automations: <span className="text-[#007AFF]">({activeCount}/5 Active)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1A6] leading-relaxed">
              Each user can have <strong>5 active automations</strong> running on background schedules concurrently. Pause or remove an automation to free up a slot.
            </p>
          </div>

          {/* Apple Progress Gauge */}
          <div className="w-full md:w-64 p-4 rounded-xl bg-[#1C1C1E] border border-white/[0.08] space-y-2.5 text-left">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-white/70">Slot Capacity</span>
              <span className={activeCount >= 5 ? "text-[#FF9F0A] font-semibold" : "text-[#34C759] font-semibold"}>
                {activeCount} of 5 Active
              </span>
            </div>

            {/* Apple Progress Bar */}
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  activeCount >= 5 ? "bg-[#FF9F0A]" : "bg-[#34C759]"
                }`}
                style={{ width: `${Math.min(100, (activeCount / 5) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A1A1A6]">
              <span>{5 - activeCount} Slots Available</span>
              <span>Max: 5 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Exceeded Alert Banner */}
      {quotaError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-xs text-[#FF9F0A] leading-relaxed">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Quota Notice: </span>
            <span>{quotaError}</span>
          </div>
          <button
            onClick={() => setQuotaError(null)}
            className="text-white/50 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Command & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>My Automations</span>
          </h1>
          <span className="text-xs text-white/50 bg-[#1C1C1E] px-2.5 py-0.5 rounded-full border border-white/[0.08] font-mono">
            {automations.length} Total
          </span>
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="apple-input pl-8 pr-3 py-1 text-xs w-36 sm:w-44"
            />
          </div>

          {/* Cupertino Segmented Filter */}
          <div className="flex bg-[#1C1C1E] p-1 rounded-full border border-white/[0.08] text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === "all" ? "bg-white text-black font-semibold shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              All ({automations.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === "active" ? "bg-white text-black font-semibold shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              Active ({automations.filter((a) => a.is_active).length})
            </button>
            <button
              onClick={() => setFilter("paused")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filter === "paused" ? "bg-white text-black font-semibold shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              Paused ({automations.filter((a) => !a.is_active).length})
            </button>
          </div>

          <button
            onClick={() => fetchAutomations()}
            title="Refresh automations"
            className="p-2 rounded-full text-white/60 hover:text-white bg-[#1C1C1E] border border-white/[0.08] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onNewAutomation}
            className="apple-btn-primary px-4 py-1.5 text-xs font-medium gap-1 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Automation</span>
          </button>
        </div>
      </div>

      {/* Automations List View */}
      {loading ? (
        <div className="text-center py-24 text-white/50 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#007AFF]" />
          <span>Loading automations...</span>
        </div>
      ) : filteredAutomations.length === 0 ? (
        <div className="apple-card p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-white/40 mx-auto border border-white/[0.08]">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {filter === "all" ? "No Automations Created Yet" : `No ${filter} automations`}
            </h3>
            <p className="text-xs text-[#A1A1A6] max-w-sm mx-auto mt-1">
              Convert any web monitoring task into an automated cron pipeline using plain English in the Studio.
            </p>
          </div>
          <button
            onClick={onNewAutomation}
            className="apple-btn-primary px-4 py-2 text-xs font-medium gap-1.5"
          >
            <Sparkles className="h-3 w-3" />
            <span>Open Studio</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAutomations.map((auto) => {
            const notifyStep = auto.steps?.find((s: any) => s.type === "notify");
            const channel = (notifyStep?.config?.channel || "discord").toLowerCase();

            return (
              <div
                key={auto.id}
                className="apple-card p-5 md:p-6 transition-all duration-200 hover:border-white/[0.14] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-left"
              >
                {/* Left Info Column */}
                <div className="space-y-2 flex-1">
                  {/* Status Badge IN FRONT of Title (Strict Requirement) */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all ${
                        auto.is_active
                          ? "bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30"
                          : "bg-white/[0.06] text-white/50 border border-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          auto.is_active ? "bg-[#34C759] animate-pulse" : "bg-white/40"
                        }`}
                      />
                      {auto.is_active ? "ACTIVE" : "PAUSED"}
                    </span>

                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {auto.title}
                    </h3>
                  </div>

                  {auto.description && (
                    <p className="text-xs text-[#A1A1A6] line-clamp-1">{auto.description}</p>
                  )}

                  {/* Metadata and Destination Pills */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A1A1A6] pt-0.5">
                    <span className="flex items-center gap-1 font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.06]">
                      <Clock className="h-3 w-3 text-[#007AFF]" />
                      <span>{auto.schedule_cron}</span>
                    </span>

                    <span className="flex items-center gap-1 font-medium capitalize text-white/70">
                      {channel === "discord" && <Discord className="h-3 w-3 text-[#5856D6]" />}
                      {channel === "telegram" && <Send className="h-3 w-3 text-[#007AFF]" />}
                      {channel === "email" && <Mail className="h-3 w-3 text-[#34C759]" />}
                      <span>{channel}</span>
                    </span>

                    <span className="text-white/20">•</span>
                    <span>{auto.steps?.length || 4} Steps</span>

                    {auto.last_run_at && (
                      <>
                        <span className="text-white/20">•</span>
                        <span>
                          Last run:{" "}
                          {new Date(auto.last_run_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.08]">
                  {/* Run Now Trigger Button */}
                  <button
                    onClick={() => handleRunNow(auto)}
                    disabled={runningId === auto.id}
                    title="Run automation immediately"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#34C759] bg-[#34C759]/10 hover:bg-[#34C759]/20 border border-[#34C759]/25 transition-all disabled:opacity-50"
                  >
                    {runningId === auto.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 fill-[#34C759]" />
                    )}
                    <span>{runningId === auto.id ? "Running..." : "Run Now"}</span>
                  </button>

                  {/* Execution Logs Button */}
                  <button
                    onClick={() => handleViewLogs(auto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                  >
                    <History className="h-3 w-3" />
                    <span>Logs</span>
                  </button>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => handleToggle(auto.id, auto.is_active)}
                    title={auto.is_active ? "Pause automation" : "Activate automation"}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      auto.is_active ? "bg-[#34C759]" : "bg-white/[0.12]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-150 ${
                        auto.is_active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(auto.id)}
                    title="Delete automation"
                    className="p-1.5 text-white/40 hover:text-[#FF453A] rounded-full hover:bg-[#FF453A]/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execution Logs Modal */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
          <div className="bg-[#141416] border border-white/[0.12] rounded-[28px] w-full max-w-xl p-6 md:p-8 shadow-2xl relative max-h-[85vh] flex flex-col text-[#F5F5F7]">
            <button
              onClick={() => setSelectedLogs(null)}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/[0.08] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold text-white tracking-tight">
              Audit Trail: {logsModalTitle}
            </h2>
            <p className="text-xs text-[#A1A1A6] mt-1 mb-4">
              Real-time records of recent scheduled executions and step outputs.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-white/40">
                  No execution logs recorded yet. Run a test now or wait for the cron schedule.
                </div>
              ) : (
                selectedLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="bg-[#1C1C1E] p-4 rounded-xl border border-white/[0.06] text-xs space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.status === "SUCCESS" && (
                          <CheckCircle2 className="h-4 w-4 text-[#34C759]" />
                        )}
                        {log.status === "SKIPPED" && (
                          <Clock className="h-4 w-4 text-[#FF9F0A]" />
                        )}
                        {log.status === "FAILED" && (
                          <XCircle className="h-4 w-4 text-[#FF453A]" />
                        )}
                        <span className="font-semibold text-white uppercase text-[11px]">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-white/40 text-[11px] font-mono">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>

                    {log.error_message && (
                      <div className="text-[#FF453A] bg-[#FF453A]/10 p-2.5 rounded-lg border border-[#FF453A]/20 text-xs">
                        {log.error_message}
                      </div>
                    )}

                    {Array.isArray(log.step_results) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                        {log.step_results.map((stepRes: any) => (
                          <div
                            key={stepRes.step_id}
                            className="bg-black/40 p-2 rounded-lg border border-white/[0.06] text-[10px]"
                          >
                            <div className="text-white/40 font-semibold uppercase text-[9px]">
                              Step {stepRes.step_id} ({stepRes.type})
                            </div>
                            <div
                              className={`font-medium mt-0.5 ${
                                stepRes.status === "SUCCESS"
                                  ? "text-[#34C759]"
                                  : stepRes.status === "SKIPPED"
                                  ? "text-[#FF9F0A]"
                                  : "text-[#FF453A]"
                              }`}
                            >
                              {stepRes.status}
                            </div>
                            <div className="text-white/40 mt-0.5">{stepRes.duration_ms}ms</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
