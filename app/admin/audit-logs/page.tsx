"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuditEvent = {
  actor_name: string | null;
  actor_user_id: number | null;
  affected_name: string | null;
  affected_user_id: number | null;
  event: string;
  outcome: string;
  details: string | Record<string, unknown> | null;
  created_at: string;
};

export default function AdminAuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/access-management/audit", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load audit logs.");
      setEvents(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  return (
    <section className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-white/10 p-3">
            <Activity aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">System Audit Logs</h1>
            <p className="mt-1 text-sm text-blue-100">Recent account and access-management activity.</p>
          </div>
        </div>
        <Button onClick={() => void loadAudit()} variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Loading audit logs…
          </div>
        ) : events.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No audit activity found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Affected account</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((event, index) => (
                  <tr className="text-slate-700 dark:text-slate-200" key={`${event.created_at}-${index}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{event.actor_name || `Account ${event.actor_user_id ?? "system"}`}</td>
                    <td className="px-4 py-3">{event.affected_name || (event.affected_user_id ? `Account ${event.affected_user_id}` : "—")}</td>
                    <td className="px-4 py-3 font-medium">{event.event}</td>
                    <td className="px-4 py-3 capitalize">{event.outcome}</td>
                    <td className="max-w-sm px-4 py-3 text-xs text-slate-500">
                      <code className="break-all">{typeof event.details === "string" ? event.details : event.details ? JSON.stringify(event.details) : "—"}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
          Showing the latest {events.length} events.
        </div>
      </div>
    </section>
  );
}
