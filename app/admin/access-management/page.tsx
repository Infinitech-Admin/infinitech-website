"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  Ban,
  Check,
  Clock3,
  Copy,
  Eye,
  KeyRound,
  Loader,
  Pause,
  Play,
  Search,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ============================================================================
 * TYPES
 * ========================================================================== */

type Directory = {
  id: number;
  key: string;
  label: string;
  module: string;
  is_privileged: boolean;
  grantable_actions: Action[];
};

type Employee = {
  id: number;
  id_number: string;
  first_name: string;
  last_name: string;
  email_address: string;
};

type DirectoryGrant = {
  id: number;
  key: string;
  label: string;
  module: string;
  actions: string[];
};

type AccountStatus = "active" | "suspended" | "revoked";

type Account = {
  id: number;
  name: string;
  email: string;
  login_identifier: string;
  is_superadmin: boolean;
  initial_password: string | null;
  account_status: AccountStatus;
  last_login_at: string | null;
  created_at: string;
  employee: { id_number: string; name: string; email_address: string } | null;
  directories: DirectoryGrant[];
};

type CredentialDisclosure = {
  login_identifier: string;
  initial_password: string;
};

type AuditEvent = Record<string, unknown>;

type ConfirmRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
};

const ACTIONS = ["view", "create", "edit", "delete", "export"] as const;
type Action = (typeof ACTIONS)[number];
type Grants = Record<number, Action[]>;
type SetGrants = (update: (current: Grants) => Grants) => void;

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const SELECT_CONTENT_CLASS =
  "z-[999] border border-slate-200 bg-white text-slate-900 shadow-xl ";

const STATUS_STYLES: Record<AccountStatus, { badge: string; dot: string }> = {
  active: {
    badge: "bg-emerald-50 text-emerald-800 ",
    dot: "bg-emerald-500",
  },
  suspended: {
    badge: "bg-amber-50 text-amber-800 ",
    dot: "bg-amber-500",
  },
  revoked: {
    badge: "bg-rose-50 text-rose-800 ",
    dot: "bg-rose-500",
  },
};

const STATS = [
  {
    key: "total",
    label: "Total accounts",
    filter: "",
    icon: UsersRound,
    tone: "bg-blue-50 text-blue-700 ",
  },
  {
    key: "active",
    label: "Active",
    filter: "active",
    icon: Check,
    tone: "bg-emerald-50 text-emerald-700 ",
  },
  {
    key: "suspended",
    label: "Suspended",
    filter: "suspended",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-700 ",
  },
  {
    key: "revoked",
    label: "Revoked",
    filter: "revoked",
    icon: X,
    tone: "bg-rose-50 text-rose-700 ",
  },
] as const;

async function readJson(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.message || "The request could not be completed.");
  return result;
}

const fullName = (employee: Employee) =>
  `${employee.first_name} ${employee.last_name}`;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const grantsKey = (grants: Grants) =>
  JSON.stringify(
    Object.entries(grants)
      .map(([id, actions]) => [Number(id), [...actions].sort()] as const)
      .sort((a, b) => a[0] - b[0]),
  );

const makePayload = (grants: Grants) => ({
  directories: Object.entries(grants).map(([id, actions]) => ({
    id: Number(id),
    actions,
  })),
});

function withAction(
  existing: Action[],
  directory: Directory,
  action: Action,
): Action[] {
  const next = new Set<Action>(existing);
  next.add(action);
  if (action !== "view" && directory.grantable_actions?.includes("view")) {
    next.add("view");
  }
  return ACTIONS.filter((item) => next.has(item));
}

function withoutAction(existing: Action[], action: Action): Action[] {
  if (action === "view") return [];
  return existing.filter((item) => item !== action);
}

function setDirectoryActions(
  grants: Grants,
  directory: Directory,
  actions: Action[],
): Grants {
  const next = { ...grants };
  if (actions.length) next[directory.id] = actions;
  else delete next[directory.id];
  return next;
}

function toggleDirectory(current: Grants, directory: Directory): Grants {
  const next = { ...current };
  const grantable = ACTIONS.filter((action) =>
    directory.grantable_actions?.includes(action),
  );
  const selected = next[directory.id] || [];
  const allSelected =
    grantable.length > 0 &&
    grantable.every((action) => selected.includes(action));

  if (allSelected || grantable.length === 0) delete next[directory.id];
  else next[directory.id] = grantable;
  return next;
}

function toggleAction(
  current: Grants,
  directory: Directory,
  action: Action,
): Grants {
  const selected = current[directory.id] || [];
  const updated = selected.includes(action)
    ? withoutAction(selected, action)
    : withAction(selected, directory, action);
  return setDirectoryActions(current, directory, updated);
}

function toggleModuleAction(
  current: Grants,
  directories: Directory[],
  action: Action,
  grant: boolean,
): Grants {
  let next = current;
  for (const directory of directories) {
    const existing = next[directory.id] || [];
    const updated = grant
      ? withAction(existing, directory, action)
      : withoutAction(existing, action);
    next = setDirectoryActions(next, directory, updated);
  }
  return next;
}

/* ============================================================================
 * SMALL PRESENTATIONAL PIECES
 * ========================================================================== */

