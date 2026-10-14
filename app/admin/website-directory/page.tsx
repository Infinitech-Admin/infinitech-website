"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Pencil,
  ClipboardCheck,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ExternalLink,
  FolderOpen,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ───────────────────────── constants & types ───────────────────────── */

const PHASES = ["Design", "Development", "Testing", "Deployment"] as const;
const PROJECT_STATUSES = [
  "Not Started",
  "In Progress",
  "On Hold",
  "For Review",
  "Completed",
  "Cancelled",
] as const;
const QA_STATUSES = [
  "Not Started",
  "In Progress",
  "Passed",
  "Failed",
  "Blocked",
] as const;

type QaSession = {
  id: number;
  qa_date: string;
  qa_by: string;
  status: string;
  progress_percentage: number;
};

type Website = {
  id: number;
  website_name: string;
  client_name: string;
  business_type: string;
  website_url: string;
  description: string | null;
  notes: string | null;
  project_phase: string;
  project_status: string;
  latest_qa_session: QaSession | null;
};

type WebsiteForm = Omit<Website, "id" | "latest_qa_session">;
type PageMeta = { current_page: number; last_page: number; total: number };
type DirectoryResponse = {
  data: Website[];
  meta: PageMeta;
  business_types?: string[];
  message?: string;
};

const EMPTY_FORM: WebsiteForm = {
  website_name: "",
  client_name: "",
  business_type: "",
  website_url: "",
  description: "",
  notes: "",
  project_phase: "Design",
  project_status: "Not Started",
};

const SORT_OPTIONS = [
  ["website_name", "Website name"],
  ["client_name", "Client name"],
  ["business_type", "Business type"],
  ["project_phase", "Project phase"],
  ["project_status", "Project status"],
  ["qa_date", "QA date"],
  ["qa_status", "QA status"],
  ["qa_progress", "QA progress"],
] as const;
type SortKey = (typeof SORT_OPTIONS)[number][0];

/* Badge colours: [pill classes, dot classes] */
const TONES: Record<string, [string, string]> = {
  Design: ["bg-violet-50 text-violet-800 ring-violet-600/20", "bg-violet-500"],
  Development: ["bg-blue-50 text-blue-800 ring-blue-600/20", "bg-blue-500"],
  Testing: ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  Deployment: ["bg-cyan-50 text-cyan-800 ring-cyan-600/20", "bg-cyan-500"],
  "Not Started": [
    "bg-slate-100 text-slate-700 ring-slate-500/20",
    "bg-slate-400",
  ],
  "In Progress": ["bg-blue-50 text-blue-800 ring-blue-600/20", "bg-blue-500"],
  "On Hold": ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  "For Review": [
    "bg-violet-50 text-violet-800 ring-violet-600/20",
    "bg-violet-500",
  ],
  Completed: [
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    "bg-emerald-500",
  ],
  Cancelled: ["bg-rose-50 text-rose-800 ring-rose-600/20", "bg-rose-500"],
  Passed: [
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    "bg-emerald-500",
  ],
  Failed: ["bg-rose-50 text-rose-800 ring-rose-600/20", "bg-rose-500"],
  Blocked: ["bg-orange-50 text-orange-800 ring-orange-600/20", "bg-orange-500"],
};

const PROGRESS_TONE: Record<string, string> = {
  Passed: "bg-emerald-500",
  Failed: "bg-rose-500",
  Blocked: "bg-orange-500",
};

/* ───────────────────────── small helpers ───────────────────────── */

function Badge({
  value,
  kind,
}: {
  value: string;
  kind: "phase" | "project" | "qa";
}) {
  const [pill, dot] = TONES[value] ?? TONES["Not Started"];
  const prefix =
    kind === "phase" ? "Phase" : kind === "project" ? "Project" : "QA";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${pill}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="sr-only">{prefix}: </span>
      {value}
    </span>
  );
}

function ProgressBar({ qa }: { qa: QaSession | null }) {
  const value = Math.max(0, Math.min(100, qa?.progress_percentage ?? 0));
  const tone = (qa && PROGRESS_TONE[qa.status]) || "bg-cyan-600";

  return (
    <div className="flex items-center gap-2">
      <div
        aria-label="QA completion"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 "
        role="progressbar"
      >
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500 ">{value}%</span>
    </div>
  );
}

