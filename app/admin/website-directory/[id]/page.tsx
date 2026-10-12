"use client";

import {
  Suspense,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Pencil,
  Plus,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
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

const PHASES = ["Design", "Development", "Testing", "Deployment"];
const PROJECT_STATUSES = [
  "Not Started",
  "In Progress",
  "On Hold",
  "For Review",
  "Completed",
  "Cancelled",
];
const QA_RESULTS = ["Pass", "Fail", "Blocked", "Pending", "Not Applicable"];
const ENVIRONMENTS = ["Development", "Staging", "Production"];
const SESSION_NAME_OPTIONS = [
  "Pre-launch QA",
  "Regression QA",
  "Production QA",
  "Accessibility QA",
  "Security QA",
  "Other",
];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

type QaResponse = {
  id: number;
  checklist_item_id: number | null;
  category: string;
  title: string;
  result: string;
  notes: string | null;
  severity: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  evidence_url: string | null;
};

type QaSummary = {
  passed: number;
  failed: number;
  blocked: number;
  pending: number;
  not_applicable: number;
};

type QaSession = {
  id: number;
  session_name: string;
  environment: string;
  qa_date: string;
  qa_by: string;
  status: string;
  progress_percentage: number;
  notes: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  summary: QaSummary;
  responses: QaResponse[];
};

type WebsiteData = {
  id: number;
  website_name: string;
  client_name: string;
  business_type: string;
  website_url: string;
  description: string | null;
  notes: string | null;
  project_phase: string;
  project_status: string;
  created_at: string;
  updated_at: string;
  qa_sessions: QaSession[];
};

type ChecklistItem = {
  id: number;
  category: string;
  title: string;
  description: string;
};

type WebsiteForm = Omit<
  WebsiteData,
  "id" | "created_at" | "updated_at" | "qa_sessions"
>;

type Finding = QaResponse & { session_name: string; session_id: number };

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";
const panelClass =
  "rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900";

/* Badge colours: [pill classes, dot classes] */
const TONES: Record<string, [string, string]> = {
  "Not Started": [
    "bg-stone-100 text-stone-700 ring-stone-500/20",
    "bg-stone-400",
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
  Design: ["bg-violet-50 text-violet-800 ring-violet-600/20", "bg-violet-500"],
  Development: ["bg-blue-50 text-blue-800 ring-blue-600/20", "bg-blue-500"],
  Testing: ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  Deployment: [
    "bg-indigo-50 text-indigo-800 ring-indigo-600/20",
    "bg-indigo-500",
  ],
  Passed: [
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    "bg-emerald-500",
  ],
  Failed: ["bg-rose-50 text-rose-800 ring-rose-600/20", "bg-rose-500"],
  Blocked: ["bg-orange-50 text-orange-800 ring-orange-600/20", "bg-orange-500"],
  Pass: [
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    "bg-emerald-500",
  ],
  Fail: ["bg-rose-50 text-rose-800 ring-rose-600/20", "bg-rose-500"],
  Pending: ["bg-stone-100 text-stone-700 ring-stone-500/20", "bg-stone-400"],
  "Not Applicable": [
    "bg-stone-100 text-stone-600 ring-stone-500/20",
    "bg-stone-300",
  ],
};

const RESULT_ACTIVE: Record<string, string> = {
  Pass: "border-emerald-600 bg-emerald-600 text-white",
  Fail: "border-rose-600 bg-rose-600 text-white",
  Blocked: "border-orange-600 bg-orange-600 text-white",
  Pending: "border-stone-600 bg-stone-600 text-white",
  "Not Applicable": "border-stone-500 bg-stone-500 text-white",
};
const RESULT_LABEL: Record<string, string> = { "Not Applicable": "N/A" };

const PROGRESS_TONE: Record<string, string> = {
  Passed: "bg-emerald-500",
  Failed: "bg-rose-500",
  Blocked: "bg-orange-500",
};

/* What the latest QA run means for shipping. */
const VERDICTS: Record<string, { title: string; hint: string; tone: string }> =
  {
    Passed: {
      title: "Ready to ship",
      hint: "Every applicable check passed and a reviewer approved it.",
      tone: "border-l-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/20",
    },
    Failed: {
      title: "Not ready: checks are failing",
      hint: "Fix the failed items, then re-run the affected checks.",
      tone: "border-l-rose-600 bg-rose-50/70 dark:bg-rose-950/20",
    },
    Blocked: {
      title: "Not ready: testing is blocked",
      hint: "Something is stopping checks from being completed.",
      tone: "border-l-orange-500 bg-orange-50/70 dark:bg-orange-950/20",
    },
    "In Progress": {
      title: "QA in progress",
      hint: "Finish the remaining checks, then get a reviewer to approve.",
      tone: "border-l-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/20",
    },
    "Not Started": {
      title: "No QA run yet",
      hint: "Start a session to test this site against the checklist.",
      tone: "border-l-stone-400 bg-stone-50 dark:bg-stone-800/50",
    },
  };

/* Severity lives on the left edge so the findings list scans by urgency. */
const SEVERITY_EDGE: Record<string, string> = {
  Critical: "border-l-rose-700",
  High: "border-l-rose-500",
  Medium: "border-l-amber-500",
  Low: "border-l-stone-400",
};

/* ───────────────────────── helpers ───────────────────────── */

function Badge({ value }: { value: string }) {
  const [pill, dot] = TONES[value] ?? TONES["Not Started"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${pill}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {value}
    </span>
  );
}

function ProgressBar({
  value,
  status,
  label,
  className = "h-2",
}: {
  value: number;
  status?: string;
  label: string;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  const tone = (status && PROGRESS_TONE[status]) || "bg-indigo-600";

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safe}
      className={`overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700 ${className}`}
      role="progressbar"
    >
      <div
        className={`h-full rounded-full transition-all ${tone}`}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function localDateInputValue() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function groupByCategory(responses: QaResponse[]) {
  const groups = new Map<string, QaResponse[]>();
  for (const response of responses) {
    const list = groups.get(response.category) ?? [];
    list.push(response);
    groups.set(response.category, list);
  }
  return Array.from(groups.entries());
}

function normalizeSessionName(sessionName: string, specificDetail: string) {
  const trimmed = specificDetail.trim();
  return sessionName === "Other" ? trimmed : sessionName.trim();
}

function hydrateSessionForm(session: QaSession) {
  const isPreset = SESSION_NAME_OPTIONS.includes(session.session_name);

  return {
    ...session,
    session_name: isPreset ? session.session_name : "Other",
    session_name_detail: isPreset ? "" : session.session_name,
  };
}

function getSessionDisplayName(sessionName: string, specificDetail?: string) {
  return sessionName === "Other"
    ? specificDetail?.trim() || "Other"
    : sessionName;
}

/* A session still being worked on says "Continue"; a finished one says "Edit". */
function isOpenSession(session: QaSession) {
  return session.status === "Not Started" || session.status === "In Progress";
}

/* The last step a session was saved on, remembered per browser. Saving
   records the step even when nothing on it was answered. */
function savedStepKey(websiteId: string, sessionId: number) {
  return `qa-step:${websiteId}:${sessionId}`;
}

function readSavedStep(websiteId: string, sessionId: number): number | null {
  try {
    const raw = window.localStorage.getItem(savedStepKey(websiteId, sessionId));
    const step = raw === null ? null : Number(raw);
    return step !== null && Number.isInteger(step) && step >= 0 ? step : null;
  } catch {
    return null;
  }
}

function writeSavedStep(websiteId: string, sessionId: number, step: number) {
  try {
    window.localStorage.setItem(
      savedStepKey(websiteId, sessionId),
      String(step),
    );
  } catch {
    /* storage unavailable: fall back to the first unanswered step */
  }
}

/* Fallback when nothing was remembered: the first category with unanswered
   checks, or the review step once everything is answered. */
function firstUnansweredStep(session: QaSession) {
  const groups = groupByCategory(session.responses);
  const index = groups.findIndex(([, items]) =>
    items.some((item) => item.result === "Pending"),
  );

  return index === -1 ? groups.length + 1 : index + 1;
}

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`block space-y-1.5 text-sm font-medium ${className}`}
      htmlFor={htmlFor}
    >
      {label}
      {children}
    </label>
  );
}

