import React, { useEffect, useState } from "react";
import {
  Layers,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  X,
  PlusCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Loader2,
  Bell,
  Sparkles,
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

  useEffect(() => {
    fetchAutomations();
  }, [profile?.id]);

  async function fetchAutomations() {
    setLoading(true);
    try {
      if (demoMode || !profile?.id) {
        // Mock sample automation for demo mode
        const mockList: Automation[] = [
          {
            id: "demo-auto-1",
            user_id: profile?.id || "demo-user",
            title: "Daily Exam Timetable Watcher",
            description: "Monitors university notices for 7th-sem schedules",
            schedule_cron: "0 9 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://www.rgpv.ac.in", max_length: 5000 } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Find timetable", expected_fields: ["found", "title"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.found", operator: "==", value: true } },
              { step_id: 4, type: "notify", config: { channel: "telegram", message: "Schedule released: {{step_2.title}}" } },
            ],
            is_active: true,
            last_run_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-auto-2",
            user_id: profile?.id || "demo-user",
            title: "Hacker News #1 Story Watcher",
            description: "Pings Discord when the top story surpasses 100 upvotes",
            schedule_cron: "0 */2 * * *",
            steps: [
              { step_id: 1, type: "scrape", config: { url: "https://news.ycombinator.com" } },
              { step_id: 2, type: "ai_filter", config: { instruction: "Extract #1 story title and points", expected_fields: ["title", "points"] } },
              { step_id: 3, type: "condition", config: { field: "step_2.points", operator: ">", value: 100 } },
              { step_id: 4, type: "notify", config: { channel: "discord", message: "🔥 Top HN Story: {{step_2.title}}" } },
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
        "Quota Limit Exceeded: Each user can have a maximum of 5 active automations. Please pause one active automation before activating this one."
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
        alert(`✅ "${auto.title}" ran successfully in ${report.total_duration_ms}ms!`);
      } else if (report.status === "SKIPPED") {
        alert(`ℹ️ Condition evaluated to false. Pipeline execution halted cleanly (${report.total_duration_ms}ms).`);
      } else {
        alert(`⚠️ Run encountered an issue: ${report.error_message || "Step failed"}`);
      }
    } catch (err: any) {
      alert("Manual run error: " + (err.response?.data?.details || err.message));
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
            { step_id: 2, type: "ai_filter", status: "SUCCESS", duration_ms: 810 },
            { step_id: 3, type: "condition", status: "SUCCESS", duration_ms: 10 },
            { step_id: 4, type: "notify", status: "SUCCESS", duration_ms: 240 },
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
    if (filter === "active") return a.is_active;
    if (filter === "paused") return !a.is_active;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-fadeIn">
      {/* Quota Banner & Progress Gauge */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                User Automation Quota
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Active Automations: <span className="text-sky-400">({activeCount} / 5)</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Notice:</strong> Each user can have up to <strong>5 active automations</strong> running on background schedules simultaneously. Paused automations do not count towards your active quota.
            </p>
          </div>

          {/* Visual Meter Gauge */}
          <div className="w-full md:w-64 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Active Capacity</span>
              <span className={activeCount >= 5 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {Math.round((activeCount / 5) * 100)}% Used
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeCount >= 5
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-md shadow-amber-500/30"
                    : "bg-gradient-to-r from-sky-500 to-emerald-500 shadow-md shadow-sky-500/20"
                }`}
                style={{ width: `${Math.min(100, (activeCount / 5) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>{activeCount} Running</span>
              <span>{Math.max(0, 5 - activeCount)} Slots Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Error Alert */}
      {quotaError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 leading-relaxed shadow-lg">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Quota Alert: </span>
            <span>{quotaError}</span>
          </div>
          <button
            onClick={() => setQuotaError(null)}
            className="text-amber-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <span>My Automations</span>
          </h1>
          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 font-mono">
            {automations.length} total
          </span>
        </div>

        {/* Action Controls & Filter */}
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({automations.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === "active" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Active ({automations.filter((a) => a.is_active).length})
            </button>
            <button
              onClick={() => setFilter("paused")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === "paused" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Paused ({automations.filter((a) => !a.is_active).length})
            </button>
          </div>

          <button
            onClick={() => fetchAutomations()}
            title="Refresh automations from database"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onNewAutomation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Create New</span>
          </button>
        </div>
      </div>

      {/* Automations Cards List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
          <span>Loading automations...</span>
        </div>
      ) : filteredAutomations.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Layers className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {filter === "all" ? "No Automations Created Yet" : `No ${filter} automations found`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Prompt your first autonomous web monitor in the Studio. It takes seconds to configure and deploy!
            </p>
          </div>
          <button
            onClick={onNewAutomation}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open Studio</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAutomations.map((auto) => {
            const notifyStep = auto.steps?.find((s: any) => s.type === "notify");
            const channel = notifyStep?.config?.channel || "telegram";

            return (
              <div
                key={auto.id}
                className="group p-5 md:p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left Info Column */}
                <div className="space-y-2 flex-1">
                  {/* Status in front of title as requested */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                        auto.is_active
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          auto.is_active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      {auto.is_active ? "Active" : "Paused"}
                    </span>

                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {auto.title}
                    </h3>
                  </div>

                  {auto.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">{auto.description}</p>
                  )}

                  {/* Metadata and Step preview pills */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3 text-sky-400" />
                      <span>{auto.schedule_cron}</span>
                    </span>

                    <span className="text-slate-600">•</span>

                    <span className="flex items-center gap-1 text-slate-400">
                      <span>{auto.steps?.length || 4} Steps</span>
                    </span>

                    <span className="text-slate-600">•</span>

                    <span className="flex items-center gap-1 uppercase font-semibold text-sky-400">
                      <Bell className="h-3 w-3" />
                      <span>{channel}</span>
                    </span>

                    {auto.last_run_at && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          Last run: {new Date(auto.last_run_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  {/* Run Now Trigger Button */}
                  <button
                    onClick={() => handleRunNow(auto)}
                    disabled={runningId === auto.id}
                    title="Execute automation immediately in sandbox"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {runningId === auto.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                    )}
                    <span>{runningId === auto.id ? "Running..." : "Run Now"}</span>
                  </button>

                  {/* Execution Logs Button */}
                  <button
                    onClick={() => handleViewLogs(auto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>Logs</span>
                  </button>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => handleToggle(auto.id, auto.is_active)}
                    title={auto.is_active ? "Click to Pause" : "Click to Activate"}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      auto.is_active ? "bg-sky-600 shadow-sm shadow-sky-600/30" : "bg-slate-800"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        auto.is_active ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(auto.id)}
                    title="Delete automation"
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Execution Logs Modal */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedLogs(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              Audit Trail: {logsModalTitle}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Real-time log of recent scheduled executions and step outputs.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedLogs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No execution logs recorded yet. Run a manual test or wait for the scheduled cron run.
                </div>
              ) : (
                selectedLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.status === "SUCCESS" && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                        {log.status === "SKIPPED" && (
                          <Clock className="h-4 w-4 text-slate-400" />
                        )}
                        {log.status === "FAILED" && (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                        <span className="font-bold text-white uppercase">{log.status}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>

                    {log.error_message && (
                      <div className="text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-xs">
                        {log.error_message}
                      </div>
                    )}

                    {Array.isArray(log.step_results) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                        {log.step_results.map((stepRes: any) => (
                          <div
                            key={stepRes.step_id}
                            className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]"
                          >
                            <div className="text-slate-500 font-bold uppercase text-[9px]">
                              Step {stepRes.step_id} ({stepRes.type})
                            </div>
                            <div
                              className={`font-semibold mt-0.5 ${
                                stepRes.status === "SUCCESS"
                                  ? "text-emerald-400"
                                  : stepRes.status === "SKIPPED"
                                  ? "text-slate-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {stepRes.status}
                            </div>
                            <div className="text-slate-600 text-[10px]">
                              {stepRes.duration_ms}ms
                            </div>
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
