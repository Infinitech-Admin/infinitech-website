"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Inbox,
  Layers3,
  RefreshCw,
} from "lucide-react";

import { adminFetch } from "@/lib/admin-fetch";
import {
  getAuthorizedNavSections,
  hasDirectoryAccess,
} from "@/lib/admin-navigation";

// ---------- Types ----------

interface RequestRecord {
  id?: string | number;
  status?: string;
  created_at?: string;
}

interface CategoryData {
  key: string;
  label: string;
  endpoint: string;
  directory: string;
  records: RequestRecord[];
}

interface DashboardStats {
  totalRequests: number;
  recentRequests: number;
  needsAttention: number;
  completedRequests: number;
}

const CATEGORY_CONFIG: Omit<CategoryData, "records">[] = [
  {
    key: "supportTickets",
    label: "Support Tickets",
    endpoint: "/api/support-tickets",
    directory: "support_tickets",
  },
  {
    key: "graphicDesign",
    label: "Graphic Design",
    endpoint: "/api/graphic-design-requests",
    directory: "graphic_design",
  },
  {
    key: "marketResearch",
    label: "Market Research",
    endpoint: "/api/market-research-requests",
    directory: "market_research",
  },
  {
    key: "paidAds",
    label: "Paid Ads",
    endpoint: "/api/paid-ads-requests",
    directory: "paid_ads",
  },
  {
    key: "socialMedia",
    label: "Social Media",
    endpoint: "/api/social-media-requests",
    directory: "social_media_management",
  },
  {
    key: "tiktokShop",
    label: "TikTok Shop",
    endpoint: "/api/tiktok-shop-requests",
    directory: "tiktok_shop",
  },
];

const COLORS = {
  cyan: "#0891b2",
  blue: "#2563eb",
  cyanLight: "#67e8f9",
  emerald: "#10b981",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  rose: "#f43f5e",
};

const CATEGORY_COLORS = [
  COLORS.cyan,
  COLORS.blue,
  COLORS.violet,
  COLORS.amber,
  COLORS.rose,
  COLORS.emerald,
];

const STATUS_COLORS: Record<string, string> = {
  open: COLORS.blue,
  in_progress: COLORS.amber,
  resolved: COLORS.emerald,
};

const ATTENTION_STATUSES = new Set([
  "open",
  "pending",
  "in_progress",
  "contacted",
  "on_hold",
]);
const COMPLETED_STATUSES = new Set([
  "resolved",
  "closed",
  "completed",
  "approved",
  "rejected",
]);

