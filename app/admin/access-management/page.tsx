"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  initial_password: string | null;
  account_status: AccountStatus;
  last_login_at: string | null;
  created_at: string;
  employee: { id_number: string; name: string; email_address: string } | null;
  directories: DirectoryGrant[];
};

type CredentialDisclosure = { login_identifier: string; initial_password: string };
type AuditEvent = Record<string, unknown>;

const ACTIONS = ["view", "create", "edit", "delete", "export"] as const;
type Action = (typeof ACTIONS)[number];
type Grants = Record<number, Action[]>;
type SetGrants = (update: (current: Grants) => Grants) => void;

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const SELECT_CONTENT_CLASS =
  "z-[999] border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const STATUS_STYLES: Record<AccountStatus, { badge: string; dot: string }> = {
  active: {
    badge: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  suspended: {
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  revoked: {
    badge: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const STATS = [
  { key: "total", label: "Total accounts", filter: "", icon: UsersRound, tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  { key: "active", label: "Active", filter: "active", icon: Check, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { key: "suspended", label: "Suspended", filter: "suspended", icon: Clock3, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  { key: "revoked", label: "Revoked", filter: "revoked", icon: X, tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
] as const;

async function readJson(response: Response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "The request could not be completed.");
  return result;
}

const fullName = (employee: Employee) => `${employee.first_name} ${employee.last_name}`;

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

function toggleDirectory(current: Grants, directory: Directory): Grants {
  const next = { ...current };
  if ((next[directory.id] || []).length) delete next[directory.id];
  else next[directory.id] = ["view"];
  return next;
}

// Granting any action on an un-granted directory also grants "view".
function toggleAction(current: Grants, directory: Directory, action: Action): Grants {
  const next = { ...current };
  const selected = next[directory.id] || [];
  if (!selected.length) {
    next[directory.id] = action === "view" ? ["view"] : ["view", action];
    return next;
  }
  const actions = selected.includes(action)
    ? selected.filter((item) => item !== action)
    : [...selected, action];
  if (actions.length) next[directory.id] = actions;
  else delete next[directory.id];
  return next;
}

function toggleModuleAction(
  current: Grants,
  directories: Directory[],
  action: Action,
  grant: boolean,
): Grants {
  const next = { ...current };
  for (const directory of directories) {
    const existing = next[directory.id] || [];
    let updated: Action[];
    if (grant) {
      updated = existing.includes(action)
        ? existing
        : existing.length || action === "view"
          ? [...existing, action]
          : ["view", action];
    } else {
      updated = existing.filter((item) => item !== action);
    }
    if (updated.length) next[directory.id] = updated;
    else delete next[directory.id];
  }
  return next;
}

/* ============================================================================
 * SMALL PRESENTATIONAL PIECES
 * ========================================================================== */

function StatusBadge({ status }: { status: AccountStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function Avatar({ name, className = "h-10 w-10 text-sm" }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 ${className}`}
    >
      {initials(name)}
    </span>
  );
}

function ErrorAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
      role="alert"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </span>
      <button
        aria-label="Dismiss error"
        className="rounded p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50"
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
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100" title={value}>
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
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          {value}
        </code>
        <Button className="h-auto shrink-0" onClick={copy} size="sm" type="button" variant="outline">
          {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
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
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="min-w-0">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Initial password</p>
        <code className="mt-1 block break-all text-sm text-slate-900 dark:text-white">
          {visible ? value : "••••••••••••"}
        </code>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setVisible((current) => !current)} size="sm" type="button" variant="outline">
          {visible ? "Hide" : "Show"}
        </Button>
        <Button onClick={copy} size="sm" type="button" variant="outline">
          {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

function AuditList({ events, showActors = false }: { events: AuditEvent[]; showActors?: boolean }) {
  if (!events.length) {
    return <p className="px-4 py-6 text-center text-sm text-slate-500">No audit events recorded yet.</p>;
  }
  return (
    <ol className="divide-y divide-slate-100 dark:divide-slate-800">
      {events.map((event, index) => {
        const outcome = String(event.outcome ?? "");
        const failed = /fail|denied|error/i.test(outcome);
        return (
          <li
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm"
            key={`${String(event.created_at)}-${index}`}
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100">{String(event.event)}</p>
              {showActors && (
                <p className="text-xs text-slate-500">
                  {String(event.actor_name || `Account ${event.actor_user_id || "system"}`)} →{" "}
                  {String(event.affected_name || `Account ${event.affected_user_id || "unknown"}`)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  failed
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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
        const grantedCount = directories.filter((directory) => (grants[directory.id] || []).length > 0).length;

        return (
          <section
            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
            key={module}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{module}</h4>
              <span className="text-xs text-slate-500">
                {grantedCount} of {directories.length} granted
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800">
                    <th className="px-4 py-2 text-left font-medium">Directory</th>
                    {ACTIONS.map((action) => {
                      const assignable = directories.filter((directory) =>
                        directory.grantable_actions?.includes(action),
                      );
                      const count = assignable.filter((directory) =>
                        (grants[directory.id] || []).includes(action),
                      ).length;
                      const all = assignable.length > 0 && count === assignable.length;

                      return (
                        <th className="w-[68px] px-1 py-2 text-center font-medium" key={action}>
                          <label className="flex cursor-pointer flex-col items-center gap-1 capitalize">
                            <span>{action}</span>
                            <TriCheckbox
                              checked={all}
                              disabled={readOnly || assignable.length === 0}
                              indeterminate={count > 0 && !all}
                              label={`${action} all ${module} directories`}
                              onChange={() =>
                                setGrants((current) => toggleModuleAction(current, assignable, action, !all))
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
                    return (
                      <tr
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/40"
                        key={directory.id}
                      >
                        <td className="px-4 py-2.5">
                          <label className="flex items-center gap-2.5 font-medium text-slate-800 dark:text-slate-200">
                            <TriCheckbox
                              checked={actions.length > 0}
                              disabled={readOnly || (!actions.length && !directory.grantable_actions?.includes("view"))}
                              label={`Grant access to ${directory.label}`}
                              onChange={() => setGrants((current) => toggleDirectory(current, directory))}
                            />
                            <span>{directory.label}</span>
                            {directory.is_privileged && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">
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
                                (!actions.includes(action) && !directory.grantable_actions?.includes(action))
                              }
                              label={`${action} ${directory.label}`}
                              onChange={() => setGrants((current) => toggleAction(current, directory, action))}
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
  const [counts, setCounts] = useState({ total: 0, active: 0, suspended: 0, revoked: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [directoryFilter, setDirectoryFilter] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const accountsRequestRef = useRef(0);

  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newGrants, setNewGrants] = useState<Grants>({});

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editGrants, setEditGrants] = useState<Grants>({});
  const [audit, setAudit] = useState<AuditEvent[] | null>(null);

  const [systemAuditOpen, setSystemAuditOpen] = useState(false);
  const [systemAudit, setSystemAudit] = useState<AuditEvent[] | null>(null);

  const [credentials, setCredentials] = useState<CredentialDisclosure | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const groupedDirectories = useMemo(
    () =>
      directories.reduce<Record<string, Directory[]>>((groups, directory) => {
        groups[directory.module] = [...(groups[directory.module] || []), directory];
        return groups;
      }, {}),
    [directories],
  );

  const editDirty = useMemo(() => {
    if (!selectedAccount) return false;
    const original = Object.fromEntries(
      selectedAccount.directories.map((grant) => [grant.id, grant.actions as Action[]]),
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
  const canCreateAccounts = hasDirectoryAction("user_access_management", "create");
  const canEditAccounts = hasDirectoryAction("user_access_management", "edit");
  const canRevokeAccounts = hasDirectoryAction("user_access_management", "delete");
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
        await fetch(`/api/admin/access-management/accounts?${query}`, { cache: "no-store" }),
      );
      if (requestId !== accountsRequestRef.current) return; // outdated response
      setAccounts(result.data.data);
      setCounts(result.counts);
    } catch (failure) {
      if (requestId !== accountsRequestRef.current) return;
      setError(failure instanceof Error ? failure.message : "Unable to load accounts.");
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
          ownPermissions.find((permission) => permission.key === "user_access_management")?.actions || [],
        );
      } catch (failure) {
        if (active) {
          setError(failure instanceof Error ? failure.message : "Unable to load access permissions.");
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
          await fetch("/api/admin/access-management/directories", { cache: "no-store" }),
        );
        setDirectories(result.data);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Unable to load directories.");
      }
    })();
  }, []);

  // Debounced: instant when the search box is empty, 300ms while typing.
  useEffect(() => {
    const timer = window.setTimeout(() => void loadAccounts(), search.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadAccounts, search]);

  useEffect(() => {
    if (!addAccountOpen) return;
    let active = true;

    const loadEligibleEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const result = await readJson(
          await fetch("/api/admin/access-management/employees?limit=500", { cache: "no-store" }),
        );
        if (active) setEmployees(result.data);
      } catch (failure) {
        if (active) {
          setError(failure instanceof Error ? failure.message : "Unable to load active employees.");
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
    setNewGrants({});
  }

  async function createAccount() {
    if (!selectedEmployee) return;
    if (!window.confirm(`Create an active account for ${fullName(selectedEmployee)} with the selected directory permissions?`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await readJson(
        await fetch("/api/admin/access-management/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: selectedEmployee.id, ...makePayload(newGrants) }),
        }),
      );
      setCredentials({
        login_identifier: result.data.login_identifier,
        initial_password: result.initial_password,
      });
      resetAddAccount();
      setAddAccountOpen(false);
      await loadAccounts();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create the account.");
    } finally {
      setBusy(false);
    }
  }

  function openAccount(account: Account) {
    setError("");
    setSelectedAccount(account);
    setEditGrants(
      Object.fromEntries(account.directories.map((grant) => [grant.id, grant.actions as Action[]])),
    );
    setAudit(null);
  }

  async function savePermissions() {
    if (!selectedAccount) return;
    if (!window.confirm(`Replace all directory permissions for ${selectedAccount.name}? Existing sessions will be revoked.`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await readJson(
        await fetch(`/api/admin/access-management/accounts/${selectedAccount.id}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(makePayload(editGrants)),
        }),
      );
      setSelectedAccount(result.data);
      setEditGrants(
        Object.fromEntries(result.data.directories.map((grant: DirectoryGrant) => [grant.id, grant.actions])),
      );
      await loadAccounts();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to update permissions.");
    } finally {
      setBusy(false);
    }
  }

  async function setAccountStatus(nextStatus: AccountStatus) {
    if (!selectedAccount) return;
    const verb = nextStatus === "revoked" ? "Revoke" : nextStatus === "suspended" ? "Suspend" : "Reactivate";
    if (!window.confirm(`${verb} ${selectedAccount.name}'s account?`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await readJson(
        await fetch(`/api/admin/access-management/accounts/${selectedAccount.id}/status`, {
          method: nextStatus === "revoked" ? "DELETE" : "PATCH",
          ...(nextStatus === "revoked"
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
              }),
        }),
      );
      setSelectedAccount(result.data);
      await loadAccounts();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to update account status.");
    } finally {
      setBusy(false);
    }
  }

  async function rotateCredentials() {
    if (!selectedAccount) return;
    if (!window.confirm(`Generate a new password for ${selectedAccount.name}? All current sessions will be revoked.`)) return;
    setBusy(true);
    setError("");
    try {
      const result = await readJson(
        await fetch(`/api/admin/access-management/accounts/${selectedAccount.id}/rotate-credentials`, {
          method: "POST",
        }),
      );
      setCredentials(result);
      setSelectedAccount((current) =>
        current ? { ...current, initial_password: result.initial_password } : current,
      );
      await loadAccounts();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to rotate credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAudit(account: Account) {
    try {
      const result = await readJson(
        await fetch(`/api/admin/access-management/accounts/${account.id}/audit`, { cache: "no-store" }),
      );
      setAudit(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to load account audit history.");
    }
  }

  async function openSystemAudit() {
    setSystemAuditOpen(true);
    setSystemAudit(null);
    try {
      const result = await readJson(
        await fetch("/api/admin/access-management/audit", { cache: "no-store" }),
      );
      setSystemAudit(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to load system audit history.");
      setSystemAudit([]);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setDirectoryFilter("");
  }

  const dialogOpen = addAccountOpen || Boolean(selectedAccount) || systemAuditOpen;

  /* ── render ── */

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg dark:from-blue-900 dark:to-purple-900">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 sm:h-12 sm:w-12">
                <ShieldCheck aria-hidden="true" className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  User Access Management
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Create personnel accounts and control access to each admin directory.
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

      <div className="w-full min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {error && !dialogOpen && <ErrorAlert message={error} onDismiss={() => setError("")} />}

        {/* Stats double as status filters */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map(({ key, label, filter, icon: Icon, tone }) => {
            const selected = status === filter;
            return (
              <button
                aria-pressed={selected}
                className={`flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-950 dark:hover:border-blue-700 ${
                  selected
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
                key={key}
                onClick={() => setStatus(filter)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Authorized accounts</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Search, filter, review permissions, and manage account status.
              </p>
            </div>

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
                  onValueChange={(value) => setStatus(value === "all" ? "" : value)}
                  value={status || "all"}
                >
                  <SelectTrigger aria-label="Filter by account status" className="w-full sm:w-[160px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => setDirectoryFilter(value === "all" ? "" : value)}
                  value={directoryFilter || "all"}
                >
                  <SelectTrigger aria-label="Filter by directory" className="w-full sm:w-[210px]">
                    <SelectValue placeholder="All directories" />
                  </SelectTrigger>
                  <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                    <SelectItem value="all">All directories</SelectItem>
                    {directories.map((directory) => (
                        <SelectItem key={directory.id} value={directory.key}>
                          {directory.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {filtersActive && (
                  <Button className="shrink-0" onClick={clearFilters} type="button" variant="ghost">
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
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                  <tr>
                    <th className="h-11 px-4 py-3">Person</th>
                    <th className="hidden px-4 py-3 md:table-cell">Login email</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="hidden px-4 py-3 lg:table-cell">Last login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accounts.map((account) => {
                    const preview = account.directories.slice(0, 2);
                    const extra = account.directories.length - preview.length;
                    return (
                      <tr
                        className="text-slate-700 transition-colors hover:bg-blue-50/50 dark:text-slate-200 dark:hover:bg-slate-900/60"
                        key={account.id}
                      >
                        <td className="min-w-[220px] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={account.name} />
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate font-semibold text-slate-900 dark:text-white">
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
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                            {account.login_identifier}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          {account.directories.length === 0 ? (
                            <span className="text-xs text-slate-400">No directories</span>
                          ) : (
                            <div className="flex max-w-[260px] flex-wrap items-center gap-1">
                              {preview.map((grant) => (
                                <span
                                  className="max-w-[120px] truncate rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                  key={grant.id}
                                  title={grant.label}
                                >
                                  {grant.label}
                                </span>
                              ))}
                              {extra > 0 && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
                          {account.last_login_at ? formatDateTime(account.last_login_at) : "Never"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => openAccount(account)} size="sm" type="button" variant="outline">
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
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <UsersRound className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">No matching accounts</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {filtersActive ? "Try changing the search or filters." : "Add the first account to get started."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5 dark:border-slate-800">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"} shown
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
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 pr-12 text-left sm:px-6 dark:border-slate-800">
            <DialogTitle>Generate an authorized account</DialogTitle>
            <DialogDescription>
              Select a personnel record, assign directory actions, then review before creating credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">1. Choose personnel</h3>
              <Select
                disabled={employeesLoading || employees.length === 0}
                onValueChange={(value) => {
                  setSelectedEmployee(employees.find((employee) => String(employee.id) === value) || null);
                }}
                value={selectedEmployee ? String(selectedEmployee.id) : ""}
              >
                <SelectTrigger aria-label="Choose an active employee" className="max-w-2xl">
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
                <SelectContent className={SELECT_CONTENT_CLASS} position="popper">
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {fullName(employee)} · {employee.id_number} · {employee.email_address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employees.length === 0 && !employeesLoading && !error && (
                <p className="mt-2 text-sm text-slate-500">
                  No active employees with a valid email are available for account creation.
                </p>
              )}
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">2. Directory permissions</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Grant only the directories and actions this role needs.
                  </p>
                </div>
                <span className="text-xs text-slate-500">{Object.keys(newGrants).length} selected</span>
              </div>
              <PermissionMatrix grants={newGrants} groups={groupedDirectories} setGrants={setNewGrants} />
            </section>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-900 dark:text-white">
                {selectedEmployee
                  ? `${fullName(selectedEmployee)} (${selectedEmployee.id_number})`
                  : "No person selected"}
              </span>
              {" · "}
              {Object.keys(newGrants).length} {Object.keys(newGrants).length === 1 ? "directory" : "directories"}
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              disabled={busy || !selectedEmployee || Object.keys(newGrants).length === 0}
              onClick={createAccount}
              type="button"
            >
              {busy ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
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
        <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          {selectedAccount && (
            <>
              <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 pr-12 text-left sm:px-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 text-base" name={selectedAccount.name} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="truncate">{selectedAccount.name}</DialogTitle>
                      <StatusBadge status={selectedAccount.account_status} />
                    </div>
                    <DialogDescription className="mt-0.5 truncate">
                      Manage directory access, credentials, and account status.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900/40">
                  <InfoItem label="Employee ID" value={selectedAccount.employee?.id_number || "—"} />
                  <InfoItem label="Login email" value={selectedAccount.login_identifier} />
                  <InfoItem label="Contact email" value={selectedAccount.email} />
                  <InfoItem label="Created" value={formatDateTime(selectedAccount.created_at)} />
                  <InfoItem
                    label="Last login"
                    value={selectedAccount.last_login_at ? formatDateTime(selectedAccount.last_login_at) : "Never"}
                  />
                </dl>

                {selectedAccount.initial_password && (
                  <PasswordReveal value={selectedAccount.initial_password} />
                )}

                <section>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Directory and action permissions
                  </h3>
                  <p className="mb-3 mt-0.5 text-sm text-slate-500">
                    Saving permission changes revokes the account’s active sessions.
                  </p>
                  <PermissionMatrix
                    grants={editGrants}
                    groups={groupedDirectories}
                    readOnly={!canEditAccounts}
                    setGrants={setEditGrants}
                  />
                </section>

                {audit && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Audit history</h3>
                    <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <AuditList events={audit} />
                    </div>
                  </section>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-wrap gap-2">
                  {canEditAccounts && (
                    <>
                      <Button disabled={busy} onClick={rotateCredentials} size="sm" type="button" variant="outline">
                        <KeyRound className="mr-1.5 h-4 w-4" />
                        Rotate credentials
                      </Button>
                      {selectedAccount.account_status === "active" && (
                        <Button disabled={busy} onClick={() => setAccountStatus("suspended")} size="sm" type="button" variant="outline">
                          <Pause className="mr-1.5 h-4 w-4" />
                          Suspend
                        </Button>
                      )}
                      {selectedAccount.account_status === "suspended" && (
                        <Button disabled={busy} onClick={() => setAccountStatus("active")} size="sm" type="button" variant="outline">
                          <Play className="mr-1.5 h-4 w-4" />
                          Reactivate
                        </Button>
                      )}
                    </>
                  )}
                  {canRevokeAccounts && selectedAccount.account_status !== "revoked" && (
                    <Button
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
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
                    <Button onClick={() => loadAudit(selectedAccount)} size="sm" type="button" variant="ghost">
                      <Activity className="mr-1.5 h-4 w-4" />
                      Audit history
                    </Button>
                  )}
                </div>

                {canEditAccounts && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 lg:shrink-0"
                    disabled={busy || !editDirty}
                    onClick={savePermissions}
                    type="button"
                  >
                    {busy ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
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
        <DialogContent className="flex max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b border-slate-200 px-5 py-4 pr-12 text-left sm:px-6 dark:border-slate-800">
            <DialogTitle>System audit log</DialogTitle>
            <DialogDescription>Recent access-management events across all accounts.</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
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
          className="w-[calc(100%-1.5rem)] max-w-lg"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-600" />
              One-time credentials
            </DialogTitle>
            <DialogDescription>
              Copy and deliver these securely. The employee signs in with their email and this initial password.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4">
              <CredentialLine label="Login email" value={credentials.login_identifier} />
              <CredentialLine label="Initial password" value={credentials.initial_password} />
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                Share this only with the employee it was issued to.
              </div>
              <Button className="w-full" onClick={() => setCredentials(null)} type="button">
                I have saved these credentials
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}