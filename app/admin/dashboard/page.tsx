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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminFetch } from "@/lib/admin-fetch";

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
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalRequests: number;
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
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
                  className={`rounded-xl border border-l-4 border-slate-200 ${card.accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900`}
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </Link>
              ))
            : Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  aria-label="Loading website summary"
                  className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
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
            grantedDirectories.includes(category.directory),
          );

      const results = await Promise.allSettled(
        visibleCategories.map(async (cfg) => {
          const response = await adminFetch(cfg.endpoint);

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
          const records: RequestRecord[] = json.data || [];
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

      const tickets =
        resolved.find((c) => c.key === "supportTickets")?.records || [];
      const totalRequests = resolved.reduce(
        (sum, c) => sum + c.records.length,
        0,
      );

      setStats({
        totalTickets: tickets.length,
        openTickets: tickets.filter((t) => t.status === "open").length,
        inProgressTickets: tickets.filter((t) => t.status === "in_progress")
          .length,
        resolvedTickets: tickets.filter((t) => t.status === "resolved").length,
        totalRequests,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
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

  // Pie chart: support ticket status breakdown
  const ticketStatusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Open", value: stats.openTickets, key: "open" },
      {
        name: "In Progress",
        value: stats.inProgressTickets,
        key: "in_progress",
      },
      { name: "Resolved", value: stats.resolvedTickets, key: "resolved" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  // Line chart: all requests across every category, last 14 days
  const trendData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
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
        const dateKey = new Date(r.created_at).toISOString().split("T")[0];
        const day = dayMap.get(dateKey);
        if (day) day.count += 1;
      });
    });

    return days;
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome to your support management system
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Requests by Category</CardTitle>
            <CardDescription>Volume across all request types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryVolumeData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Ticket Status Breakdown</CardTitle>
            <CardDescription>Current support ticket pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {ticketStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  No ticket data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {ticketStatusData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={STATUS_COLORS[entry.key] ?? COLORS.cyan}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Trend (Last 14 Days)</CardTitle>
            <CardDescription>
              All incoming requests across every category, by day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.cyan}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: COLORS.cyan }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {(isSuperadmin || permissionKeys.includes("website_directory")) && (
        <WebsiteDirectorySummary />
      )}

      {/* Quick Actions */}
      {(isSuperadmin || permissionKeys.includes("support_tickets")) && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to manage support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/support-tickets">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                View All Support Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}