function extractRecords(payload: unknown): RequestRecord[] {
  if (Array.isArray(payload)) return payload as RequestRecord[];
  if (!payload || typeof payload !== "object") return [];

  const data = (payload as { data?: unknown }).data;
  return data === undefined ? [] : extractRecords(data);
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type WebsiteDirectoryStats = {
  total: number;
  in_progress: number;
  on_hold: number;
  completed: number;
  in_testing: number;
  qa_needs_attention: number;
};

function WebsiteDirectorySummary() {
  const [websiteStats, setWebsiteStats] =
    useState<WebsiteDirectoryStats | null>(null);
  const [websiteStatsError, setWebsiteStatsError] = useState("");

  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/websites/stats", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Unable to load website statistics.",
          );
        if (active) setWebsiteStats(result.data as WebsiteDirectoryStats);
      })
      .catch((loadError: unknown) => {
        console.error("Website dashboard summary failed:", loadError);
        if (active)
          setWebsiteStatsError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load website statistics.",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  const cards = websiteStats
    ? [
        {
          label: "Total Websites",
          value: websiteStats.total,
          href: "/admin/website-directory",
          accent: "border-l-cyan-500",
        },
        {
          label: "Projects In Progress",
          value: websiteStats.in_progress,
          href: "/admin/website-directory?status=In%20Progress",
          accent: "border-l-blue-500",
        },
        {
          label: "Projects On Hold",
          value: websiteStats.on_hold,
          href: "/admin/website-directory?status=On%20Hold",
          accent: "border-l-amber-500",
        },
        {
          label: "Projects Completed",
          value: websiteStats.completed,
          href: "/admin/website-directory?status=Completed",
          accent: "border-l-emerald-500",
        },
        {
          label: "Projects in Testing",
          value: websiteStats.in_testing,
          href: "/admin/website-directory?phase=Testing",
          accent: "border-l-violet-500",
        },
        {
          label: "QA Needs Attention",
          value: websiteStats.qa_needs_attention,
          href: "/admin/website-directory?qa_status=attention",
          accent: "border-l-rose-500",
        },
      ]
    : [];

  return (
    <section aria-label="Website project summary" className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Website projects
        </h2>
        <p className="text-sm text-slate-500">
          Live counts from the Website Directory.
        </p>
      </div>
      {websiteStatsError ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {websiteStatsError}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.length
            ? cards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className={`rounded-xl border border-l-4 border-slate-200 ${card.accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </Link>
              ))
            : Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  aria-label="Loading website summary"
                  className="h-24 animate-pulse rounded-xl bg-slate-50"
                />
              ))}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminSessionActive");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    void loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const sessionResponse = await adminFetch("/api/admin/session", {
        cache: "no-store",
      });
      if (!sessionResponse.ok) {
        throw new Error("Unable to load your admin permissions.");
      }
      const session = await sessionResponse.json();
      const grantedDirectories: string[] = (session.permissions || []).map(
        (permission: { key: string }) => permission.key,
      );
      const superadmin = session.is_superadmin === true;
      setPermissionKeys(grantedDirectories);
      setIsSuperadmin(superadmin);
      const visibleCategories = superadmin
        ? CATEGORY_CONFIG
        : CATEGORY_CONFIG.filter((category) =>
            hasDirectoryAccess(grantedDirectories, category.directory),
          );

      const results = await Promise.allSettled(
        visibleCategories.map(async (cfg) => {
          const token = localStorage.getItem("adminSessionActive");
          const endpoint =
            cfg.key === "supportTickets"
              ? "/api/admin/support-tickets"
              : cfg.endpoint;
          const response = await adminFetch(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          if (!response.ok) {
            let bodyText = "";
            try {
              bodyText = await response.text();
            } catch {
              // ignore
            }
            console.error(
              `❌ ${cfg.label} (${cfg.endpoint}) failed: ${response.status} ${response.statusText}`,
              bodyText,
            );
            throw new Error(
              `${cfg.label}: ${response.status} ${response.statusText}`,
            );
          }

          const json = await response.json();
          const records = extractRecords(json);
          return { ...cfg, records };
        }),
      );

      const resolved: CategoryData[] = results.map((result, i) =>
        result.status === "fulfilled"
          ? result.value
          : { ...visibleCategories[i], records: [] },
      );

      const failed = results
        .map((result, i) =>
          result.status === "rejected" ? visibleCategories[i].label : null,
        )
        .filter((label): label is string => label !== null);

      if (failed.length > 0) {
        setError(
          `Failed to load: ${failed.join(", ")}. Check the browser console for status codes — showing partial data for the rest.`,
        );
      }

      setCategories(resolved);

      const allRecords = resolved.flatMap((category) => category.records);
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 30);

      setStats({
        totalRequests: allRecords.length,
        recentRequests: allRecords.filter((record) => {
          if (!record.created_at) return false;
          const createdAt = new Date(record.created_at);
          return (
            !Number.isNaN(createdAt.getTime()) && createdAt >= recentCutoff
          );
        }).length,
        needsAttention: allRecords.filter((record) =>
          ATTENTION_STATUSES.has(record.status?.toLowerCase() ?? ""),
        ).length,
        completedRequests: allRecords.filter((record) =>
          COMPLETED_STATUSES.has(record.status?.toLowerCase() ?? ""),
        ).length,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Bar chart: volume per category
  const categoryVolumeData = useMemo(
    () =>
      categories.map((c) => ({
        name: c.label,
        count: c.records.length,
      })),
    [categories],
  );

  // Line chart: all requests across every category, last 14 days
  const trendData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = localDateKey(d);
      days.push({
        date: dateKey,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: 0,
      });
    }

    const dayMap = new Map(days.map((d) => [d.date, d]));

    categories.forEach((c) => {
      c.records.forEach((r) => {
        if (!r.created_at) return;
        const date = new Date(r.created_at);
        if (Number.isNaN(date.getTime())) return;
        const dateKey = localDateKey(date);
        const day = dayMap.get(dateKey);
        if (day) day.count += 1;
      });
    });

    return days;
  }, [categories]);

  const supportTicketStatusData = useMemo(() => {
    const tickets =
      categories.find((category) => category.key === "supportTickets")
        ?.records ?? [];
    const counts = new Map<string, number>();
    tickets.forEach((ticket) => {
      const status = ticket.status?.toLowerCase() || "open";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });

    return Array.from(counts, ([key, value]) => ({
      key,
      value,
      name: key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));
  }, [categories]);
  const directorySections = getAuthorizedNavSections(
    permissionKeys,
    isSuperadmin,
  )
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.href !== "/admin/dashboard"),
    }))
    .filter((section) => section.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Infinitech Operations
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Admin overview
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              A live snapshot of incoming work and the directories assigned to
              you.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadDashboard()}
            disabled={refreshing}
            className="w-fit border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh overview
          </Button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {stats && (
        <section aria-label="Request statistics" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                At a glance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Counts are based on the directories available to your account.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Updated{" "}
              {new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total requests",
                value: stats.totalRequests,
                caption: `${categories.length} request ${categories.length === 1 ? "directory" : "directories"} tracked`,
                icon: Inbox,
                tone: "bg-cyan-50 text-cyan-700",
                accent: "border-t-cyan-500",
              },
              {
                label: "Last 30 days",
                value: stats.recentRequests,
                caption: "New requests received",
                icon: Activity,
                tone: "bg-blue-50 text-blue-700",
                accent: "border-t-blue-500",
              },
              {
                label: "Needs attention",
                value: stats.needsAttention,
                caption: "Open, pending, or in progress",
                icon: Clock3,
                tone: "bg-amber-50 text-amber-700",
                accent: "border-t-amber-500",
              },
              {
                label: "Completed",
                value: stats.completedRequests,
                caption: "Resolved or closed requests",
                icon: CheckCircle2,
                tone: "bg-emerald-50 text-emerald-700",
                accent: "border-t-emerald-500",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className={`overflow-hidden rounded-2xl border border-slate-200 border-t-4 ${stat.accent} bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {stat.caption}
                      </p>
                    </div>
                    <span className={`rounded-xl p-3 ${stat.tone}`}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity charts */}
      {categories.length > 0 && (
        <section
          aria-label="Request activity"
          className="grid gap-5 xl:grid-cols-5"
        >
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Request activity</CardTitle>
              <CardDescription>
                Daily incoming requests over the past two weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 12, right: 12, left: -18, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
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
                      dataKey="count"
                      name="Requests"
                      stroke={COLORS.cyan}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Requests by directory</CardTitle>
              <CardDescription>
                All-time volume in your available categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryVolumeData}
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
                      width={112}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="Requests"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    >
                      {categoryVolumeData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {hasDirectoryAccess(permissionKeys, "support_tickets") ||
          isSuperadmin ? (
            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Support ticket status
                </CardTitle>
                <CardDescription>
                  Current breakdown across your support queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {supportTicketStatusData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No support tickets yet.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {supportTicketStatusData.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                STATUS_COLORS[item.key] ?? COLORS.violet,
                            }}
                          />
                          {item.name}
                        </span>
                        <span className="text-lg font-semibold text-slate-950">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </section>
      )}
    </div>
  );
}