function formatDate(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function hostLabel(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function qaCaption(qa: QaSession | null) {
  if (!qa) return "No QA session yet";
  const parts = [formatDate(qa.qa_date), qa.qa_by ? `by ${qa.qa_by}` : ""];
  return parts.filter(Boolean).join(" ");
}

function SortHeader({
  label,
  column,
  sort,
  direction,
  onSort,
}: {
  label: string;
  column?: SortKey;
  sort: SortKey;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  if (!column) return <>{label}</>;
  const active = sort === column;
  const Icon = !active
    ? ChevronsUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown;
  const ariaLabel = active
    ? `Sort by ${label} ${direction === "asc" ? "ascending" : "descending"}`
    : `Sort by ${label}`;

  return (
    <button
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${active ? "text-slate-900 " : "hover:text-slate-900 "}`}
      onClick={() => onSort(column)}
      title={ariaLabel}
      type="button"
    >
      {label}
      <Icon className={`h-3.5 w-3.5 ${active ? "" : "opacity-50"}`} />
    </button>
  );
}

/* ───────────────────────── page content ───────────────────────── */

function WebsiteDirectoryContent() {
  const searchParams = useSearchParams();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState(
    searchParams.get("status") ?? "",
  );
  const [phase, setPhase] = useState(searchParams.get("phase") ?? "");
  const [qaStatus, setQaStatus] = useState(searchParams.get("qa_status") ?? "");
  const [businessType, setBusinessType] = useState("");
  const [qaFrom, setQaFrom] = useState("");
  const [qaTo, setQaTo] = useState("");
  const [sort, setSort] = useState<SortKey>("website_name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(
    Boolean(searchParams.get("status") || searchParams.get("qa_status")),
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [form, setForm] = useState<WebsiteForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(form) !==
      JSON.stringify(
        editingWebsite
          ? {
              website_name: editingWebsite.website_name,
              client_name: editingWebsite.client_name,
              business_type: editingWebsite.business_type,
              website_url: editingWebsite.website_url,
              description: editingWebsite.description ?? "",
              notes: editingWebsite.notes ?? "",
              project_phase: editingWebsite.project_phase,
              project_status: editingWebsite.project_status,
            }
          : EMPTY_FORM,
      ),
    [editingWebsite, form],
  );

  const activeFilterCount = [
    projectStatus,
    phase,
    qaStatus,
    businessType,
    qaFrom,
    qaTo,
  ].filter(Boolean).length;
  const anyFilter = activeFilterCount > 0 || Boolean(phase) || Boolean(search);

  const loadWebsites = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        per_page: "10",
        sort,
        direction,
      });

      if (search.trim()) params.set("search", search.trim());
      if (projectStatus) params.set("project_status", projectStatus);
      if (phase) params.set("project_phase", phase);
      if (qaStatus) params.set("qa_status", qaStatus);
      if (businessType) params.set("business_type", businessType);
      if (qaFrom) params.set("qa_from", qaFrom);
      if (qaTo) params.set("qa_to", qaTo);

      try {
        const response = await adminFetch(
          `/api/admin/websites?${params.toString()}`,
          { cache: "no-store", signal },
        );
        const result = (await response.json()) as DirectoryResponse;

        if (!response.ok) {
          throw new Error(result.message || "Unable to load website records.");
        }
        if (signal?.aborted) return;
        setWebsites(result.data);
        setMeta(result.meta);
        setBusinessTypes(result.business_types ?? []);
      } catch (loadError) {
        if (signal?.aborted) return;
        console.error("Website directory load failed:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load website records.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [
      businessType,
      direction,
      page,
      phase,
      projectStatus,
      qaFrom,
      qaStatus,
      qaTo,
      search,
      sort,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => void loadWebsites(controller.signal),
      250,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [loadWebsites]);

  useEffect(() => {
    if (!editorOpen || !hasUnsavedChanges) return;
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", preventUnload);

    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [editorOpen, hasUnsavedChanges]);

  function openCreateForm() {
    setEditingWebsite(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  }

  function openEditForm(website: Website) {
    setEditingWebsite(website);
    setForm({
      website_name: website.website_name,
      client_name: website.client_name,
      business_type: website.business_type,
      website_url: website.website_url,
      description: website.description ?? "",
      notes: website.notes ?? "",
      project_phase: website.project_phase,
      project_status: website.project_status,
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes?")) {
      return;
    }
    setEditorOpen(false);
  }

  async function saveWebsite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminFetch(
        editingWebsite
          ? `/api/admin/websites/${editingWebsite.id}`
          : "/api/admin/websites",
        {
          method: editingWebsite ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            website_name: form.website_name.trim(),
            client_name: form.client_name.trim(),
            business_type: form.business_type.trim(),
            website_url: form.website_url.trim(),
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        const firstError = result.errors
          ? Object.values(result.errors as Record<string, string[]>)[0]?.[0]
          : null;

        throw new Error(
          firstError || result.message || "Unable to save website.",
        );
      }

      toast.success(editingWebsite ? "Website updated." : "Website added.");
      setEditorOpen(false);
      setPage(1);
      await loadWebsites();
    } catch (saveError) {
      console.error("Website save failed:", saveError);
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save website.",
      );
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setProjectStatus("");
    setPhase("");
    setQaStatus("");
    setBusinessType("");
    setQaFrom("");
    setQaTo("");
    setPage(1);
  }

  function updateSort(nextSort: SortKey) {
    if (sort === nextSort) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSort(nextSort);
      setDirection("asc");
    }
    setPage(1);
  }

  const selectedView = searchParams.get("view");
  const viewHeading =
    selectedView === "qa-forms"
      ? "QA Forms"
      : selectedView === "qa-reports"
        ? "QA Reports"
        : "Website Directory";

  const columns: { label: string; column?: SortKey; className?: string }[] = [
    { label: "WEBSITE", column: "website_name" },
    { label: "CLIENT", column: "client_name" },
    { label: "PHASE", column: "project_phase" },
    { label: "STATUS", column: "project_status" },
    { label: "LATEST QA", column: "qa_date" },
    { label: "ACTIONS", className: "text-center" },
  ];

  return (
    <section className="mx-auto min-h-screen max-w-[1600px] space-y-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 text-slate-900 sm:p-6">
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <FolderOpen aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {viewHeading}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Track client websites from design to deployment, with the latest
                QA progress alongside.
              </p>
              <p className="mt-3 text-sm font-medium text-white/90">
                {meta.total} website{meta.total === 1 ? "" : "s"}
                {phase ? ` in ${phase}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="shrink-0 border-white/40 bg-white/10 text-white hover:bg-white/20"
              variant="outline"
            >
              <Link href="/admin/website-directory/checklist">
                Manage QA checklist
              </Link>
            </Button>
            <Button
              className="shrink-0 bg-white text-blue-700 hover:bg-blue-50"
              onClick={openCreateForm}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add website
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ">
        <div className="space-y-3 border-b border-slate-200 p-4 sm:p-5 ">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search websites"
                className="pl-9 pr-9"
                placeholder="Search by website, client or URL"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by project phase"
                className="h-10 min-w-[140px] flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 sm:flex-none"
                value={phase}
                onChange={(event) => {
                  setPhase(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All phases</option>
                {PHASES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                aria-label="Sort websites"
                className="h-10 min-w-[120px] flex-1 rounded-md border border-input bg-background px-3 text-sm md:hidden"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortKey);
                  setPage(1);
                }}
              >
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    Sort: {label}
                  </option>
                ))}
              </select>
              <Button
                aria-label={`Sort ${sort} ${direction === "asc" ? "descending" : "ascending"}`}
                className="md:hidden"
                size="icon"
                variant="outline"
                onClick={() =>
                  setDirection((current) =>
                    current === "asc" ? "desc" : "asc",
                  )
                }
                title={`${sort} ${direction === "asc" ? "descending" : "ascending"}`}
              >
                {direction === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                aria-controls="directory-filters"
                aria-expanded={filtersOpen}
                variant="outline"
                className="h-10 shrink-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-cyan-700 px-1.5 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {anyFilter && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {filtersOpen && (
            <div
              className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-5 "
              id="directory-filters"
            >
              <label className="space-y-1.5 text-sm font-medium">
                Project status
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  value={projectStatus}
                  onChange={(event) => {
                    setProjectStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {PROJECT_STATUSES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                QA status
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  value={qaStatus}
                  onChange={(event) => {
                    setQaStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All QA statuses</option>
                  {QA_STATUSES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Business type
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                  value={businessType}
                  onChange={(event) => {
                    setBusinessType(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All business types</option>
                  {businessTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className="space-y-1.5 text-sm font-medium">
                <label htmlFor="qa-from">QA from</label>
                <Input
                  id="qa-from"
                  type="date"
                  value={qaFrom}
                  max={qaTo || undefined}
                  onChange={(event) => {
                    setQaFrom(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1.5 text-sm font-medium">
                <label htmlFor="qa-to">QA to</label>
                <Input
                  id="qa-to"
                  type="date"
                  value={qaTo}
                  min={qaFrom || undefined}
                  onChange={(event) => {
                    setQaTo(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}

          <p aria-live="polite" className="text-sm text-slate-600 ">
            {meta.total} website{meta.total === 1 ? "" : "s"}
            {phase ? ` in ${phase}` : ""}
            {search ? ` matching “${search}”` : ""}
          </p>
        </div>

        {error && (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="font-semibold underline"
              onClick={() => void loadWebsites()}
              type="button"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
              Loading website records…
            </div>
          ) : websites.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500 ">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-slate-900 ">
                {anyFilter ? "No websites match" : "No websites yet"}
              </h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {anyFilter
                  ? "Try a different search, or clear the filters to see everything."
                  : "Add your first website to start tracking its progress and QA."}
              </p>
              {anyFilter ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              ) : (
                <Button className="mt-4" onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add website
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden md:block">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-sm">
                    <colgroup>
                      {["26%", "15%", "12%", "12%", "20%", "10%"].map(
                        (width) => (
                          <col key={width} style={{ width }} />
                        ),
                      )}
                    </colgroup>

                    <thead className="border-b border-slate-200 bg-slate-50/70 text-xs text-slate-500 ">
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col.label}
                            className={`overflow-hidden whitespace-nowrap px-3 py-2.5 font-medium ${
                              col.className ?? ""
                            }`}
                            scope="col"
                          >
                            <SortHeader
                              column={col.column}
                              direction={direction}
                              label={col.label}
                              onSort={updateSort}
                              sort={sort}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 ">
                      {websites.map((website) => {
                        const qa = website.latest_qa_session;

                        return (
                          <tr
                            key={website.id}
                            className="align-middle text-slate-700 hover:bg-slate-50/60 "
                          >
                            <td className="max-w-xl px-4 py-3.5">
                              <Link
                                className="block truncate font-semibold text-slate-900 hover:text-cyan-700 "
                                href={`/admin/website-directory/${website.id}`}
                              >
                                {website.website_name}
                              </Link>
                              <a
                                className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-slate-500 hover:text-cyan-700 hover:underline"
                                href={website.website_url}
                                rel="noopener noreferrer"
                                target="_blank"
                                title={website.website_url}
                              >
                                <span className="truncate">
                                  {hostLabel(website.website_url)}
                                </span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </td>
                            <td className="max-w-56 px-4 py-3.5">
                              <p className="truncate text-slate-800 ">
                                {website.client_name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {website.business_type}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <Badge
                                kind="phase"
                                value={website.project_phase}
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <Badge
                                kind="project"
                                value={website.project_status}
                              />
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="min-w-[100px] space-y-2">
                                {/* QA progress */}
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 ">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        qa?.status === "Passed"
                                          ? "bg-emerald-500"
                                          : qa?.status === "Failed"
                                            ? "bg-rose-500"
                                            : qa?.status === "Blocked"
                                              ? "bg-orange-500"
                                              : "bg-cyan-600"
                                      }`}
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            qa?.progress_percentage ?? 0,
                                          ),
                                        )}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="min-w-[34px] text-right text-xs font-semibold tabular-nums text-slate-700 ">
                                    {Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        qa?.progress_percentage ?? 0,
                                      ),
                                    )}
                                    %
                                  </span>
                                </div>

                                {/* QA status */}
                                <div>
                                  <Badge
                                    kind="qa"
                                    value={qa?.status ?? "Not Started"}
                                  />
                                </div>

                                {/* QA date and reviewer */}
                                <p
                                  className="truncate text-xs text-slate-500 "
                                  title={qaCaption(qa)}
                                >
                                  {qaCaption(qa)}
                                </p>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Website */}
                                <Button
                                  asChild
                                  size="icon"
                                  variant="ghost"
                                  title="View Website"
                                >
                                  <Link
                                    href={`/admin/website-directory/${website.id}`}
                                    aria-label="View website"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>

                                <Button
                                  asChild
                                  size="icon"
                                  variant="ghost"
                                  title="Open QA form"
                                >
                                  <Link
                                    href={`/admin/website-directory/${website.id}?openQa=1`}
                                    aria-label="Open QA form"
                                  >
                                    <ClipboardCheck className="h-4 w-4" />
                                  </Link>
                                </Button>

                                {/* Edit Website */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Edit Website"
                                  aria-label="Edit website"
                                  onClick={() => openEditForm(website)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile list */}
              <ul className="divide-y divide-slate-100 md:hidden ">
                {websites.map((website) => {
                  const qa = website.latest_qa_session;

                  return (
                    <li key={website.id} className="space-y-3 p-4">
                      <div>
                        <Link
                          className="font-semibold text-slate-900 hover:text-cyan-700 "
                          href={`/admin/website-directory/${website.id}`}
                        >
                          {website.website_name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {website.client_name}, {website.business_type}
                        </p>
                        <a
                          className="mt-0.5 inline-flex items-center gap-1 text-xs text-cyan-700 hover:underline"
                          href={website.website_url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {hostLabel(website.website_url)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge kind="phase" value={website.project_phase} />
                        <Badge kind="project" value={website.project_status} />
                        <Badge kind="qa" value={qa?.status ?? "Not Started"} />
                      </div>
                      <div className="space-y-1">
                        <ProgressBar qa={qa} />
                        <p className="text-xs text-slate-500">
                          {qaCaption(qa)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm">
                          <Link href={`/admin/website-directory/${website.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/admin/website-directory/${website.id}?openQa=1`}
                          >
                            Open QA
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`/admin/website-directory/${website.id}#qa-history`}
                          >
                            History
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditForm(website)}
                        >
                          Edit
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`/admin/website-directory/${website.id}?newQa=1`}
                          >
                            New QA
                          </Link>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:px-5">
            <span className="text-slate-500">
              Showing {(meta.current_page - 1) * 10 + 1}–
              {Math.min(meta.current_page * 10, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1}
                size="sm"
                variant="outline"
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                disabled={page >= meta.last_page}
                size="sm"
                variant="outline"
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / edit dialog */}
      <Dialog
        open={editorOpen}
        onOpenChange={(open) => (open ? setEditorOpen(true) : closeEditor())}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWebsite ? "Edit website" : "Add website"}
            </DialogTitle>
            <DialogDescription>
              Phase and status are tracked separately. QA sessions are created
              from the website details page.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={saveWebsite}>
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-900 ">
                Website
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="space-y-1.5 text-sm font-medium"
                  htmlFor="website-name"
                >
                  Website name <span className="text-rose-600">*</span>
                  <Input
                    required
                    id="website-name"
                    maxLength={150}
                    value={form.website_name}
                    onChange={(event) =>
                      setForm({ ...form, website_name: event.target.value })
                    }
                  />
                </label>
                <label
                  className="space-y-1.5 text-sm font-medium"
                  htmlFor="website-url"
                >
                  Website URL <span className="text-rose-600">*</span>
                  <Input
                    required
                    id="website-url"
                    placeholder="https://example.com"
                    type="url"
                    value={form.website_url}
                    onChange={(event) =>
                      setForm({ ...form, website_url: event.target.value })
                    }
                  />
                </label>
                <label
                  className="space-y-1.5 text-sm font-medium"
                  htmlFor="client-name"
                >
                  Client name <span className="text-rose-600">*</span>
                  <Input
                    required
                    id="client-name"
                    maxLength={150}
                    value={form.client_name}
                    onChange={(event) =>
                      setForm({ ...form, client_name: event.target.value })
                    }
                  />
                </label>
                <label
                  className="space-y-1.5 text-sm font-medium"
                  htmlFor="business-type"
                >
                  Business type <span className="text-rose-600">*</span>
                  <Input
                    required
                    id="business-type"
                    maxLength={100}
                    placeholder="e.g. Retail, Healthcare"
                    value={form.business_type}
                    onChange={(event) =>
                      setForm({ ...form, business_type: event.target.value })
                    }
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-900 ">
                Progress
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">
                  Project phase
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    value={form.project_phase}
                    onChange={(event) =>
                      setForm({ ...form, project_phase: event.target.value })
                    }
                  >
                    {PHASES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Project status
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    value={form.project_status}
                    onChange={(event) =>
                      setForm({ ...form, project_status: event.target.value })
                    }
                  >
                    {PROJECT_STATUSES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                  Description
                  <textarea
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    maxLength={5000}
                    value={form.description ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                  Notes
                  <textarea
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                    maxLength={5000}
                    placeholder="Internal notes for this website"
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                  />
                </label>
              </div>
            </fieldset>

            <DialogFooter>
              <Button
                disabled={saving}
                type="button"
                variant="outline"
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button disabled={saving} type="submit">
                {saving
                  ? "Saving…"
                  : editingWebsite
                    ? "Save changes"
                    : "Add website"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function WebsiteDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
          Loading website directory…
        </div>
      }
    >
      <WebsiteDirectoryContent />
    </Suspense>
  );
}