function StatusBadge({ status }: { status: AccountStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function Avatar({
  name,
  className = "h-10 w-10 text-sm",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${className}`}
    >
      {initials(name)}
    </span>
  );
}

function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 "
      role="alert"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </span>
      <button
        aria-label="Dismiss error"
        className="rounded p-1 hover:bg-rose-100 "
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500 ">{label}</dt>
      <dd
        className="mt-0.5 truncate text-sm font-medium text-slate-900 "
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function CredentialLine({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      toast.error("Unable to copy. Select the text and copy it manually.");
    }
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 ">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 ">
          {value}
        </code>
        <Button
          className="h-auto shrink-0"
          onClick={copy}
          size="sm"
          type="button"
          variant="outline"
        >
          {copied ? (
            <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="mr-1.5 h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

// Masked by default so the password is never visible in a screenshot or over a shoulder.
function PasswordReveal({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hide again whenever a different account/password is shown
  useEffect(() => setVisible(false), [value]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      toast.error("Unable to copy. Select the text and copy it manually.");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 ">
      <div className="min-w-0">
        <p className="text-xs font-medium text-amber-900 ">Initial password</p>
        <code className="mt-1 block break-all text-sm text-slate-900 ">
          {visible ? value : "••••••••••••"}
        </code>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => setVisible((current) => !current)}
          size="sm"
          type="button"
          variant="outline"
        >
          {visible ? "Hide" : "Show"}
        </Button>
        <Button onClick={copy} size="sm" type="button" variant="outline">
          {copied ? (
            <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="mr-1.5 h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

function AuditList({
  events,
  showActors = false,
}: {
  events: AuditEvent[];
  showActors?: boolean;
}) {
  if (!events.length) {
    return (
      <p className="px-4 py-6 text-center text-sm text-slate-500">
        No audit events recorded yet.
      </p>
    );
  }
  return (
    <ol className="divide-y divide-slate-100 ">
      {events.map((event, index) => {
        const outcome = String(event.outcome ?? "");
        const failed = /fail|denied|error/i.test(outcome);
        return (
          <li
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm"
            key={`${String(event.created_at)}-${index}`}
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900 ">
                {String(event.event)}
              </p>
              {showActors && (
                <p className="text-xs text-slate-500">
                  {String(
                    event.actor_name ||
                      `Account ${event.actor_user_id || "system"}`,
                  )}{" "}
                  →{" "}
                  {String(
                    event.affected_name ||
                      `Account ${event.affected_user_id || "unknown"}`,
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  failed
                    ? "bg-rose-50 text-rose-700 "
                    : "bg-slate-100 text-slate-600 "
                }`}
              >
                {outcome || "—"}
              </span>
              <time className="whitespace-nowrap text-xs text-slate-500">
                {formatDateTime(String(event.created_at))}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================================
 * PERMISSION MATRIX
 * One card per module: rows = directories, columns = actions. Column header
 * checkboxes grant/revoke an action for the whole module.
 * ========================================================================== */

function TriCheckbox({
  checked,
  indeterminate = false,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      aria-label={label}
      checked={checked}
      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onChange={onChange}
      ref={ref}
      type="checkbox"
    />
  );
}

function PermissionMatrix({
  groups,
  grants,
  setGrants,
  readOnly = false,
}: {
  groups: Record<string, Directory[]>;
  grants: Grants;
  setGrants: SetGrants;
  readOnly?: boolean;
}) {
  return (
    <div className="block space-y-5">
      {Object.entries(groups).map(([module, directories]) => {
        const grantedCount = directories.filter(
          (directory) => (grants[directory.id] || []).length > 0,
        ).length;
        const assignableDirectories = directories.filter(
          (directory) => directory.grantable_actions?.length,
        );
        const totalAssignableActions = assignableDirectories.reduce(
          (count, directory) => count + directory.grantable_actions.length,
          0,
        );
        const grantedAssignableActions = assignableDirectories.reduce(
          (count, directory) =>
            count +
            directory.grantable_actions.filter((action) =>
              (grants[directory.id] || []).includes(action),
            ).length,
          0,
        );
        const allModuleActionsGranted =
          totalAssignableActions > 0 &&
          grantedAssignableActions === totalAssignableActions;

        return (
          <section
            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white "
            key={module}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 ">
              <div className="flex items-center gap-2.5">
                <TriCheckbox
                  checked={allModuleActionsGranted}
                  disabled={readOnly || totalAssignableActions === 0}
                  indeterminate={
                    grantedAssignableActions > 0 && !allModuleActionsGranted
                  }
                  label={`Grant all access to all ${module} directories`}
                  onChange={() =>
                    setGrants((current) => {
                      const next = { ...current };
                      for (const directory of directories) {
                        if (allModuleActionsGranted) {
                          delete next[directory.id];
                        } else if (directory.grantable_actions?.length) {
                          next[directory.id] = directory.grantable_actions;
                        }
                      }
                      return next;
                    })
                  }
                />
                <h4 className="text-sm font-semibold text-slate-900 ">
                  {module}
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                {grantedCount} of {directories.length} granted
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 ">
                    <th className="px-4 py-2 text-left font-medium">
                      Directory
                    </th>
                    {ACTIONS.map((action) => {
                      const assignable = directories.filter((directory) =>
                        directory.grantable_actions?.includes(action),
                      );
                      const count = assignable.filter((directory) =>
                        (grants[directory.id] || []).includes(action),
                      ).length;
                      const all =
                        assignable.length > 0 && count === assignable.length;

                      return (
                        <th
                          className="w-[68px] px-1 py-2 text-center font-medium"
                          key={action}
                        >
                          <label className="flex cursor-pointer flex-col items-center gap-1 capitalize">
                            <span>{action}</span>
                            <TriCheckbox
                              checked={all}
                              disabled={readOnly || assignable.length === 0}
                              indeterminate={count > 0 && !all}
                              label={`${action} all ${module} directories`}
                              onChange={() =>
                                setGrants((current) =>
                                  toggleModuleAction(
                                    current,
                                    assignable,
                                    action,
                                    !all,
                                  ),
                                )
                              }
                            />
                          </label>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {directories.map((directory) => {
                    const actions = grants[directory.id] || [];

                    const grantable = ACTIONS.filter((action) =>
                      directory.grantable_actions?.includes(action),
                    );
                    const allGranted =
                      grantable.length > 0 &&
                      grantable.every((action) => actions.includes(action));

                    return (
                      <tr
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 "
                        key={directory.id}
                      >
                        <td className="px-4 py-2.5">
                          <label className="flex items-center gap-2.5 font-medium text-slate-800 ">
                            <TriCheckbox
                              checked={allGranted}
                              disabled={
                                readOnly ||
                                (!actions.length &&
                                  !directory.grantable_actions?.includes(
                                    "view",
                                  ))
                              }
                              indeterminate={actions.length > 0 && !allGranted}
                              label={`Grant all access to ${directory.label}`}
                              onChange={() =>
                                setGrants((current) =>
                                  toggleDirectory(current, directory),
                                )
                              }
                            />
                            <span>{directory.label}</span>
                            {directory.is_privileged && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ">
                                Admin directory
                              </span>
                            )}
                          </label>
                        </td>
                        {ACTIONS.map((action) => (
                          <td className="px-1 py-2.5 text-center" key={action}>
                            <TriCheckbox
                              checked={actions.includes(action)}
                              disabled={
                                readOnly ||
                                (!actions.includes(action) &&
                                  !directory.grantable_actions?.includes(
                                    action,
                                  ))
                              }
                              label={`${action} ${directory.label}`}
                              onChange={() =>
                                setGrants((current) =>
                                  toggleAction(current, directory, action),
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * PAGE
 * ========================================================================== */

export default function UserAccessManagementPage() {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [accessActions, setAccessActions] = useState<Action[]>([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    revoked: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [directoryFilter, setDirectoryFilter] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const accountsRequestRef = useRef(0);

  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [newAccountRole, setNewAccountRole] = useState<"admin" | "superadmin">(
    "admin",
  );
  const [newGrants, setNewGrants] = useState<Grants>({});

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editGrants, setEditGrants] = useState<Grants>({});
  const [audit, setAudit] = useState<AuditEvent[] | null>(null);

  const [systemAuditOpen, setSystemAuditOpen] = useState(false);
  const [systemAudit, setSystemAudit] = useState<AuditEvent[] | null>(null);

  const [credentials, setCredentials] = useState<CredentialDisclosure | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(
    null,
  );
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(
    null,
  );

  // Opens the confirmation modal and resolves true/false, so callers can
  // `await askConfirm(...)` exactly where they used `window.confirm(...)`.
  function askConfirm(request: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmRequest(request);
    });
  }

  function settleConfirm(confirmed: boolean) {
    confirmResolverRef.current?.(confirmed);
    confirmResolverRef.current = null;
    setConfirmRequest(null);
  }

  function notifyError(failure: unknown, fallback: string) {
    toast.error(failure instanceof Error ? failure.message : fallback);
  }

  const groupedDirectories = useMemo(
    () =>
      directories.reduce<Record<string, Directory[]>>((groups, directory) => {
        groups[directory.module] = [
          ...(groups[directory.module] || []),
          directory,
        ];
        return groups;
      }, {}),
    [directories],
  );

  const editDirty = useMemo(() => {
    if (!selectedAccount) return false;
    const original = Object.fromEntries(
      selectedAccount.directories.map((grant) => [
        grant.id,
        grant.actions as Action[],
      ]),
    ) as Grants;
    return grantsKey(original) !== grantsKey(editGrants);
  }, [selectedAccount, editGrants]);

  const filtersActive = Boolean(search.trim() || status || directoryFilter);
  const hasDirectoryAction = (key: string, action: Action) =>
    isSuperadmin ||
    (key === "user_access_management" && accessActions.includes(action)) ||
    directories.some(
      (directory) =>
        (directory.key === key || directory.key === "all_directory") &&
        directory.grantable_actions?.includes(action),
    );
  const canCreateAccounts = hasDirectoryAction(
    "user_access_management",
    "create",
  );
  const canEditAccounts = hasDirectoryAction("user_access_management", "edit");
  const canRevokeAccounts = hasDirectoryAction(
    "user_access_management",
    "delete",
  );
  const canViewAudit = hasDirectoryAction("system_audit_logs", "view");

  /* ── data loading ── */

  const loadAccounts = useCallback(async () => {
    const requestId = ++accountsRequestRef.current;
    setTableLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);
      if (directoryFilter) query.set("directory", directoryFilter);
      const result = await readJson(
        await fetch(`/api/admin/access-management/accounts?${query}`, {
          cache: "no-store",
        }),
      );
      if (requestId !== accountsRequestRef.current) return; // outdated response
      setAccounts(result.data.data);
      setCounts(result.counts);
    } catch (failure) {
      if (requestId !== accountsRequestRef.current) return;
      setError(
        failure instanceof Error ? failure.message : "Unable to load accounts.",
      );
    } finally {
      if (requestId === accountsRequestRef.current) {
        setTableLoading(false);
        setLoaded(true);
      }
    }
  }, [directoryFilter, search, status]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const session = await readJson(
          await fetch("/api/admin/session", { cache: "no-store" }),
        );
        if (!active) return;
        setIsSuperadmin(session.is_superadmin === true);
        const ownPermissions = (session.permissions || []) as Array<{
          key: string;
          actions: Action[];
        }>;
        setAccessActions(
          ownPermissions.find(
            (permission) => permission.key === "user_access_management",
          )?.actions || [],
        );
      } catch (failure) {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to load access permissions.",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await readJson(
          await fetch("/api/admin/access-management/directories", {
            cache: "no-store",
          }),
        );
        setDirectories(result.data);
      } catch (failure) {
        setError(
          failure instanceof Error
            ? failure.message
            : "Unable to load directories.",
        );
      }
    })();
  }, []);

  // Debounced: instant when the search box is empty, 300ms while typing.
  useEffect(() => {
    const timer = window.setTimeout(
      () => void loadAccounts(),
      search.trim() ? 300 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [loadAccounts, search]);

  useEffect(() => {
    if (!addAccountOpen) return;
    let active = true;

    const loadEligibleEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const result = await readJson(
          await fetch("/api/admin/access-management/employees?limit=500", {
            cache: "no-store",
          }),
        );
        if (active) setEmployees(result.data);
      } catch (failure) {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to load active employees.",
          );
        }
      } finally {
        if (active) setEmployeesLoading(false);
      }
    };

    void loadEligibleEmployees();
    return () => {
      active = false;
    };
  }, [addAccountOpen]);

  /* ── actions ── */

  function resetAddAccount() {
    setSelectedEmployee(null);
    setEmployees([]);
    setNewAccountRole("admin");
    setNewGrants({});
  }

  async function createAccount() {
    if (!selectedEmployee) return;
    const employee = selectedEmployee;
    const count = Object.keys(newGrants).length;

    const confirmed = await askConfirm({
      title: "Create this account?",
      description:
        newAccountRole === "superadmin"
          ? `An active superadmin account will be created for ${fullName(employee)} with unrestricted access to all admin directories. A 12-character one-time password will be generated.`
          : `An active admin account will be created for ${fullName(employee)} with access to ${count} ${count === 1 ? "directory" : "directories"}. A 12-character one-time password will be generated.`,
      confirmLabel: "Create account",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await readJson(
        await fetch("/api/admin/access-management/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: employee.id,
            admin_role: newAccountRole,
            ...(newAccountRole === "admin" ? makePayload(newGrants) : {}),
          }),
        }),
      );
      setCredentials({
        login_identifier: result.data.login_identifier,
        initial_password: result.initial_password,
      });
      resetAddAccount();
      setAddAccountOpen(false);
      toast.success(`Account created for ${fullName(employee)}.`);
      await loadAccounts();
    } catch (failure) {
      notifyError(failure, "Unable to create the account.");
    } finally {
      setBusy(false);
    }
  }

  function openAccount(account: Account) {
    setError("");
    setSelectedAccount(account);
    setEditGrants(
      Object.fromEntries(
        account.directories.map((grant) => [
          grant.id,
          grant.actions as Action[],
        ]),
      ),
    );
    setAudit(null);
  }

  async function savePermissions() {
    if (!selectedAccount) return;

    const confirmed = await askConfirm({
      title: "Replace permissions?",
      description: `All directory permissions for ${selectedAccount.name} will be replaced with your selection. Their active sessions will be revoked and they will need to sign in again.`,
      confirmLabel: "Save permissions",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await readJson(
        await fetch(
          `/api/admin/access-management/accounts/${selectedAccount.id}/permissions`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(makePayload(editGrants)),
          },
        ),
      );
      setSelectedAccount(result.data);
      setEditGrants(
        Object.fromEntries(
          result.data.directories.map((grant: DirectoryGrant) => [
            grant.id,
            grant.actions,
          ]),
        ),
      );
      toast.success("Permissions updated. Active sessions were revoked.");
      await loadAccounts();
    } catch (failure) {
      notifyError(failure, "Unable to update permissions.");
    } finally {
      setBusy(false);
    }
  }

  async function setAccountStatus(nextStatus: AccountStatus) {
    if (!selectedAccount) return;
    const name = selectedAccount.name;

    const copy = {
      revoked: {
        title: "Revoke this account?",
        description: `${name}'s account will be permanently revoked and they will lose all access.`,
        confirmLabel: "Revoke account",
        done: "Account revoked.",
        destructive: true,
      },
      suspended: {
        title: "Suspend this account?",
        description: `${name} will be signed out and unable to sign in until the account is reactivated.`,
        confirmLabel: "Suspend account",
        done: "Account suspended.",
        destructive: false,
      },
      active: {
        title: "Reactivate this account?",
        description: `${name} will be able to sign in again with their existing permissions.`,
        confirmLabel: "Reactivate account",
        done: "Account reactivated.",
        destructive: false,
      },
    }[nextStatus];

    const confirmed = await askConfirm({
      title: copy.title,
      description: copy.description,
      confirmLabel: copy.confirmLabel,
      destructive: copy.destructive,
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await readJson(
        await fetch(
          `/api/admin/access-management/accounts/${selectedAccount.id}${
            nextStatus === "revoked" ? "" : "/status"
          }`,
          {
            method: nextStatus === "revoked" ? "DELETE" : "PATCH",
            ...(nextStatus === "revoked"
              ? {}
              : {
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: nextStatus }),
                }),
          },
        ),
      );
      setSelectedAccount(result.data);
      toast.success(copy.done);
      await loadAccounts();
    } catch (failure) {
      notifyError(failure, "Unable to update account status.");
    } finally {
      setBusy(false);
    }
  }

  async function rotateCredentials() {
    if (!selectedAccount) return;

    const confirmed = await askConfirm({
      title: "Generate a new password?",
      description: `A new password will be generated for ${selectedAccount.name}. The old password stops working and all current sessions are revoked.`,
      confirmLabel: "Generate password",
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await readJson(
        await fetch(
          `/api/admin/access-management/accounts/${selectedAccount.id}/rotate-credentials`,
          {
            method: "POST",
          },
        ),
      );
      setCredentials(result);
      setSelectedAccount((current) =>
        current
          ? { ...current, initial_password: result.initial_password }
          : current,
      );
      toast.success("New credentials generated.");
      await loadAccounts();
    } catch (failure) {
      notifyError(failure, "Unable to rotate credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function setSuperadminRole(isSuperadmin: boolean) {
    if (!selectedAccount) return;
    const name = selectedAccount.name;
    const confirmed = await askConfirm({
      title: isSuperadmin
        ? "Grant superadmin access?"
        : "Remove superadmin access?",
      description: isSuperadmin
        ? `${name} will receive full access to every admin directory and be able to manage other superadmins. Their current sessions will be revoked.`
        : `${name} will lose superadmin access and return to regular directory permissions. Their current sessions will be revoked.`,
      confirmLabel: isSuperadmin
        ? "Grant superadmin access"
        : "Remove superadmin access",
      destructive: !isSuperadmin,
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await readJson(
        await fetch(
          `/api/admin/access-management/accounts/${selectedAccount.id}/superadmin`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_superadmin: isSuperadmin }),
          },
        ),
      );
      setSelectedAccount(result.data);
      setEditGrants(
        Object.fromEntries(
          result.data.directories.map((grant: DirectoryGrant) => [
            grant.id,
            grant.actions,
          ]),
        ),
      );
      toast.success(
        isSuperadmin
          ? "Superadmin access granted."
          : "Superadmin access removed.",
      );
      await loadAccounts();
    } catch (failure) {
      const failureMessage = failure instanceof Error ? failure.message : "";
      if (
        !isSuperadmin &&
        failureMessage.toLowerCase().includes("last active superadmin")
      ) {
        const message =
          "This is the only active superadmin. Promote another active account to superadmin first, then retry. At least one active superadmin must remain.";
        setError(message);
        toast.error(message);
      } else {
        notifyError(failure, "Unable to change the account role.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function loadAudit(account: Account) {
    try {
      const result = await readJson(
        await fetch(
          `/api/admin/access-management/accounts/${account.id}/audit`,
          { cache: "no-store" },
        ),
      );
      setAudit(result.data);
    } catch (failure) {
      notifyError(failure, "Unable to load account audit history.");
    }
  }

  async function openSystemAudit() {
    setSystemAuditOpen(true);
    setSystemAudit(null);
    try {
      const result = await readJson(
        await fetch("/api/admin/access-management/audit", {
          cache: "no-store",
        }),
      );
      setSystemAudit(result.data);
    } catch (failure) {
      notifyError(failure, "Unable to load system audit history.");
      setSystemAudit([]);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setDirectoryFilter("");
  }

  const dialogOpen =
    addAccountOpen || Boolean(selectedAccount) || systemAuditOpen;

  /* ── render ── */

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 text-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg ">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-12 sm:w-12">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-6 w-6 text-white sm:h-7 sm:w-7"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  User Access Management
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Create personnel accounts and control access to each admin
                  directory.
                </p>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              {canViewAudit && (
                <Button
                  className="h-11 border-white/40 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white"
                  onClick={openSystemAudit}
                  type="button"
                  variant="outline"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  System audit log
                </Button>
              )}
              {canCreateAccounts && (
                <Button
                  className="h-11 bg-white px-5 font-semibold text-blue-700 shadow-md hover:bg-blue-50"
                  onClick={() => setAddAccountOpen(true)}
                  type="button"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add account
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full min-w-0 space-y-5 py-5">
        {error && !dialogOpen && (
          <ErrorAlert message={error} onDismiss={() => setError("")} />
        )}

        {/* Stats double as status filters */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map(({ key, label, filter, icon: Icon, tone }) => {
            const selected = status === filter;
            return (
              <button
                aria-pressed={selected}
                className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selected
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200 "
                }`}
                key={key}
                onClick={() => setStatus(filter)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-500 ">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 ">
                    {counts[key]}
                  </p>
                </div>
                <span className={`shrink-0 rounded-xl p-2.5 ${tone}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Accounts */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ">
          <div className="border-b border-slate-100 p-4 sm:p-5 ">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search authorized accounts"
                  className="pl-9"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, employee ID, email, or login"
                  value={search}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  onValueChange={(value) =>
                    setStatus(value === "all" ? "" : value)
                  }
                  value={status || "all"}
                >
                  <SelectTrigger
                    aria-label="Filter by account status"
                    className="w-full sm:w-[160px]"
                  >
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent
                    className={SELECT_CONTENT_CLASS}
                    position="popper"
                  >
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    setDirectoryFilter(value === "all" ? "" : value)
                  }
                  value={directoryFilter || "all"}
                >
                  <SelectTrigger
                    aria-label="Filter by directory"
                    className="w-full sm:w-[210px]"
                  >
                    <SelectValue placeholder="All directories" />
                  </SelectTrigger>
                  <SelectContent
                    className={SELECT_CONTENT_CLASS}
                    position="popper"
                  >
                    <SelectItem value="all">All directories</SelectItem>
                    {directories.map((directory) => (
                      <SelectItem key={directory.id} value={directory.key}>
                        {directory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {filtersActive && (
                  <Button
                    className="shrink-0"
                    onClick={clearFilters}
                    type="button"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {!loaded ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Loading accounts…
            </div>
          ) : (
            <div
              aria-busy={tableLoading}
              className={`w-full overflow-x-auto transition-opacity ${tableLoading ? "opacity-60" : ""}`}
            >
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 ">
                  <tr>
                    <th className="h-11 px-4 py-3">Person</th>
                    <th className="hidden px-4 py-3 md:table-cell">
                      Login email
                    </th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 lg:table-cell">
                      Last login
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {accounts.map((account) => {
                    const preview = account.directories.slice(0, 2);
                    const extra = account.directories.length - preview.length;
                    return (
                      <tr
                        className="text-slate-700 transition-colors hover:bg-blue-50/50 "
                        key={account.id}
                      >
                        <td className="min-w-[220px] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={account.name} />
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate font-semibold text-slate-900 ">
                                {account.name}
                              </p>
                              <p className="max-w-[240px] truncate text-xs text-slate-500">
                                {account.employee?.id_number}
                                <span className="md:hidden">
                                  {account.employee?.id_number ? " · " : ""}
                                  {account.login_identifier}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs ">
                            {account.login_identifier}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          {account.is_superadmin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 ">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Superadmin
                            </span>
                          ) : account.directories.length === 0 ? (
                            <span className="text-xs text-slate-400">
                              No directories
                            </span>
                          ) : (
                            <div className="flex max-w-[260px] flex-wrap items-center gap-1">
                              {preview.map((grant) => (
                                <span
                                  className="max-w-[120px] truncate rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 "
                                  key={grant.id}
                                  title={grant.label}
                                >
                                  {grant.label}
                                </span>
                              ))}
                              {extra > 0 && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ">
                                  +{extra}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={account.account_status} />
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-slate-500 lg:table-cell">
                          {account.last_login_at
                            ? formatDateTime(account.last_login_at)
                            : "Never"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            onClick={() => openAccount(account)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Eye className="mr-1.5 h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {accounts.length === 0 && (
                    <tr>
                      <td className="px-4 py-16 text-center" colSpan={6}>
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ">
                          <UsersRound className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-slate-900 ">
                          No matching accounts
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {filtersActive
                            ? "Try changing the search or filters."
                            : "Add the first account to get started."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5 ">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}{" "}
            shown
          </div>
        </div>
      </div>

      {/* ── Add account dialog ── */}
      <Dialog
        onOpenChange={(open) => {
          if (busy && !open) return;
          setAddAccountOpen(open);
          if (!open) resetAddAccount();
        }}
        open={addAccountOpen}
      >
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl ring-1 ring-black/5 sm:w-full ">
          <DialogHeader className="shrink-0 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-purple-50 px-5 py-5 pr-12 text-left sm:px-7 ">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-600/20">
                <UserPlus aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <DialogTitle className="text-lg sm:text-xl">
                  Generate an authorized account
                </DialogTitle>
                <DialogDescription className="max-w-2xl leading-relaxed">
                  Choose personnel and an account role. Admin accounts need
                  directory permissions; superadmins have unrestricted access.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
            {error && (
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            )}

            <section>
              <div
                className={`grid gap-4 ${isSuperadmin ? "sm:grid-cols-2" : ""}`}
              >
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 ">
                    1. Choose personnel
                  </h3>
                  <Select
                    disabled={employeesLoading || employees.length === 0}
                    onValueChange={(value) => {
                      setSelectedEmployee(
                        employees.find(
                          (employee) => String(employee.id) === value,
                        ) || null,
                      );
                    }}
                    value={selectedEmployee ? String(selectedEmployee.id) : ""}
                  >
                    <SelectTrigger aria-label="Choose an active employee">
                      <SelectValue
                        placeholder={
                          employeesLoading
                            ? "Loading active employees..."
                            : employees.length === 0
                              ? "No eligible active employees"
                              : "Select an active employee"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      className={SELECT_CONTENT_CLASS}
                      position="popper"
                    >
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={String(employee.id)}
                        >
                          {fullName(employee)} · {employee.id_number} ·{" "}
                          {employee.email_address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isSuperadmin && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-900 ">
                      Account role
                    </h3>
                    <Select
                      onValueChange={(value) =>
                        setNewAccountRole(
                          value === "superadmin" ? "superadmin" : "admin",
                        )
                      }
                      value={newAccountRole}
                    >
                      <SelectTrigger aria-label="Choose account role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={SELECT_CONTENT_CLASS}
                        position="popper"
                      >
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {employees.length === 0 && !employeesLoading && !error && (
                <p className="mt-2 text-sm text-slate-500">
                  No active employees with a valid email are available for
                  account creation.
                </p>
              )}
            </section>

            {newAccountRole === "admin" ? (
              <section>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 ">
                      2. Directory permissions
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Grant only the directories and actions this role needs.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {Object.keys(newGrants).length} selected
                  </span>
                </div>
                <PermissionMatrix
                  grants={newGrants}
                  groups={groupedDirectories}
                  setGrants={setNewGrants}
                />
              </section>
            ) : (
              <section className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800 ">
                Superadmins have unrestricted access to all admin directories.
                Directory permissions do not need to be assigned.
              </section>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 ">
            <p className="text-sm text-slate-600 ">
              <span className="font-medium text-slate-900 ">
                {selectedEmployee
                  ? `${fullName(selectedEmployee)} (${selectedEmployee.id_number})`
                  : "No person selected"}
              </span>
              {" · "}
              {newAccountRole === "superadmin"
                ? "Superadmin · unrestricted access"
                : `${Object.keys(newGrants).length} ${
                    Object.keys(newGrants).length === 1
                      ? "directory"
                      : "directories"
                  }`}
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              disabled={
                busy ||
                !selectedEmployee ||
                (newAccountRole === "admin" &&
                  Object.keys(newGrants).length === 0)
              }
              onClick={createAccount}
              type="button"
            >
              {busy ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {busy ? "Generating..." : "Generate account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Account detail dialog ── */}
      <Dialog
        onOpenChange={(open) => {
          if (!open && !busy) setSelectedAccount(null);
        }}
        open={Boolean(selectedAccount)}
      >
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl ring-1 ring-black/5 sm:w-full ">
          {selectedAccount && (
            <>
              <DialogHeader className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 px-5 py-5 pr-12 text-left sm:px-7 ">
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-12 w-12 text-base ring-4 ring-white shadow-sm "
                    name={selectedAccount.name}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="truncate text-lg sm:text-xl">
                        {selectedAccount.name}
                      </DialogTitle>
                      <StatusBadge status={selectedAccount.account_status} />
                      {selectedAccount.is_superadmin && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Superadmin
                        </span>
                      )}
                    </div>
                    <DialogDescription className="mt-0.5 truncate">
                      Manage directory access, credentials, and account status.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
                {error && (
                  <ErrorAlert message={error} onDismiss={() => setError("")} />
                )}

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3 lg:grid-cols-5 ">
                  <InfoItem
                    label="Employee ID"
                    value={selectedAccount.employee?.id_number || "—"}
                  />
                  <InfoItem
                    label="Login email"
                    value={selectedAccount.login_identifier}
                  />
                  <InfoItem
                    label="Contact email"
                    value={selectedAccount.email}
                  />
                  <InfoItem
                    label="Created"
                    value={formatDateTime(selectedAccount.created_at)}
                  />
                  <InfoItem
                    label="Last login"
                    value={
                      selectedAccount.last_login_at
                        ? formatDateTime(selectedAccount.last_login_at)
                        : "Never"
                    }
                  />
                </dl>

                {selectedAccount.initial_password && (
                  <PasswordReveal value={selectedAccount.initial_password} />
                )}

                {selectedAccount.is_superadmin ? (
                  <section className="rounded-xl border border-purple-200 bg-purple-50 p-4 ">
                    <h3 className="text-sm font-semibold text-purple-900 ">
                      Superadmin access
                    </h3>
                    <p className="mt-1 text-sm text-purple-800 ">
                      This account can access every admin directory.
                      Directory-level permissions do not limit superadmins.
                    </p>
                  </section>
                ) : (
                  <section>
                    <h3 className="text-sm font-semibold text-slate-900 ">
                      Directory and action permissions
                    </h3>
                    <p className="mb-3 mt-0.5 text-sm text-slate-500">
                      Saving permission changes revokes the account’s active
                      sessions.
                    </p>
                    <PermissionMatrix
                      grants={editGrants}
                      groups={groupedDirectories}
                      readOnly={!canEditAccounts}
                      setGrants={setEditGrants}
                    />
                  </section>
                )}

                {audit && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-slate-900 ">
                      Audit history
                    </h3>
                    <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 ">
                      <AuditList events={audit} />
                    </div>
                  </section>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-7 lg:flex-row lg:items-center lg:justify-between ">
                <div className="flex flex-wrap gap-2">
                  {canEditAccounts && (
                    <>
                      {(!selectedAccount.is_superadmin || isSuperadmin) && (
                        <Button
                          disabled={busy}
                          onClick={rotateCredentials}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <KeyRound className="mr-1.5 h-4 w-4" />
                          Rotate credentials
                        </Button>
                      )}
                      {!selectedAccount.is_superadmin &&
                        selectedAccount.account_status === "active" && (
                          <Button
                            disabled={busy}
                            onClick={() => setAccountStatus("suspended")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Pause className="mr-1.5 h-4 w-4" />
                            Suspend
                          </Button>
                        )}
                      {!selectedAccount.is_superadmin &&
                        selectedAccount.account_status === "suspended" && (
                          <Button
                            disabled={busy}
                            onClick={() => setAccountStatus("active")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Play className="mr-1.5 h-4 w-4" />
                            Reactivate
                          </Button>
                        )}
                    </>
                  )}
                  {canRevokeAccounts &&
                    !selectedAccount.is_superadmin &&
                    selectedAccount.account_status !== "revoked" && (
                      <Button
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 "
                        disabled={busy}
                        onClick={() => setAccountStatus("revoked")}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Ban className="mr-1.5 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  {canViewAudit && (
                    <Button
                      onClick={() => loadAudit(selectedAccount)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Activity className="mr-1.5 h-4 w-4" />
                      Audit history
                    </Button>
                  )}
                  {isSuperadmin &&
                    selectedAccount.account_status === "active" && (
                      <Button
                        className={
                          selectedAccount.is_superadmin
                            ? "border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 "
                            : "border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 "
                        }
                        disabled={busy}
                        onClick={() =>
                          void setSuperadminRole(!selectedAccount.is_superadmin)
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <ShieldCheck className="mr-1.5 h-4 w-4" />
                        {selectedAccount.is_superadmin
                          ? "Remove superadmin"
                          : "Make superadmin"}
                      </Button>
                    )}
                </div>

                {canEditAccounts && !selectedAccount.is_superadmin && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 lg:shrink-0"
                    disabled={busy || !editDirty}
                    onClick={savePermissions}
                    type="button"
                  >
                    {busy ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save permissions
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── System audit dialog ── */}
      <Dialog onOpenChange={setSystemAuditOpen} open={systemAuditOpen}>
        <DialogContent className="flex max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl ring-1 ring-black/5 sm:w-full ">
          <DialogHeader className="shrink-0 border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 px-5 py-5 pr-12 text-left sm:px-7 ">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 ">
                <Activity aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <DialogTitle className="text-lg sm:text-xl">
                  System audit log
                </DialogTitle>
                <DialogDescription>
                  Recent access-management events across all accounts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white ">
            {error && (
              <div className="p-4">
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              </div>
            )}
            {systemAudit === null ? (
              <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Loading audit log…
              </div>
            ) : (
              <AuditList events={systemAudit} showActors />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── One-time credentials (modal so it is never hidden behind another dialog) ── */}
      <Dialog open={Boolean(credentials)}>
        <DialogContent
          className="w-[calc(100%-1.5rem)] max-w-lg rounded-2xl border-slate-200 bg-white p-0 shadow-2xl ring-1 ring-black/5 "
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 pr-12 text-left sm:px-6 ">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ">
                <KeyRound aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <DialogTitle className="text-lg sm:text-xl">
                  One-time credentials
                </DialogTitle>
                <DialogDescription className="leading-relaxed">
                  Copy and deliver these securely. The employee signs in with
                  their email and this 12-character initial password.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4 p-5">
              <CredentialLine
                label="Login email"
                value={credentials.login_identifier}
              />
              <CredentialLine
                label="Initial password"
                value={credentials.initial_password}
              />
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 ">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                Share this only with the employee it was issued to.
              </div>
              <Button
                className="h-11 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-md shadow-blue-600/15 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setCredentials(null)}
                type="button"
              >
                I have saved these credentials
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirmation modal (replaces window.confirm) ── */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) settleConfirm(false);
        }}
        open={Boolean(confirmRequest)}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-2xl border-slate-200 bg-white p-0 shadow-2xl ring-1 ring-black/5 ">
          <DialogHeader
            className={`border-b px-5 py-5 pr-12 text-left sm:px-6 ${
              confirmRequest?.destructive
                ? "border-rose-100 bg-gradient-to-r from-rose-50 via-white to-orange-50 "
                : "border-blue-100 bg-gradient-to-r from-blue-50 via-white to-purple-50 "
            }`}
          >
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              {confirmRequest?.destructive ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 ">
                  <AlertTriangle aria-hidden="true" className="h-5 w-5" />
                </span>
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 ">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                </span>
              )}
              {confirmRequest?.title}
            </DialogTitle>
            <DialogDescription className="pl-11 leading-relaxed">
              {confirmRequest?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 px-5 py-4 sm:px-6">
            <Button
              onClick={() => settleConfirm(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className={
                confirmRequest?.destructive
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }
              onClick={() => settleConfirm(true)}
              type="button"
            >
              {confirmRequest?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
