import React, { useEffect, useState } from "react";
import {
  Layers,
  Calendar,
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
} from "lucide-react";
import type { Automation } from "../../types/pipeline";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface AutomationListProps {
  onNewAutomation: () => void;
}

export const AutomationList: React.FC<AutomationListProps> = ({ onNewAutomation }) => {
  const { profile, activeCount, setActiveCount, demoMode } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<any[] | null>(null);
  const [logsModalTitle, setLogsModalTitle] = useState("");
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

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
        ];
        setAutomations(mockList);
        setActiveCount(1);
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
      setQuotaError("Account Quota Exceeded: You cannot have more than 5 active automations. Please deactivate one first.");
      return;
    }

    try {
      if (!demoMode) {
        await api.toggleAutomation(id, newStatus);
      }
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: newStatus } : a))
      );
      setActiveCount((prev) => (newStatus ? prev + 1 : prev - 1));
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

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-sky-400" />
            My Automations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your autonomous web-monitoring pipelines and review live run history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAutomations()}
            title="Refresh automations list"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onNewAutomation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            Create New
          </button>
        </div>
      </div>

      {/* Quota Error Alert */}
      {quotaError && (
        <div className="mb-6 flex items-center gap-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{quotaError}</span>
        </div>
      )}

      {/* Automations Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading automations...</div>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
          <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No Automations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Prompt your first web monitor on the Studio tab, test it in the sandbox, and save it here.
          </p>
          <button
            onClick={onNewAutomation}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500"
          >
            Open Studio
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-white">{auto.title}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      auto.is_active
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-500"
                    }`}
                  >
                    {auto.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                {auto.description && (
                  <p className="text-xs text-slate-400">{auto.description}</p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    {auto.schedule_cron}
                  </span>
                  <span>•</span>
                  <span>{auto.steps.length} Pipeline Steps</span>
                  {auto.last_run_at && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last Run: {new Date(auto.last_run_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRunNow(auto)}
                  disabled={runningId === auto.id}
                  title="Run this automation immediately"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {runningId === auto.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-emerald-400" />
                  )}
                  <span>{runningId === auto.id ? "Running..." : "Run Now"}</span>
                </button>

                <button
                  onClick={() => handleViewLogs(auto)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <History className="h-3.5 w-3.5" />
                  Logs
                </button>

                {/* Active Toggle Switch */}
                <button
                  onClick={() => handleToggle(auto.id, auto.is_active)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    auto.is_active ? "bg-sky-600" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      auto.is_active ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleDelete(auto.id)}
                  title="Delete automation"
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Logs Modal */}
      {selectedLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedLogs(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-base font-bold text-white mb-1">
              Execution Logs: {logsModalTitle}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Audit trail of recent automated executions and step outputs.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3">
              {selectedLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No execution logs recorded yet.
                </div>
              ) : (
                selectedLogs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
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
                      <span className="text-slate-500 text-[11px]">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </div>

                    {log.error_message && (
                      <div className="text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                        {log.error_message}
                      </div>
                    )}

                    {Array.isArray(log.step_results) && (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {log.step_results.map((stepRes: any) => (
                          <div
                            key={stepRes.step_id}
                            className="bg-slate-900 p-2 rounded-lg border border-slate-800/80 text-[11px]"
                          >
                            <div className="text-slate-500 font-bold uppercase text-[9px]">
                              Step {stepRes.step_id} ({stepRes.type})
                            </div>
                            <div
                              className={`font-semibold ${
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