function PhaseStepper({ phase }: { phase: string }) {
  const current = PHASES.indexOf(phase);

  return (
    <ol aria-label="Project phase" className="flex items-center">
      {PHASES.map((item, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={item}
            aria-current={active ? "step" : undefined}
            className={`flex items-center ${index < PHASES.length - 1 ? "flex-1" : ""}`}
          >
            <span className="flex flex-col items-start gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  done
                    ? "border-indigo-700 bg-indigo-700 text-white"
                    : active
                      ? "border-indigo-700 bg-white text-indigo-800 ring-4 ring-indigo-100 dark:bg-stone-900 dark:ring-indigo-900/50"
                      : "border-stone-300 bg-white text-stone-400 dark:border-stone-600 dark:bg-stone-900"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={`text-xs ${active ? "font-semibold text-stone-900 dark:text-white" : "text-stone-500"}`}
              >
                {item}
              </span>
            </span>
            {index < PHASES.length - 1 && (
              <span
                aria-hidden
                className={`mx-2 mb-5 h-0.5 flex-1 rounded ${done ? "bg-indigo-700" : "bg-stone-200 dark:bg-stone-700"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* One bar, four segments: how a session's checks are split. */
function TallyBar({ summary }: { summary: QaSummary }) {
  const total =
    summary.passed + summary.failed + summary.blocked + summary.pending || 1;
  const parts: [string, number, string, string][] = [
    [
      "Passed",
      summary.passed,
      "bg-emerald-500",
      "text-emerald-700 dark:text-emerald-400",
    ],
    [
      "Failed",
      summary.failed,
      "bg-rose-500",
      "text-rose-700 dark:text-rose-400",
    ],
    [
      "Blocked",
      summary.blocked,
      "bg-orange-500",
      "text-orange-700 dark:text-orange-400",
    ],
    [
      "Pending",
      summary.pending,
      "bg-stone-300 dark:bg-stone-600",
      "text-stone-600 dark:text-stone-300",
    ],
  ];

  return (
    <div>
      <div
        aria-label="QA results"
        className="flex h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
        role="img"
      >
        {parts.map(([label, count, bar]) =>
          count > 0 ? (
            <span
              key={label}
              className={bar}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${label}: ${count}`}
            />
          ) : null,
        )}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {parts.map(([label, count, , text]) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <dd className={`text-lg font-semibold tabular-nums ${text}`}>
              {count}
            </dd>
            <dt className="text-stone-500">{label.toLowerCase()}</dt>
          </div>
        ))}
        {summary.not_applicable > 0 && (
          <div className="flex items-baseline gap-1.5">
            <dd className="text-lg font-semibold tabular-nums text-stone-500">
              {summary.not_applicable}
            </dd>
            <dt className="text-stone-500">not applicable</dt>
          </div>
        )}
      </dl>
    </div>
  );
}

function ReadinessBanner({
  session,
  openFindings,
  onContinue,
  onStart,
}: {
  session: QaSession | null;
  openFindings: number;
  onContinue: () => void;
  onStart: () => void;
}) {
  const verdict =
    VERDICTS[session?.status ?? "Not Started"] ?? VERDICTS["Not Started"];

  return (
    <section
      className={`rounded-lg border border-l-4 border-stone-200 p-6 dark:border-stone-800 ${verdict.tone}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
            {verdict.title}
          </h2>
          <p className="max-w-prose text-sm text-stone-600 dark:text-stone-300">
            {verdict.hint}
            {openFindings > 0 &&
              ` ${openFindings} open ${openFindings === 1 ? "finding" : "findings"} across all sessions.`}
          </p>
          {session && (
            <p className="text-sm text-stone-500">
              Latest run: {session.session_name} on {session.environment},{" "}
              {formatDate(session.qa_date)}, by {session.qa_by}.{" "}
              {session.progress_percentage}% complete.
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {session ? (
              <Button onClick={onContinue}>
                {isOpenSession(session)
                  ? "Continue latest session"
                  : "Edit latest session"}
              </Button>
            ) : (
              <Button onClick={onStart}>
                <Plus className="mr-2 h-4 w-4" />
                Start QA session
              </Button>
            )}
          </div>
        </div>
        {session && <TallyBar summary={session.summary} />}
      </div>
    </section>
  );
}

/* Project info: quiet strip with phase on the left, facts on the right. */
function ProjectStrip({ website }: { website: WebsiteData }) {
  return (
    <section
      className={`${panelClass} grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-stone-900 dark:text-white">
            Project phase
          </h2>
          <Badge value={website.project_status} />
        </div>
        <PhaseStepper phase={website.project_phase} />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:border-l lg:border-stone-100 lg:pl-6 dark:lg:border-stone-800">
        {[
          ["Client", website.client_name],
          ["Business type", website.business_type],
          ["Created", formatDate(website.created_at)],
          ["Updated", formatDate(website.updated_at)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-stone-500">{label}</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {value}
            </dd>
          </div>
        ))}
        <div className="col-span-2">
          <dt className="text-xs text-stone-500">Description</dt>
          <dd className="whitespace-pre-wrap text-stone-700 dark:text-stone-300">
            {website.description || "No description provided."}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-stone-500">Notes</dt>
          <dd className="whitespace-pre-wrap text-stone-700 dark:text-stone-300">
            {website.notes || "No notes provided."}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) return null;

  return (
    <section className={`${panelClass} overflow-hidden`}>
      <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <h2 className="font-semibold text-stone-900 dark:text-white">
          Open findings ({findings.length})
        </h2>
        <p className="mt-0.5 text-sm text-stone-500">
          The latest result for each checklist item that is still failing or
          blocked.
        </p>
      </div>
      <ul className="divide-y divide-stone-100 dark:divide-stone-800">
        {findings.map((finding) => (
          <li
            key={`${finding.session_id}-${finding.id}`}
            className={`border-l-4 px-5 py-4 ${SEVERITY_EDGE[finding.severity ?? ""] ?? "border-l-stone-300"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium text-stone-900 dark:text-white">
                {finding.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                {finding.severity && <span>{finding.severity} severity</span>}
                <Badge value={finding.result} />
              </div>
            </div>
            <p className="mt-0.5 text-xs text-stone-500">
              {finding.category}, from {finding.session_name}
            </p>
            {finding.notes && (
              <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                {finding.notes}
              </p>
            )}
            {(finding.expected_behavior || finding.actual_behavior) && (
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                {finding.expected_behavior && (
                  <div>
                    <dt className="text-xs text-stone-500">Expected</dt>
                    <dd>{finding.expected_behavior}</dd>
                  </div>
                )}
                {finding.actual_behavior && (
                  <div>
                    <dt className="text-xs text-stone-500">Actual</dt>
                    <dd>{finding.actual_behavior}</dd>
                  </div>
                )}
              </dl>
            )}
            {finding.evidence_url && (
              <a
                className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline dark:text-indigo-300"
                href={finding.evidence_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                View evidence <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Row actions for the QA history (table and mobile list). */
function SessionActions({
  session,
  onView,
  onEdit,
}: {
  session: QaSession;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="outline" onClick={onView}>
        <Eye className="mr-1.5 h-4 w-4" />
        View report
      </Button>
      <Button size="sm" onClick={onEdit}>
        <Pencil className="mr-1.5 h-3.5 w-3.5" />
        {isOpenSession(session) ? "Continue" : "Edit"}
      </Button>
    </div>
  );
}

function ReportModal({
  session,
  open,
  onClose,
  onEdit,
}: {
  session: QaSession | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!session) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-stone-200 px-5 py-4 text-left dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-3 pr-8">
            <DialogTitle>{session.session_name}</DialogTitle>
            <Badge value={session.status} />
          </div>
          <DialogDescription>
            {session.environment}, {formatDate(session.qa_date)}, by{" "}
            {session.qa_by}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <TallyBar summary={session.summary} />
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-xs text-stone-500">Completion</dt>
                <dd className="font-semibold tabular-nums">
                  {session.progress_percentage}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Approved by</dt>
                <dd className="font-semibold">
                  {session.reviewed_by && session.approved_at
                    ? session.reviewed_by
                    : "Not approved"}
                </dd>
              </div>
            </dl>
          </div>

          {session.notes && (
            <p className="max-w-prose whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
              {session.notes}
            </p>
          )}

          {groupByCategory(session.responses).map(([category, items]) => (
            <section key={category}>
              <h3 className="mb-2 text-sm font-semibold text-stone-900 dark:text-white">
                {category}
              </h3>
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-700">
                {items.map((response) => (
                  <li key={response.id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium">{response.title}</h4>
                      <Badge value={response.result} />
                    </div>
                    {response.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                        {response.notes}
                      </p>
                    )}
                    {(response.expected_behavior ||
                      response.actual_behavior) && (
                      <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        {response.expected_behavior && (
                          <div>
                            <dt className="text-xs text-stone-500">Expected</dt>
                            <dd>{response.expected_behavior}</dd>
                          </div>
                        )}
                        {response.actual_behavior && (
                          <div>
                            <dt className="text-xs text-stone-500">Actual</dt>
                            <dd>{response.actual_behavior}</dd>
                          </div>
                        )}
                      </dl>
                    )}
                    {response.evidence_url && (
                      <a
                        className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline dark:text-indigo-300"
                        href={response.evidence_url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View evidence <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <DialogFooter className="shrink-0 flex-row justify-end gap-2 border-t border-stone-200 bg-white px-5 py-3 dark:border-stone-800 dark:bg-stone-900">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {isOpenSession(session) ? "Continue session" : "Edit session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── page content ───────────────────────── */

function WebsiteDetailsContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [websiteForm, setWebsiteForm] = useState<WebsiteForm | null>(null);
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [creatingQa, setCreatingQa] = useState(false);
  const [savingQa, setSavingQa] = useState(false);
  const [newSession, setNewSession] = useState({
    session_name: SESSION_NAME_OPTIONS[0],
    session_name_detail: "",
    environment: "Staging",
    qa_date: localDateInputValue(),
    qa_by: "",
    notes: "",
  });
  const [selectedSession, setSelectedSession] = useState<QaSession | null>(
    null,
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(false);
  const [sessionStep, setSessionStep] = useState(0);
  const [sessionForm, setSessionForm] = useState<
    | (QaSession & {
        session_name_detail?: string;
      })
    | null
  >(null);
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);

  /* `silent` reloads keep the page (and any open QA form) mounted. */
  const loadWebsite = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const response = await adminFetch(`/api/admin/websites/${id}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok)
          throw new Error(result.message || "Unable to load website details.");
        setWebsite(result.data);
        setChecklist(result.checklist ?? []);
        setWebsiteForm({
          website_name: result.data.website_name,
          client_name: result.data.client_name,
          business_type: result.data.business_type,
          website_url: result.data.website_url,
          description: result.data.description ?? "",
          notes: result.data.notes ?? "",
          project_phase: result.data.project_phase,
          project_status: result.data.project_status,
        });
      } catch (loadError) {
        console.error("Website details load failed:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load website details.",
        );
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void loadWebsite();
  }, [loadWebsite]);
  useEffect(() => {
    if (searchParams.get("newQa") === "1") setCreatingQa(true);
  }, [searchParams]);

  const latestSession = website?.qa_sessions[0] ?? null;
  const unresolvedFindings = useMemo(() => {
    const latestResults = new Map<string, Finding>();
    const sessions = [...(website?.qa_sessions ?? [])].sort(
      (left, right) =>
        right.qa_date.localeCompare(left.qa_date) || right.id - left.id,
    );

    for (const session of sessions) {
      for (const response of session.responses) {
        if (response.result === "Pending") continue;
        const key =
          response.checklist_item_id === null
            ? `legacy-${session.id}-${response.id}`
            : String(response.checklist_item_id);

        if (!latestResults.has(key)) {
          latestResults.set(key, {
            ...response,
            session_name: session.session_name,
            session_id: session.id,
          });
        }
      }
    }

    return Array.from(latestResults.values()).filter(
      (response) => response.result === "Fail" || response.result === "Blocked",
    );
  }, [website]);
  const currentSummary = useMemo(() => {
    const responses = sessionForm?.responses ?? [];

    return {
      passed: responses.filter((response) => response.result === "Pass").length,
      failed: responses.filter((response) => response.result === "Fail").length,
      blocked: responses.filter((response) => response.result === "Blocked")
        .length,
      pending: responses.filter((response) => response.result === "Pending")
        .length,
      not_applicable: responses.filter(
        (response) => response.result === "Not Applicable",
      ).length,
    };
  }, [sessionForm]);
  const currentProgress = sessionForm
    ? Math.round(
        ((currentSummary.passed +
          currentSummary.failed +
          currentSummary.blocked) /
          Math.max(
            sessionForm.responses.length - currentSummary.not_applicable,
            1,
          )) *
          100,
      )
    : 0;
  const currentQaStatus =
    currentSummary.passed + currentSummary.failed + currentSummary.blocked === 0
      ? "Not Started"
      : currentSummary.failed > 0
        ? "Failed"
        : currentSummary.blocked > 0
          ? "Blocked"
          : currentSummary.pending > 0
            ? "In Progress"
            : approvalConfirmed || sessionForm?.approved_at
              ? "Passed"
              : "In Progress";
  const sessionGroups = useMemo(
    () => groupByCategory(sessionForm?.responses ?? []),
    [sessionForm],
  );
  const sessionWizardSteps = [
    "Session details",
    ...sessionGroups.map(([category]) => category),
    "Review & save",
  ];
  const newSessionStepCount =
    new Set(checklist.map((item) => item.category)).size + 2;

  function advanceSessionStep() {
    if (sessionStep === 0 && sessionForm) {
      const normalizedSessionName = normalizeSessionName(
        sessionForm.session_name,
        sessionForm.session_name_detail ?? "",
      );
      if (
        !normalizedSessionName ||
        !sessionForm.environment ||
        !sessionForm.qa_date ||
        !sessionForm.qa_by.trim()
      ) {
        toast.error("Complete the required session details before continuing.");
        return;
      }
    }

    setSessionStep((current) =>
      Math.min(current + 1, sessionWizardSteps.length - 1),
    );
  }

  function closeSessionEditor() {
    setEditingSession(false);
    setSessionForm(
      selectedSession ? hydrateSessionForm(selectedSession) : null,
    );
    setSessionStep(0);
  }

  function openEditWebsite() {
    if (!website) return;
    setWebsiteForm({
      website_name: website.website_name,
      client_name: website.client_name,
      business_type: website.business_type,
      website_url: website.website_url,
      description: website.description ?? "",
      notes: website.notes ?? "",
      project_phase: website.project_phase,
      project_status: website.project_status,
    });
    setEditingWebsite(true);
  }

  async function saveWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!websiteForm) return;
    setSavingWebsite(true);
    try {
      const response = await adminFetch(`/api/admin/websites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(websiteForm),
      });
      const result = await response.json();

      if (!response.ok) {
        const firstError = result.errors
          ? Object.values(result.errors as Record<string, string[]>)[0]?.[0]
          : null;

        throw new Error(
          firstError || result.message || "Unable to update website.",
        );
      }
      toast.success("Website details updated.");
      setEditingWebsite(false);
      await loadWebsite(true);
    } catch (saveError) {
      console.error("Website update failed:", saveError);
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update website.",
      );
    } finally {
      setSavingWebsite(false);
    }
  }

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSessionName = normalizeSessionName(
      newSession.session_name,
      newSession.session_name_detail,
    );

    if (!normalizedSessionName) {
      toast.error("Please provide a specific detail for the QA session name.");
      return;
    }

    setSavingQa(true);
    try {
      const response = await adminFetch(
        `/api/admin/websites/${id}/qa-sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newSession,
            session_name: normalizedSessionName,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        const firstError = result.errors
          ? Object.values(result.errors as Record<string, string[]>)[0]?.[0]
          : null;

        throw new Error(
          firstError || result.message || "Unable to create QA session.",
        );
      }
      const created = result.data as QaSession;

      setSelectedSession(created);
      setSessionForm(hydrateSessionForm(created));
      setSessionStep(1);
      setEditingSession(true);
      setReportOpen(false);
      setApprovalConfirmed(false);
      setCreatingQa(false);
      setNewSession({
        session_name: SESSION_NAME_OPTIONS[0],
        session_name_detail: "",
        environment: "Staging",
        qa_date: localDateInputValue(),
        qa_by: "",
        notes: "",
      });
      toast.success(
        "QA session created. Checklist responses are ready to complete.",
      );
      await loadWebsite(true);
    } catch (createError) {
      console.error("QA session creation failed:", createError);
      toast.error(
        createError instanceof Error
          ? createError.message
          : "Unable to create QA session.",
      );
    } finally {
      setSavingQa(false);
    }
  }

  function reviewSession(session: QaSession) {
    setSelectedSession(session);
    setSessionForm(hydrateSessionForm(session));
    setSessionStep(0);
    setEditingSession(false);
    setApprovalConfirmed(false);
    setReportOpen(true);
  }

  function editSession(session: QaSession) {
    setSelectedSession(session);
    setSessionForm({
      ...hydrateSessionForm(session),
      responses: session.responses.map((item) => ({ ...item })),
    });
    const lastStep = groupByCategory(session.responses).length + 1;
    setSessionStep(
      Math.min(
        readSavedStep(id, session.id) ?? firstUnansweredStep(session),
        lastStep,
      ),
    );
    setEditingSession(true);
    setApprovalConfirmed(false);
    setReportOpen(false);
  }

  function updateResponse(responseId: number, updates: Partial<QaResponse>) {
    setSessionForm((current) =>
      current
        ? {
            ...current,
            approved_at: null,
            responses: current.responses.map((item) =>
              item.id === responseId ? { ...item, ...updates } : item,
            ),
          }
        : current,
    );
    setApprovalConfirmed(false);
  }

  async function saveSession(
    event?: FormEvent<HTMLFormElement>,
    continueEditing = false,
  ) {
    event?.preventDefault();
    if (!sessionForm) return;

    const normalizedSessionName = normalizeSessionName(
      sessionForm.session_name,
      sessionForm.session_name_detail ?? "",
    );

    if (!normalizedSessionName) {
      toast.error("Please provide a specific detail for the QA session name.");
      return;
    }

    setSavingQa(true);
    try {
      const response = await adminFetch(
        `/api/admin/websites/${id}/qa-sessions/${sessionForm.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_name: normalizedSessionName,
            environment: sessionForm.environment,
            qa_date: sessionForm.qa_date,
            qa_by: sessionForm.qa_by,
            notes: sessionForm.notes,
            reviewed_by: sessionForm.reviewed_by,
            approval_confirmed: approvalConfirmed,
            responses: sessionForm.responses.map((item) => ({
              id: item.id,
              result: item.result,
              notes: item.notes,
              severity: item.severity,
              expected_behavior: item.expected_behavior,
              actual_behavior: item.actual_behavior,
              evidence_url: item.evidence_url,
            })),
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        const firstError = result.errors
          ? Object.values(result.errors as Record<string, string[]>)[0]?.[0]
          : null;

        throw new Error(
          firstError || result.message || "Unable to save QA session.",
        );
      }
      setSelectedSession(result.data);
      setSessionForm({
        ...hydrateSessionForm(result.data),
        responses: result.data.responses.map((item: QaResponse) => ({
          ...item,
        })),
      });
      writeSavedStep(id, sessionForm.id, sessionStep);
      if (!continueEditing) {
        setEditingSession(false);
        setReportOpen(true);
      }
      toast.success(
        continueEditing
          ? "Progress saved. You can continue this session later."
          : "QA results saved.",
      );
      await loadWebsite(true);
    } catch (saveError) {
      console.error("QA session save failed:", saveError);
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save QA results.",
      );
    } finally {
      setSavingQa(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-stone-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        Loading website details…
      </div>
    );
  }
  if (error || !website || !websiteForm) {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
        role="alert"
      >
        <span>{error || "Website not found."}</span>
        <button
          className="font-semibold underline"
          onClick={() => void loadWebsite()}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Header */}
      <header>
        <Link
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-indigo-700"
          href="/admin/website-directory"
        >
          <ArrowLeft className="h-4 w-4" /> Website Directory
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-white">
              {website.website_name}
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {website.client_name}, {website.business_type}
            </p>
            <a
              className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-indigo-700 hover:underline dark:text-indigo-300"
              href={website.website_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="truncate">{website.website_url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openEditWebsite}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setCreatingQa(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New QA session
            </Button>
          </div>
        </div>
      </header>

      <ReadinessBanner
        session={latestSession}
        openFindings={unresolvedFindings.length}
        onContinue={() => latestSession && editSession(latestSession)}
        onStart={() => setCreatingQa(true)}
      />
      <ProjectStrip website={website} />
      <FindingsList findings={unresolvedFindings} />

      {/* QA history */}
      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-white">
              QA history
            </h2>
            <p className="mt-0.5 text-sm text-stone-500">
              Every testing run is kept as its own session.
            </p>
          </div>
        </div>
        {(website.qa_sessions ?? []).length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <p className="font-medium text-stone-900 dark:text-white">
              No QA sessions yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Create the first session to test this website against the
              checklist.
            </p>
            <Button className="mt-4" onClick={() => setCreatingQa(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New QA session
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-xs font-medium text-stone-500 dark:border-stone-800 dark:bg-stone-800/50">
                  <tr>
                    {[
                      "Session",
                      "Environment",
                      "Date and tester",
                      "Completion",
                      "Status",
                      "Failed",
                      "",
                    ].map((header, index) => (
                      <th
                        key={header || index}
                        className="whitespace-nowrap px-4 py-3 font-medium"
                        scope="col"
                      >
                        {header || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {website.qa_sessions.map((session) => (
                    <tr
                      key={session.id}
                      className={`align-middle hover:bg-stone-50/80 dark:hover:bg-stone-800/40 ${selectedSession?.id === session.id ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}
                    >
                      <td className="px-4 py-3.5 font-medium text-stone-900 dark:text-stone-100">
                        {session.session_name}
                      </td>
                      <td className="px-4 py-3.5">{session.environment}</td>
                      <td className="px-4 py-3.5">
                        <p>{formatDate(session.qa_date)}</p>
                        <p className="text-xs text-stone-500">
                          {session.qa_by}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            className="h-1.5 w-20"
                            label={`${session.session_name} completion`}
                            status={session.status}
                            value={session.progress_percentage}
                          />
                          <span className="text-xs tabular-nums text-stone-500">
                            {session.progress_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={session.status} />
                      </td>
                      <td className="px-4 py-3.5 tabular-nums">
                        {session.summary.failed}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <SessionActions
                          session={session}
                          onEdit={() => editSession(session)}
                          onView={() => reviewSession(session)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-stone-100 md:hidden dark:divide-stone-800">
              {website.qa_sessions.map((session) => (
                <li key={session.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">
                        {session.session_name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {session.environment}, {formatDate(session.qa_date)} by{" "}
                        {session.qa_by}
                      </p>
                    </div>
                    <Badge value={session.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      className="h-1.5 w-full"
                      label={`${session.session_name} completion`}
                      status={session.status}
                      value={session.progress_percentage}
                    />
                    <span className="text-xs tabular-nums text-stone-500">
                      {session.progress_percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500">
                      {session.summary.failed} failed
                    </span>
                    <SessionActions
                      session={session}
                      onEdit={() => editSession(session)}
                      onView={() => reviewSession(session)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Selected session: report modal + step-by-step editor */}
      {selectedSession && sessionForm && (
        <>
          <ReportModal
            open={reportOpen && !editingSession}
            session={selectedSession}
            onClose={() => setReportOpen(false)}
            onEdit={() => editSession(selectedSession)}
          />
          <Dialog
            open={editingSession}
            onOpenChange={(open) => {
              if (!open && !savingQa) closeSessionEditor();
            }}
          >
            <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden p-0 sm:max-w-5xl">
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={saveSession}
              >
                <DialogHeader className="shrink-0 border-b border-stone-200 px-5 py-4 text-left dark:border-stone-800">
                  <DialogTitle>
                    {getSessionDisplayName(
                      sessionForm.session_name,
                      sessionForm.session_name_detail,
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Step {sessionStep + 1} of {sessionWizardSteps.length}:{" "}
                    {sessionWizardSteps[sessionStep] ?? "Review & save"}
                  </DialogDescription>
                  <div
                    aria-label="QA session steps"
                    className="flex gap-2 overflow-x-auto pt-2"
                  >
                    {sessionWizardSteps.map((step, index) => (
                      <button
                        key={`${step}-${index}`}
                        aria-current={
                          sessionStep === index ? "step" : undefined
                        }
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          sessionStep === index
                            ? "bg-indigo-700 text-white"
                            : index < sessionStep
                              ? "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-200"
                              : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                        disabled={index > sessionStep}
                        onClick={() => setSessionStep(index)}
                        type="button"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                          {index < sessionStep ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        {step}
                      </button>
                    ))}
                  </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="space-y-6 p-5">
                    {sessionStep === 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field
                          label="Session name *"
                          htmlFor="edit-session-name"
                        >
                          <select
                            className={selectClass}
                            id="edit-session-name"
                            value={sessionForm.session_name}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                session_name: event.target.value,
                              })
                            }
                          >
                            {SESSION_NAME_OPTIONS.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                          {sessionForm.session_name === "Other" && (
                            <div className="pt-2">
                              <label
                                className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300"
                                htmlFor="edit-session-name-detail"
                              >
                                Specific detail
                              </label>
                              <Input
                                required
                                id="edit-session-name-detail"
                                maxLength={150}
                                value={sessionForm.session_name_detail ?? ""}
                                onChange={(event) =>
                                  setSessionForm({
                                    ...sessionForm,
                                    session_name_detail: event.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                        </Field>
                        <Field label="Environment" htmlFor="edit-session-env">
                          <select
                            className={selectClass}
                            id="edit-session-env"
                            value={sessionForm.environment}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                environment: event.target.value,
                              })
                            }
                          >
                            {ENVIRONMENTS.map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="QA Date *" htmlFor="edit-session-date">
                          <Input
                            required
                            id="edit-session-date"
                            type="date"
                            value={sessionForm.qa_date}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                qa_date: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label="QA By *" htmlFor="edit-session-tester">
                          <Input
                            required
                            id="edit-session-tester"
                            maxLength={150}
                            value={sessionForm.qa_by}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                qa_by: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field
                          className="sm:col-span-2 lg:col-span-4"
                          label="Session notes"
                        >
                          <textarea
                            className={`${textareaClass} min-h-20`}
                            value={sessionForm.notes ?? ""}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                notes: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    )}

                    {sessionGroups.map(
                      ([category, items], index) =>
                        sessionStep === index + 1 && (
                          <fieldset key={category} className="space-y-3">
                            <legend className="flex w-full items-center justify-between border-b border-stone-200 pb-2 text-sm font-semibold text-stone-900 dark:border-stone-800 dark:text-white">
                              {category}
                              <span className="text-xs font-normal text-stone-500">
                                {
                                  items.filter(
                                    (item) => item.result !== "Pending",
                                  ).length
                                }{" "}
                                of {items.length} answered
                              </span>
                            </legend>
                            {items.map((response) => {
                              const definition = checklist.find(
                                (item) =>
                                  item.id === response.checklist_item_id,
                              );
                              const showsIssueFields =
                                response.result === "Fail" ||
                                response.result === "Blocked";

                              return (
                                <article
                                  key={response.id}
                                  className="rounded-lg border border-stone-200 p-4 dark:border-stone-700"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1 basis-64">
                                      <h3 className="font-medium text-stone-900 dark:text-white">
                                        {response.title}
                                      </h3>
                                      {definition?.description && (
                                        <p className="mt-1 max-w-prose text-sm text-stone-500">
                                          {definition.description}
                                        </p>
                                      )}
                                    </div>
                                    <div
                                      aria-label={`Result for ${response.title}`}
                                      className="flex flex-wrap gap-1"
                                      role="radiogroup"
                                    >
                                      {QA_RESULTS.map((value) => {
                                        const active =
                                          response.result === value;
                                        return (
                                          <button
                                            key={value}
                                            aria-checked={active}
                                            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                                              active
                                                ? RESULT_ACTIVE[value]
                                                : "border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            }`}
                                            onClick={() =>
                                              updateResponse(response.id, {
                                                result: value,
                                              })
                                            }
                                            role="radio"
                                            type="button"
                                          >
                                            {RESULT_LABEL[value] ?? value}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <Field
                                    className="mt-3 text-xs"
                                    label="Checklist notes"
                                  >
                                    <textarea
                                      className={`${textareaClass} min-h-16 font-normal`}
                                      value={response.notes ?? ""}
                                      onChange={(event) =>
                                        updateResponse(response.id, {
                                          notes: event.target.value || null,
                                        })
                                      }
                                    />
                                  </Field>
                                  {showsIssueFields && (
                                    <div className="mt-3 grid gap-3 rounded-lg bg-rose-50/60 p-3 sm:grid-cols-2 dark:bg-rose-950/20">
                                      <Field
                                        className="text-xs"
                                        label="Severity"
                                      >
                                        <select
                                          className={`${selectClass} font-normal`}
                                          value={response.severity ?? ""}
                                          onChange={(event) =>
                                            updateResponse(response.id, {
                                              severity:
                                                event.target.value || null,
                                            })
                                          }
                                        >
                                          <option value="">
                                            Select severity
                                          </option>
                                          {SEVERITIES.map((value) => (
                                            <option key={value}>{value}</option>
                                          ))}
                                        </select>
                                      </Field>
                                      <Field
                                        className="text-xs"
                                        htmlFor={`evidence-${response.id}`}
                                        label="Evidence URL"
                                      >
                                        <Input
                                          id={`evidence-${response.id}`}
                                          type="url"
                                          value={response.evidence_url ?? ""}
                                          onChange={(event) =>
                                            updateResponse(response.id, {
                                              evidence_url:
                                                event.target.value || null,
                                            })
                                          }
                                        />
                                      </Field>
                                      <Field
                                        className="text-xs"
                                        label="Expected behavior"
                                      >
                                        <textarea
                                          className={`${textareaClass} min-h-16 font-normal`}
                                          value={
                                            response.expected_behavior ?? ""
                                          }
                                          onChange={(event) =>
                                            updateResponse(response.id, {
                                              expected_behavior:
                                                event.target.value || null,
                                            })
                                          }
                                        />
                                      </Field>
                                      <Field
                                        className="text-xs"
                                        label="Actual behavior"
                                      >
                                        <textarea
                                          className={`${textareaClass} min-h-16 font-normal`}
                                          value={response.actual_behavior ?? ""}
                                          onChange={(event) =>
                                            updateResponse(response.id, {
                                              actual_behavior:
                                                event.target.value || null,
                                            })
                                          }
                                        />
                                      </Field>
                                    </div>
                                  )}
                                </article>
                              );
                            })}
                          </fieldset>
                        ),
                    )}

                    {sessionStep === sessionGroups.length + 1 && (
                      <div className="grid gap-4 rounded-lg bg-stone-50 p-4 sm:grid-cols-2 dark:bg-stone-800">
                        <Field
                          htmlFor="qa-reviewer"
                          label="Reviewed or approved by (optional)"
                        >
                          <Input
                            id="qa-reviewer"
                            placeholder="Reviewer name"
                            required={approvalConfirmed}
                            value={sessionForm.reviewed_by ?? ""}
                            onChange={(event) =>
                              setSessionForm({
                                ...sessionForm,
                                reviewed_by: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                              checked={approvalConfirmed}
                              disabled={
                                currentSummary.pending > 0 ||
                                currentSummary.failed > 0 ||
                                currentSummary.blocked > 0 ||
                                currentSummary.passed === 0
                              }
                              type="checkbox"
                              onChange={(event) =>
                                setApprovalConfirmed(event.target.checked)
                              }
                            />
                            Confirm reviewer approval
                          </label>
                          <p className="text-xs text-stone-500">
                            Status is recalculated from the checklist. A session
                            needs approval before it can be marked Passed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-5 py-3 dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                    <Badge value={currentQaStatus} />
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        className="h-1.5 w-28"
                        label="Current QA checklist completion"
                        status={currentQaStatus}
                        value={currentProgress}
                      />
                      <span className="text-sm font-semibold tabular-nums">
                        {currentProgress}%
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      {currentSummary.passed} passed, {currentSummary.failed}{" "}
                      failed, {currentSummary.blocked} blocked,{" "}
                      {currentSummary.pending} pending,{" "}
                      {currentSummary.not_applicable} n/a
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={savingQa}
                      type="button"
                      variant="ghost"
                      onClick={closeSessionEditor}
                    >
                      Cancel
                    </Button>
                    {sessionStep > 0 && (
                      <Button
                        disabled={savingQa}
                        type="button"
                        variant="outline"
                        onClick={() => setSessionStep((current) => current - 1)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                    )}
                    {sessionStep < sessionGroups.length + 1 ? (
                      <>
                        <Button
                          disabled={savingQa}
                          onClick={() => void saveSession(undefined, true)}
                          type="button"
                          variant="outline"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {savingQa ? "Saving…" : "Save progress"}
                        </Button>
                        <Button
                          disabled={savingQa}
                          type="button"
                          onClick={advanceSessionStep}
                        >
                          Continue
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button disabled={savingQa} type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        {savingQa ? "Saving…" : "Save QA progress"}
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Edit website dialog */}
      <Dialog open={editingWebsite} onOpenChange={setEditingWebsite}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit website</DialogTitle>
            <DialogDescription>
              Phase and status are tracked separately.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveWebsite}>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["website_name", "Website name"],
                  ["website_url", "Website URL"],
                  ["client_name", "Client name"],
                  ["business_type", "Business type"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <Input
                    required
                    type={key === "website_url" ? "url" : "text"}
                    value={websiteForm[key] ?? ""}
                    onChange={(event) =>
                      setWebsiteForm({
                        ...websiteForm,
                        [key]: event.target.value,
                      })
                    }
                  />
                </Field>
              ))}
              <Field label="Project phase">
                <select
                  className={selectClass}
                  value={websiteForm.project_phase}
                  onChange={(event) =>
                    setWebsiteForm({
                      ...websiteForm,
                      project_phase: event.target.value,
                    })
                  }
                >
                  {PHASES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="Project status">
                <select
                  className={selectClass}
                  value={websiteForm.project_status}
                  onChange={(event) =>
                    setWebsiteForm({
                      ...websiteForm,
                      project_status: event.target.value,
                    })
                  }
                >
                  {PROJECT_STATUSES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field className="sm:col-span-2" label="Description">
                <textarea
                  className={`${textareaClass} min-h-24`}
                  value={websiteForm.description ?? ""}
                  onChange={(event) =>
                    setWebsiteForm({
                      ...websiteForm,
                      description: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                disabled={savingWebsite}
                type="button"
                variant="outline"
                onClick={() => setEditingWebsite(false)}
              >
                Cancel
              </Button>
              <Button disabled={savingWebsite} type="submit">
                <Save className="mr-2 h-4 w-4" />
                {savingWebsite ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New QA session dialog */}
      <Dialog open={creatingQa} onOpenChange={setCreatingQa}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New QA session</DialogTitle>
            <DialogDescription>
              The session starts with a fresh copy of the active checklist.
              Earlier results are not changed.
            </DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 dark:text-stone-300">
                <span>Step 1: Session details</span>
                <span>1 of {newSessionStepCount}</span>
              </div>
              <div
                aria-label="New QA session setup progress"
                aria-valuemax={newSessionStepCount}
                aria-valuemin={1}
                aria-valuenow={1}
                className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${100 / newSessionStepCount}%` }}
                />
              </div>
            </div>
          </DialogHeader>
          <form className="space-y-4" onSubmit={createSession}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Session name *" htmlFor="new-session-name">
                <select
                  className={selectClass}
                  id="new-session-name"
                  value={newSession.session_name}
                  onChange={(event) =>
                    setNewSession({
                      ...newSession,
                      session_name: event.target.value,
                    })
                  }
                >
                  {SESSION_NAME_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {newSession.session_name === "Other" && (
                  <div className="pt-2">
                    <label
                      className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300"
                      htmlFor="new-session-name-detail"
                    >
                      Specific detail
                    </label>
                    <Input
                      required
                      id="new-session-name-detail"
                      maxLength={150}
                      placeholder="e.g. Accessibility review"
                      value={newSession.session_name_detail}
                      onChange={(event) =>
                        setNewSession({
                          ...newSession,
                          session_name_detail: event.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </Field>
              <Field label="Environment *">
                <select
                  className={selectClass}
                  value={newSession.environment}
                  onChange={(event) =>
                    setNewSession({
                      ...newSession,
                      environment: event.target.value,
                    })
                  }
                >
                  {ENVIRONMENTS.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="QA Date *" htmlFor="new-session-date">
                <Input
                  required
                  id="new-session-date"
                  type="date"
                  value={newSession.qa_date}
                  onChange={(event) =>
                    setNewSession({
                      ...newSession,
                      qa_date: event.target.value,
                    })
                  }
                />
              </Field>
              <Field label="QA By *" htmlFor="new-session-tester">
                <Input
                  required
                  id="new-session-tester"
                  maxLength={150}
                  placeholder="Tester name"
                  value={newSession.qa_by}
                  onChange={(event) =>
                    setNewSession({ ...newSession, qa_by: event.target.value })
                  }
                />
              </Field>
              <Field className="sm:col-span-2" label="Session notes">
                <textarea
                  className={`${textareaClass} min-h-20`}
                  value={newSession.notes}
                  onChange={(event) =>
                    setNewSession({ ...newSession, notes: event.target.value })
                  }
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                disabled={savingQa}
                type="button"
                variant="outline"
                onClick={() => setCreatingQa(false)}
              >
                Cancel
              </Button>
              <Button disabled={savingQa} type="submit">
                {savingQa ? "Creating…" : "Create and open checklist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WebsiteDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center text-sm text-stone-500">
          Loading website details…
        </div>
      }
    >
      <WebsiteDetailsContent />
    </Suspense>
  );
}
