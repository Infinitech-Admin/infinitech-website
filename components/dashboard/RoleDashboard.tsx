"use client";
// components/dashboard/RoleDashboard.tsx

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { getAuthorizedNavSections } from "@/lib/admin-navigation";
import {
  DASHBOARDS,
  type DashboardRole,
  type SessionLike,
} from "@/lib/role-dashboards";

type Tone = "blue" | "amber" | "emerald" | "rose" | "violet" | "cyan";
type Stat = { label: string; value: string | number; tone?: Tone };
type ChartData = {
  key: string;
  type: "line" | "bar";
  title: string;
  description?: string;
  data: { name: string; value: number }[];
};

// Full class names so Tailwind can see them.
const TONE_BORDER: Record<Tone, string> = {
  blue: "border-t-blue-500",
  amber: "border-t-amber-500",
  emerald: "border-t-emerald-500",
  rose: "border-t-rose-500",
  violet: "border-t-violet-500",
  cyan: "border-t-cyan-500",
};
const PALETTE = [
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#8b5cf6",
  "#0891b2",
];

// Nav items/sections come from admin-navigation; read label fields defensively.
const textOf = (value: object, fallback: string) => {
  const record = value as Record<string, unknown>;
  return String(record.label ?? record.title ?? record.name ?? fallback);
};

function ChartCard({ chart }: { chart: ChartData }) {
  const hasData = chart.data.some((point) => point.value > 0);
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${
        chart.type === "line" ? "lg:col-span-2" : ""
      }`}
    >
      <h2 className="text-base font-semibold text-slate-900">{chart.title}</h2>
      {chart.description && (
        <p className="text-sm text-slate-500">{chart.description}</p>
      )}
      {!hasData ? (
        <p className="py-16 text-center text-sm text-slate-500">No data yet.</p>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "line" ? (
              <LineChart
                data={chart.data}
                margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={chart.data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 12, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  {chart.data.map((_, index) => (
                    <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function RoleDashboard({
  role,
  session,
}: {
  role: DashboardRole;
  session: SessionLike;
}) {
  const config = DASHBOARDS[role];
  const Icon = config.icon;
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setError("");
      const res = await adminFetch(`/api/admin/dashboard/${role}`, {
        cache: "no-store",
      });
      if (!res.ok)
        throw new Error(
          `Live statistics are unavailable (HTTP ${res.status}).`,
        );
      const data = await res.json();
      setStats(data.stats ?? []);
      setCharts(data.charts ?? []);
    } catch (failure) {
      setStats((current) => current ?? []);
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to load statistics.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  // Real links, filtered by this user's permissions.
  const sections = useMemo(
    () =>
      getAuthorizedNavSections(
        (session.permissions ?? []).map((p) => p.key),
        session.is_superadmin === true,
      )
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => item.href !== "/admin/dashboard",
          ),
        }))
        .filter((section) => section.items.length > 0),
    [session],
  );

  return (
    <div className="space-y-6 pb-8">
      <header
        className={`rounded-3xl bg-gradient-to-r ${config.gradient} px-6 py-8 text-white shadow-lg sm:px-9`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Icon aria-hidden="true" className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {config.title}
              </h1>
              <p className="mt-1 text-sm text-white/80">{config.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <p
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          {error}
        </p>
      )}

      {stats === null ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-t-4 border-slate-200 ${TONE_BORDER[stat.tone ?? "blue"]} bg-white p-4 shadow-sm`}
              >
                <p className="truncate text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
            ))}
          </div>
        )
      )}

      {charts.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {charts.map((chart) => (
            <ChartCard key={chart.key} chart={chart} />
          ))}
        </div>
      )}

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No directories are assigned to your account yet. Contact a superadmin
          to request access.
        </p>
      ) : (
        sections.map((section, index) => (
          <section key={textOf(section, String(index))}>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              {textOf(section, "Directories")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 shadow-sm transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {textOf(item, item.href)}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
