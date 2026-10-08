"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    endOfMonth,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns";
import {
    CalendarDays,
    CalendarRange,
    Check,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    List,
    Loader2,
    Paperclip,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
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

type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
type LeaveRecord = {
    id: number;
    employee_id: number;
    employee_number: string;
    employee_name: string;
    department: string;
    position: string;
    leave_type: string;
    other_leave_type: string | null;
    start_date: string;
    end_date: string;
    number_of_days: number;
    reason: string;
    approved_by: number | null;
    approver_name: string | null;
    status: LeaveStatus;
    has_proof: boolean;
    created_at: string;
    updated_at: string;
};
type EmployeeOption = {
    id: number;
    employee_id: string;
    name: string;
    position: string;
    department: string;
};
type ApproverOption = {
    id: number;
    name: string;
    department: string;
    position: string;
};
type LeaveForm = {
    employee_id: string;
    employee_number: string;
    leave_type: string;
    other_leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    approved_by: string;
    proof: File | null;
};

const STATUSES: LeaveStatus[] = [
    "Pending",
    "Approved",
    "Rejected",
    "Cancelled",
];
const EMPTY_FORM: LeaveForm = {
    employee_id: "",
    employee_number: "",
    leave_type: "",
    other_leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    approved_by: "",
    proof: null,
};
const STATUS_STYLES: Record<LeaveStatus, string> = {
    Approved:
        "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-400/30",
    Pending:
        "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-400/30",
    Rejected:
        "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-400/30",
    Cancelled:
        "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/30",
};
const STATUS_DOT: Record<LeaveStatus, string> = {
    Approved: "bg-emerald-500",
    Pending: "bg-amber-500",
    Rejected: "bg-rose-500",
    Cancelled: "bg-slate-400",
};
const BAR_STYLES: Record<string, string> = {
    Approved:
        "bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-50 dark:hover:bg-emerald-900",
    Pending:
        "border border-dashed border-amber-500 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-50 dark:hover:bg-amber-900/60",
};
const MAX_LANES = 3;
type Segment = {
    leave: LeaveRecord;
    startCol: number;
    endCol: number;
    lane: number;
    clipStart: boolean;
    clipEnd: boolean;
};
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PAGE_SIZE = 10;

const selectClass =
    "h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 disabled:opacity-60 dark:bg-slate-950";
const textareaClass =
    "w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:bg-slate-950";
const primaryButton = "bg-cyan-700 text-white hover:bg-cyan-800";

// Layout that must not depend on generated Tailwind utilities, so the
// calendar keeps its shape even if the stylesheet is stale.
const GRID_7: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
};
const PRIMARY_STYLE: React.CSSProperties = {
    backgroundColor: "#0e7490",
    color: "#ffffff",
};
const TAB_STYLE: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
};

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, [query]);
    return matches;
}

function layoutWeek(
    weekDays: Date[],
    records: LeaveRecord[],
    maxLanes = MAX_LANES,
) {
    const first = dateValue(weekDays[0]);
    const last = dateValue(weekDays[6]);
    const laneEnds: number[] = [];
    const segments: Segment[] = records
        .filter((l) => l.start_date <= last && l.end_date >= first)
        .sort(
            (a, b) =>
                a.start_date.localeCompare(b.start_date) ||
                b.end_date.localeCompare(a.end_date) ||
                a.employee_name.localeCompare(b.employee_name),
        )
        .map((leave) => {
            const clipStart = leave.start_date < first;
            const clipEnd = leave.end_date > last;
            const startCol = differenceInCalendarDays(
                parseDay(clipStart ? first : leave.start_date),
                weekDays[0],
            );
            const endCol = differenceInCalendarDays(
                parseDay(clipEnd ? last : leave.end_date),
                weekDays[0],
            );
            let lane = laneEnds.findIndex((end) => end < startCol);
            if (lane === -1) lane = laneEnds.length;
            laneEnds[lane] = endCol;
            return { leave, startCol, endCol, lane, clipStart, clipEnd };
        });
    const overflow = weekDays.map(
        (_, col) =>
            segments.filter(
                (s) => s.lane >= maxLanes && s.startCol <= col && s.endCol >= col,
            ).length,
    );
    const rows =
        Math.min(laneEnds.length, maxLanes) + (overflow.some((n) => n > 0) ? 1 : 0);
    return { segments, overflow, rows };
}

async function readJson<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
        const errors = data.errors
            ? Object.values(data.errors as Record<string, string[]>)
                .flat()
                .join(" ")
            : "";
        throw new Error(
            errors || data.message || "The request could not be completed.",
        );
    }
    return data as T;
}

function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    const token =
        typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
}

function dateValue(date: Date) {
    return format(date, "yyyy-MM-dd");
}

function parseDay(value: string) {
    return new Date(`${value}T00:00:00`);
}

function formatRange(start: string, end: string) {
    const s = parseDay(start);
    const e = parseDay(end);
    if (start === end) return format(s, "MMM d, yyyy");
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
        return `${format(s, "MMM d")}–${format(e, "d, yyyy")}`;
    if (s.getFullYear() === e.getFullYear())
        return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
    return `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;
}

function leaveTypeLabel(leave: Pick<LeaveRecord, "leave_type" | "other_leave_type">) {
    return leave.other_leave_type
        ? `${leave.leave_type} — ${leave.other_leave_type}`
        : leave.leave_type;
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function pluralDays(count: number) {
    return `${count} ${count === 1 ? "day" : "days"}`;
}

function StatusBadge({ status }: { status: LeaveStatus }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {status}
        </span>
    );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
    return (
        <span
            aria-hidden
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-cyan-100 font-semibold text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-100 ${size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"}`}
        >
            {initials(name)}
        </span>
    );
}

function Field({
    label,
    hint,
    required,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
            <span>
                {label}
                {required && <span className="ml-0.5 text-rose-600" aria-hidden> *</span>}
            </span>
            {children}
            {hint && (
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                    {hint}
                </span>
            )}
        </label>
    );
}

function Stat({
    value,
    label,
    highlight,
}: {
    value: number;
    label: string;
    highlight?: boolean;
}) {
    return (
        <div className="px-4 py-2 first:pl-0 sm:px-6">
            <p
                className={`text-2xl font-semibold tabular-nums ${highlight && value > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}
            >
                {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

function LeaveRow({
    leave,
    onOpen,
}: {
    leave: LeaveRecord;
    onOpen: (leave: LeaveRecord) => void;
}) {
    return (
        <button
            onClick={() => onOpen(leave)}
            className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:hover:bg-slate-800/60"
        >
            <Avatar name={leave.employee_name} size="sm" />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {leave.employee_name}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {leaveTypeLabel(leave)}, {formatRange(leave.start_date, leave.end_date)}
                </span>
            </span>
            <StatusBadge status={leave.status} />
        </button>
    );
}

export default function LeaveRequestsPage() {
    const [records, setRecords] = useState<LeaveRecord[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [approvers, setApprovers] = useState<ApproverOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<"calendar" | "week" | "list">("calendar");
    const [month, setMonth] = useState(startOfMonth(new Date()));
    const [search, setSearch] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [employeeFilter, setEmployeeFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [fromFilter, setFromFilter] = useState("");
    const [toFilter, setToFilter] = useState("");
    const [page, setPage] = useState(1);
    const [sortAscending, setSortAscending] = useState(true);
    const [sortBy, setSortBy] = useState<"date" | "type">("date");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<LeaveRecord | null>(null);
    const [form, setForm] = useState<LeaveForm>(EMPTY_FORM);
    const [employeeQuery, setEmployeeQuery] = useState("");
    const [selectedEmployee, setSelectedEmployee] =
        useState<EmployeeOption | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(
        null,
    );
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [newLeaveType, setNewLeaveType] = useState("");
    const [savingType, setSavingType] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 640px)");
    const [detailApprover, setDetailApprover] = useState("");
    const [savingApprover, setSavingApprover] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [leaveResponse, typesResponse, employeesResponse] =
                await Promise.all([
                    adminFetch("/api/admin/leave-requests", { cache: "no-store" }),
                    adminFetch("/api/admin/leave-requests?resource=types", {
                        cache: "no-store",
                    }),
                    adminFetch("/api/admin/leave-requests?resource=employees", {
                        cache: "no-store",
                    }),
                ]);
            const [leaveData, typeData, employeeData] = await Promise.all([
                readJson<{ data: LeaveRecord[] }>(leaveResponse),
                readJson<{ data: string[] }>(typesResponse),
                readJson<{ data: EmployeeOption[] }>(employeesResponse),
            ]);
            setRecords(leaveData.data);
            setLeaveTypes(typeData.data);
            setEmployees(employeeData.data);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to load leave monitoring.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        setPage(1);
    }, [
        search,
        employeeFilter,
        departmentFilter,
        typeFilter,
        statusFilter,
        fromFilter,
        toFilter,
    ]);

    useEffect(() => {
        const query = employeeQuery.trim();
        if (!query || selectedEmployee?.employee_id === query) return;
        const timer = window.setTimeout(async () => {
            try {
                const response = await adminFetch(
                    `/api/admin/leave-requests?resource=employees&search=${encodeURIComponent(query)}`,
                    { cache: "no-store" },
                );
                const data = await readJson<{ data: EmployeeOption[] }>(response);
                setEmployees(data.data);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Unable to search employees.",
                );
            }
        }, 250);
        return () => window.clearTimeout(timer);
    }, [employeeQuery, selectedEmployee]);

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();
        return records
            .filter((leave) => {
                const matchesSearch =
                    !query ||
                    [
                        leave.employee_number,
                        leave.employee_name,
                        leave.department,
                        leave.position,
                        leave.leave_type,
                        leave.other_leave_type || "",
                        leave.reason,
                    ].some((value) => value.toLowerCase().includes(query));
                const matchesDate =
                    (!fromFilter || leave.end_date >= fromFilter) &&
                    (!toFilter || leave.start_date <= toFilter);
                return (
                    matchesSearch &&
                    (!employeeFilter ||
                        leave.employee_number
                            .toLowerCase()
                            .includes(employeeFilter.toLowerCase())) &&
                    (departmentFilter === "All" ||
                        leave.department === departmentFilter) &&
                    (typeFilter === "All" || leave.leave_type === typeFilter) &&
                    (statusFilter === "All" || leave.status === statusFilter) &&
                    matchesDate
                );
            })
            .sort(
                (a, b) =>
                    a.start_date.localeCompare(b.start_date) ||
                    a.employee_name.localeCompare(b.employee_name),
            );
    }, [
        records,
        search,
        employeeFilter,
        departmentFilter,
        typeFilter,
        statusFilter,
        fromFilter,
        toFilter,
    ]);

    const listRecords = useMemo(
        () =>
            [...filteredRecords].sort((a, b) => {
                const compared =
                    sortBy === "type"
                        ? a.leave_type.localeCompare(b.leave_type) ||
                        (a.other_leave_type || "").localeCompare(
                            b.other_leave_type || "",
                        ) ||
                        a.start_date.localeCompare(b.start_date) ||
                        a.employee_name.localeCompare(b.employee_name)
                        : a.start_date.localeCompare(b.start_date) ||
                        a.employee_name.localeCompare(b.employee_name);
                return sortAscending ? compared : -compared;
            }),
        [filteredRecords, sortAscending, sortBy],
    );

    const calendarRecords = useMemo(
        () =>
            filteredRecords.filter(
                (leave) => leave.status === "Pending" || leave.status === "Approved",
            ),
        [filteredRecords],
    );
    const departments = useMemo(
        () => Array.from(new Set(records.map((leave) => leave.department))).sort(),
        [records],
    );
    const pendingQueue = useMemo(
        () => filteredRecords.filter((leave) => leave.status === "Pending"),
        [filteredRecords],
    );

    const today = new Date();
    const todayValue = dateValue(today);
    const weekAheadValue = dateValue(addDays(today, 7));
    const stats = useMemo(
        () => ({
            onLeave: records.filter(
                (l) =>
                    l.status === "Approved" &&
                    l.start_date <= todayValue &&
                    l.end_date >= todayValue,
            ).length,
            pending: records.filter((l) => l.status === "Pending").length,
            upcoming: records.filter(
                (l) =>
                    l.status === "Approved" &&
                    l.start_date > todayValue &&
                    l.start_date <= weekAheadValue,
            ).length,
        }),
        [records, todayValue, weekAheadValue],
    );

    const activeFilterCount = [
        employeeFilter,
        departmentFilter !== "All",
        typeFilter !== "All",
        statusFilter !== "All",
        fromFilter,
        toFilter,
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearch("");
        setEmployeeFilter("");
        setDepartmentFilter("All");
        setTypeFilter("All");
        setStatusFilter("All");
        setFromFilter("");
        setToFilter("");
    };

    const pages = Math.max(1, Math.ceil(listRecords.length / PAGE_SIZE));
    const visibleRecords = listRecords.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
    );

    const weeks = useMemo(() => {
        const rangeStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
        const rangeEnd = addDays(
            startOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
            6,
        );
        const days: Date[] = [];
        for (let d = rangeStart; d <= rangeEnd; d = addDays(d, 1)) days.push(d);
        const result: ({ days: Date[] } & ReturnType<typeof layoutWeek>)[] = [];
        for (let i = 0; i < days.length; i += 7) {
            const weekDays = days.slice(i, i + 7);
            result.push({ days: weekDays, ...layoutWeek(weekDays, calendarRecords) });
        }
        return result;
    }, [month, calendarRecords]);

    // Week view
    const weekDays = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [selectedDate]);
    const weekLayout = useMemo(
        () => layoutWeek(weekDays, calendarRecords, Infinity),
        [weekDays, calendarRecords],
    );

    const goToday = () => {
        setMonth(startOfMonth(today));
        setSelectedDate(today);
    };
    const goPrev = () => {
        if (view === "week") {
            const d = addDays(selectedDate, -7);
            setSelectedDate(d);
            setMonth(startOfMonth(d));
        } else setMonth((v) => subMonths(v, 1));
    };
    const goNext = () => {
        if (view === "week") {
            const d = addDays(selectedDate, 7);
            setSelectedDate(d);
            setMonth(startOfMonth(d));
        } else setMonth((v) => addMonths(v, 1));
    };

    const getRecordsForDay = (day: Date) =>
        calendarRecords.filter((leave) => {
            const start = parseDay(leave.start_date);
            const end = parseDay(leave.end_date);
            return day >= start && day <= end;
        });

    const selectedDayRecords = getRecordsForDay(selectedDate);

    const loadApprovers = useCallback(async (employeeId: string) => {
        if (!employeeId) {
            setApprovers([]);
            return;
        }
        try {
            const response = await adminFetch(
                `/api/admin/leave-requests?resource=approvers&employee_id=${employeeId}`,
                { cache: "no-store" },
            );
            const data = await readJson<{ data: ApproverOption[] }>(response);
            setApprovers(data.data);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to load eligible approvers.",
            );
        }
    }, []);

    useEffect(() => {
        if (!selectedRecord) {
            setApprovers([]);
            return;
        }
        setDetailApprover(
            selectedRecord.approved_by ? String(selectedRecord.approved_by) : "",
        );
        void loadApprovers(String(selectedRecord.employee_id));
    }, [selectedRecord, loadApprovers]);

    useEffect(() => {
        if (!employeeQuery) return;
        const employee = employees.find(
            (option) => option.employee_id === employeeQuery,
        );
        if (!employee || selectedEmployee?.id === employee.id) return;
        setSelectedEmployee(employee);
        setForm((previous) => ({
            ...previous,
            employee_id: String(employee.id),
            employee_number: employee.employee_id,
            approved_by: "",
        }));
        setApprovers([]);
        void loadApprovers(String(employee.id));
    }, [employeeQuery, employees, selectedEmployee, loadApprovers]);

    const selectEmployee = (employeeNumber: string) => {
        const employee = employees.find(
            (option) => option.employee_id === employeeNumber,
        );
        setEmployeeQuery(employeeNumber);
        setSelectedEmployee(employee || null);
        setForm((previous) => ({
            ...previous,
            employee_id: employee ? String(employee.id) : "",
            employee_number: employee?.employee_id || employeeNumber,
        }));
    };

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setSelectedEmployee(null);
        setEmployeeQuery("");
        setApprovers([]);
        setFormOpen(true);
    };

    const openEdit = async (leave: LeaveRecord) => {
        setEditing(leave);
        setForm({
            employee_id: String(leave.employee_id),
            employee_number: leave.employee_number,
            leave_type: leave.leave_type,
            other_leave_type: leave.other_leave_type || "",
            start_date: leave.start_date,
            end_date: leave.end_date,
            reason: leave.reason,
            approved_by: leave.approved_by ? String(leave.approved_by) : "",
            proof: null,
        });
        setEmployeeQuery(leave.employee_number);
        let employee = employees.find((option) => option.id === leave.employee_id);
        if (!employee) {
            try {
                const response = await adminFetch(
                    `/api/admin/leave-requests?resource=employees&search=${encodeURIComponent(leave.employee_number)}`,
                );
                const data = await readJson<{ data: EmployeeOption[] }>(response);
                employee = data.data.find((option) => option.id === leave.employee_id);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Unable to load the employee.",
                );
            }
        }
        setSelectedEmployee(employee || null);
        await loadApprovers(String(leave.employee_id));
        setFormOpen(true);
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedEmployee || !form.employee_id) {
            toast.error("Select an employee from the masterfile.");
            return;
        }
        if (
            !form.leave_type ||
            (form.leave_type === "Other" && !form.other_leave_type.trim()) ||
            !form.start_date ||
            !form.end_date ||
            !form.reason.trim()
        ) {
            toast.error("Complete all required leave fields.");
            return;
        }
        if (form.start_date > form.end_date) {
            toast.error("End date cannot be before start date.");
            return;
        }
        const body = new FormData();
        body.set("employee_id", form.employee_id);
        body.set("leave_type", form.leave_type);
        body.set(
            "other_leave_type",
            form.leave_type === "Other" ? form.other_leave_type.trim() : "",
        );
        body.set("start_date", form.start_date);
        body.set("end_date", form.end_date);
        body.set("reason", form.reason.trim());
        body.set("approved_by", form.approved_by);
        if (form.proof) body.set("proof", form.proof);
        setSaving(true);
        try {
            const response = await adminFetch(
                editing
                    ? `/api/admin/leave-requests/${editing.id}`
                    : "/api/admin/leave-requests",
                { method: editing ? "PUT" : "POST", body },
            );
            await readJson(response);
            toast.success(
                editing ? "Leave request updated." : "Leave request created.",
            );
            setFormOpen(false);
            setSelectedRecord(null);
            await loadData();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to save leave request.",
            );
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (leave: LeaveRecord, status: LeaveStatus) => {
        try {
            const response = await adminFetch(
                `/api/admin/leave-requests/${leave.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        status === "Approved" && detailApprover
                            ? { status, approved_by: Number(detailApprover) }
                            : { status },
                    ),
                },
            );
            await readJson(response);
            toast.success(`Leave marked ${status.toLowerCase()}.`);
            setSelectedRecord(null);
            await loadData();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update leave status.",
            );
        }
    };

    const saveApprover = async (leave: LeaveRecord) => {
        setSavingApprover(true);
        try {
            await readJson(
                await adminFetch(`/api/admin/leave-requests/${leave.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        approved_by: detailApprover ? Number(detailApprover) : null,
                    }),
                }),
            );
            toast.success("Approver updated.");
            setSelectedRecord(null);
            await loadData();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to update approver.",
            );
        } finally {
            setSavingApprover(false);
        }
    };

    const deleteRecord = async (leave: LeaveRecord) => {
        if (
            !window.confirm(
                `Delete the leave record for ${leave.employee_name}? This cannot be undone.`,
            )
        )
            return;
        try {
            await readJson(
                await adminFetch(`/api/admin/leave-requests/${leave.id}`, {
                    method: "DELETE",
                }),
            );
            toast.success("Leave record deleted.");
            setSelectedRecord(null);
            await loadData();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to delete leave record.",
            );
        }
    };

    const dayCount =
        form.start_date && form.end_date && form.start_date <= form.end_date
            ? differenceInCalendarDays(
                parseDay(form.end_date),
                parseDay(form.start_date),
            ) + 1
            : 0;

    const downloadProof = async (leave: LeaveRecord) => {
        try {
            const response = await adminFetch(
                `/api/admin/leave-requests/${leave.id}/attachment`,
            );
            if (!response.ok)
                throw new Error("Unable to download the proof attachment.");
            const blobUrl = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = blobUrl;
            const disposition = response.headers.get("content-disposition") || "";
            const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1];
            link.download =
                filename || `leave-proof-${leave.employee_number}-${leave.id}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to download attachment.",
            );
        }
    };

    const viewProof = async (leave: LeaveRecord) => {
        // Open the tab synchronously so popup blockers allow it,
        // then point it at the file once it has loaded.
        const tab = window.open("", "_blank");
        try {
            const response = await adminFetch(
                `/api/admin/leave-requests/${leave.id}/attachment`,
            );
            if (!response.ok) throw new Error("Unable to load the proof attachment.");

            const disposition = response.headers.get("content-disposition") || "";
            const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || "";
            const ext = filename.split(".").pop()?.toLowerCase();
            const fallbackType =
                ext === "pdf"
                    ? "application/pdf"
                    : ext === "png"
                        ? "image/png"
                        : ext === "jpg" || ext === "jpeg"
                            ? "image/jpeg"
                            : "";

            // If the server sent a generic type, fall back to the file extension
            // so the browser previews the file instead of downloading it.
            const raw = await response.blob();
            const blob =
                raw.type && raw.type !== "application/octet-stream"
                    ? raw
                    : new Blob([raw], { type: fallbackType || raw.type });

            const blobUrl = URL.createObjectURL(blob);
            if (tab) tab.location.href = blobUrl;
            else window.open(blobUrl, "_blank");
            window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        } catch (error) {
            tab?.close();
            toast.error(
                error instanceof Error ? error.message : "Unable to view attachment.",
            );
        }
    };

    const addLeaveType = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = newLeaveType.trim();
        if (!name) return;
        setSavingType(true);
        try {
            await readJson(
                await adminFetch("/api/admin/leave-types", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                }),
            );
            setLeaveTypes((current) =>
                [...current, name].sort((a, b) => a.localeCompare(b)),
            );
            setForm((current) => ({ ...current, leave_type: name }));
            setNewLeaveType("");
            setTypeDialogOpen(false);
            toast.success("Leave type added.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Unable to add leave type.",
            );
        } finally {
            setSavingType(false);
        }
    };

    const selectDay = (day: Date) => {
        setSelectedDate(day);
        if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
    };

    const viewPendingList = () => {
        setStatusFilter("Pending");
        setView("list");
    };

    return (
        <section className="mx-auto max-w-[1600px] space-y-6 p-1 sm:p-2">
            {/* Header */}
            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            Leave monitoring
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            See who is away, and review requests that need a decision.
                        </p>
                    </div>
                    <div className="flex divide-x divide-slate-200 dark:divide-slate-800">
                        <Stat value={stats.onLeave} label="Away today" />
                        <Stat value={stats.pending} label="Awaiting approval" highlight />
                        <Stat value={stats.upcoming} label="Starting in 7 days" />
                    </div>
                </div>
                <Button
                    onClick={openCreate}
                    className={`${primaryButton} self-start lg:self-auto`}
                    style={PRIMARY_STYLE}
                >
                    <Plus className="h-4 w-4" /> Add leave
                </Button>
            </header>

            {/* Toolbar */}
            <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div
                        role="tablist"
                        aria-label="Leave view"
                        className="inline-flex shrink-0 self-start rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
                        style={{ display: "inline-flex", gap: 4 }}
                    >
                        {(
                            [
                                ["calendar", "Month", CalendarDays],
                                ["week", "Week", CalendarRange],
                                ["list", "List", List],
                            ] as const
                        ).map(([key, label, Icon]) => (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={view === key}
                                onClick={() => setView(key)}
                                style={TAB_STYLE}
                                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${view === key ? "bg-white text-cyan-800 shadow-sm dark:bg-slate-700 dark:text-cyan-200" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
                            >
                                <Icon className="h-4 w-4" /> {label}
                            </button>
                        ))}
                    </div>
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name, ID, department, type or reason"
                            aria-label="Search leave records"
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="leave-filters"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 rounded-full bg-cyan-700 px-1.5 text-xs font-semibold text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                        {(activeFilterCount > 0 || search) && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {filtersOpen && (
                    <div
                        id="leave-filters"
                        className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                        <Field label="Employee ID">
                            <Input
                                value={employeeFilter}
                                onChange={(event) => setEmployeeFilter(event.target.value)}
                                placeholder="e.g. 2024-0012"
                            />
                        </Field>
                        <Field label="Department">
                            <select
                                value={departmentFilter}
                                onChange={(event) => setDepartmentFilter(event.target.value)}
                                className={selectClass}
                            >
                                <option value="All">All departments</option>
                                {departments.map((department) => (
                                    <option key={department}>{department}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Leave type">
                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                className={selectClass}
                            >
                                <option value="All">All leave types</option>
                                {leaveTypes.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Status">
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className={selectClass}
                            >
                                <option value="All">All statuses</option>
                                {STATUSES.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="From">
                            <Input
                                type="date"
                                value={fromFilter}
                                onChange={(event) => setFromFilter(event.target.value)}
                            />
                        </Field>
                        <Field label="To">
                            <Input
                                type="date"
                                value={toFilter}
                                min={fromFilter || undefined}
                                onChange={(event) => setToFilter(event.target.value)}
                            />
                        </Field>
                    </div>
                )}
            </div>

            <div
                className={`grid items-start gap-6 ${view === "list" ? "" : "xl:grid-cols-[minmax(0,1fr)_340px]"}`}
            >
                {view === "week" ? (
                    /* ───────── WEEK PANEL ───────── */
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {format(weekDays[0], "MMM d")} –{" "}
                                {format(weekDays[6], "MMM d, yyyy")}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="sm" onClick={goToday}>
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Previous week"
                                    onClick={goPrev}
                                >
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Next week"
                                    onClick={goNext}
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <div style={{ minWidth: 640 }}>
                                {/* Day headers */}
                                <div
                                    style={GRID_7}
                                    className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40"
                                >
                                    {weekDays.map((day) => {
                                        const isToday = isSameDay(day, today);
                                        const isSelected = isSameDay(day, selectedDate);
                                        return (
                                            <button
                                                key={dateValue(day)}
                                                onClick={() => setSelectedDate(day)}
                                                aria-pressed={isSelected}
                                                style={{ minWidth: 0 }}
                                                className={`py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${isSelected ? "bg-cyan-50/70 dark:bg-cyan-950/30" : ""}`}
                                            >
                                                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {format(day, "EEE")}
                                                </span>
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: 28,
                                                        height: 28,
                                                        margin: "2px auto 0",
                                                    }}
                                                    className={`rounded-full text-sm tabular-nums ${isToday ? "bg-cyan-700 font-semibold text-white" : "text-slate-800 dark:text-slate-100"}`}
                                                >
                                                    {format(day, "d")}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Body: column backgrounds + spanning bars */}
                                <div style={{ position: "relative" }}>
                                    <div
                                        style={{
                                            ...GRID_7,
                                            minHeight: Math.max(200, 16 + weekLayout.rows * 26 + 16),
                                        }}
                                    >
                                        {weekDays.map((day) => (
                                            <div
                                                key={dateValue(day)}
                                                style={{ minWidth: 0 }}
                                                className={`border-r border-slate-100 last:border-r-0 dark:border-slate-800 ${isSameDay(day, selectedDate) ? "bg-cyan-50/70 dark:bg-cyan-950/30" : ""}`}
                                            />
                                        ))}
                                    </div>

                                    <div
                                        style={{
                                            ...GRID_7,
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: 8,
                                            gridAutoRows: "22px",
                                            rowGap: 4,
                                            alignContent: "start",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {weekLayout.segments.map((seg) => (
                                            <button
                                                key={`${seg.leave.id}-${seg.startCol}`}
                                                onClick={() => setSelectedRecord(seg.leave)}
                                                title={`${seg.leave.employee_number}, ${seg.leave.employee_name}, ${leaveTypeLabel(seg.leave)} (${seg.leave.status})`}
                                                style={{
                                                    gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                                                    gridRow: seg.lane + 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    minWidth: 0,
                                                    pointerEvents: "auto",
                                                    marginLeft: seg.clipStart ? 0 : 4,
                                                    marginRight: seg.clipEnd ? 0 : 4,
                                                }}
                                                className={`px-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${BAR_STYLES[seg.leave.status]} ${seg.clipStart ? "rounded-l-none" : "rounded-l"} ${seg.clipEnd ? "rounded-r-none" : "rounded-r"} ${!seg.clipStart && seg.leave.status === "Approved" ? "border-l-[3px] border-emerald-600" : ""}`}
                                            >
                                                <span
                                                    className="font-medium"
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {seg.leave.employee_name}
                                                </span>
                                                <span
                                                    className="opacity-70"
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {leaveTypeLabel(seg.leave)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-6 text-sm text-slate-500 dark:border-slate-800">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading leave
                                records
                            </div>
                        )}
                        {!loading && weekLayout.segments.length === 0 && (
                            <p className="border-t border-slate-100 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                                No approved or pending leave this week.
                            </p>
                        )}
                    </div>
                ) : view === "calendar" ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {format(month, "MMMM yyyy")}
                                </h2>
                                <div className="hidden items-center gap-3 text-xs text-slate-500 sm:flex dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Approved
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        Pending
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="sm" onClick={goToday}>
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Previous month"
                                    onClick={() => setMonth((value) => subMonths(value, 1))}
                                >
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Next month"
                                    onClick={() => setMonth((value) => addMonths(value, 1))}
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="min-w-[640px]">
                                <div
                                    style={GRID_7}
                                    className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40"
                                >
                                    {WEEKDAYS.map((day) => (
                                        <div
                                            key={day}
                                            className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {weeks.map(
                                        ({ days, segments, overflow, rows }, weekIndex) => (
                                            <div
                                                key={weekIndex}
                                                className="relative"
                                                style={{ minHeight: Math.max(128, 48 + rows * 26 + 8) }}
                                            >
                                                <div
                                                    style={{
                                                        ...GRID_7,
                                                        minHeight: Math.max(128, 48 + rows * 26 + 8),
                                                    }}
                                                >
                                                    {days.map((day) => {
                                                        const inMonth = isSameMonth(day, month);
                                                        const isToday = isSameDay(day, today);
                                                        const isSelected = isSameDay(day, selectedDate);
                                                        return (
                                                            <div
                                                                key={dateValue(day)}
                                                                className={`border-r border-slate-100 p-1.5 last:border-r-0 sm:p-2 dark:border-slate-800 ${!inMonth ? "bg-slate-50/70 dark:bg-slate-950/40" : ""} ${isSelected ? "bg-cyan-50/60 dark:bg-cyan-950/20" : ""}`}
                                                            >
                                                                <button
                                                                    onClick={() => setSelectedDate(day)}
                                                                    aria-label={`View leaves for ${format(day, "MMMM d, yyyy")}`}
                                                                    aria-pressed={isSelected}
                                                                    className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${isToday ? "bg-cyan-700 font-semibold text-white" : inMonth ? "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800" : "text-slate-400 dark:text-slate-600"} ${isSelected && !isToday ? "ring-2 ring-cyan-600" : ""}`}
                                                                >
                                                                    {format(day, "d")}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div
                                                    style={{
                                                        ...GRID_7,
                                                        position: "absolute",
                                                        top: 40,
                                                        left: 0,
                                                        right: 0,
                                                        gridAutoRows: "22px",
                                                        rowGap: 4,
                                                        alignContent: "start",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {segments
                                                        .filter((segment) => segment.lane < MAX_LANES)
                                                        .map((segment) => (
                                                            <button
                                                                key={`${segment.leave.id}-${segment.startCol}`}
                                                                onClick={() => setSelectedRecord(segment.leave)}
                                                                aria-label={`${segment.leave.employee_number}, ${segment.leave.employee_name}, ${leaveTypeLabel(segment.leave)}, ${segment.leave.status}`}
                                                                title={`${segment.leave.employee_number}, ${segment.leave.employee_name}, ${leaveTypeLabel(segment.leave)} (${segment.leave.status})`}
                                                                style={{
                                                                    gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`,
                                                                    gridRow: segment.lane + 1,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 6,
                                                                    minWidth: 0,
                                                                    pointerEvents: "auto",
                                                                    marginLeft: segment.clipStart ? 0 : 4,
                                                                    marginRight: segment.clipEnd ? 0 : 4,
                                                                }}
                                                                className={`px-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${BAR_STYLES[segment.leave.status]} ${segment.clipStart ? "rounded-l-none" : "rounded-l"} ${segment.clipEnd ? "rounded-r-none" : "rounded-r"} ${!segment.clipStart && segment.leave.status === "Approved" ? "border-l-[3px] border-emerald-600" : ""}`}
                                                            >
                                                                {!segment.clipStart && (
                                                                    <>
                                                                        <span className="truncate font-medium">
                                                                            {segment.leave.employee_name}
                                                                        </span>
                                                                        <span className="truncate opacity-70">
                                                                            {leaveTypeLabel(segment.leave)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        ))}
                                                    {overflow.map((count, dayIndex) =>
                                                        count > 0 ? (
                                                            <button
                                                                key={`overflow-${weekIndex}-${dayIndex}`}
                                                                onClick={() => setSelectedDate(days[dayIndex])}
                                                                style={{
                                                                    gridColumn: dayIndex + 1,
                                                                    gridRow: MAX_LANES + 1,
                                                                    minWidth: 0,
                                                                    pointerEvents: "auto",
                                                                }}
                                                                className="truncate px-1 text-left text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                                                            >
                                                                +{count} more
                                                            </button>
                                                        ) : null,
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                        {loading && (
                            <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-6 text-sm text-slate-500 dark:border-slate-800">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading leave
                                records
                            </div>
                        )}
                        {!loading && calendarRecords.length === 0 && (
                            <p className="border-t border-slate-100 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                                No approved or pending leave matches these filters.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Leave records{" "}
                                <span className="font-normal text-slate-500">
                                    ({filteredRecords.length})
                                </span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <select
                                    aria-label="Sort leave records by"
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(
                                            event.target.value === "type" ? "type" : "date",
                                        )
                                    }
                                    className="h-8 rounded-md border border-input bg-white px-2 text-sm dark:bg-slate-950"
                                >
                                    <option value="date">Start date</option>
                                    <option value="type">Leave type</option>
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setSortAscending((current) => !current)
                                    }
                                >
                                    {sortBy === "date"
                                        ? `Start date: ${sortAscending ? "earliest first" : "latest first"}`
                                        : `Leave type: ${sortAscending ? "A–Z" : "Z–A"}`}
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading leave
                                records
                            </div>
                        ) : visibleRecords.length === 0 ? (
                            <div className="px-4 py-14 text-center">
                                <p className="font-medium text-slate-900 dark:text-white">
                                    No leave records match
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Try a different search or clear your filters.
                                </p>
                                {(activeFilterCount > 0 || search) && (
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden md:block">
                                    <table className="w-full table-fixed text-left text-sm">
                                        <thead className="border-b border-slate-200 bg-slate-50/70 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                                            <tr>
                                                <th className="w-[26%] px-4 py-2.5 font-medium">
                                                    Employee
                                                </th>
                                                <th className="w-[20%] px-3 py-2.5 font-medium">
                                                    Leave
                                                </th>
                                                <th className="w-[20%] px-3 py-2.5 font-medium">
                                                    Dates
                                                </th>
                                                <th className="hidden w-[14%] px-3 py-2.5 font-medium xl:table-cell">
                                                    Approver
                                                </th>
                                                <th className="w-[12%] px-3 py-2.5 font-medium">
                                                    Status
                                                </th>
                                                <th className="w-[96px] px-4 py-2.5 text-right font-medium">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {visibleRecords.map((leave) => (
                                                <tr
                                                    key={leave.id}
                                                    className="align-middle text-slate-700 hover:bg-slate-50/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar name={leave.employee_name} size="sm" />
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                                    {leave.employee_name}
                                                                </p>
                                                                <p className="truncate text-xs text-slate-500">
                                                                    {leave.employee_number}, {leave.department}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="truncate font-medium">
                                                            {leaveTypeLabel(leave)}
                                                        </p>
                                                        <p
                                                            className="truncate text-xs text-slate-500"
                                                            title={leave.reason}
                                                        >
                                                            {leave.reason}
                                                        </p>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <p className="truncate">
                                                            {formatRange(leave.start_date, leave.end_date)}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {pluralDays(leave.number_of_days)}
                                                        </p>
                                                    </td>
                                                    <td className="hidden truncate px-3 py-3 xl:table-cell">
                                                        {leave.approver_name || (
                                                            <span className="text-slate-400">
                                                                Not assigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <StatusBadge status={leave.status} />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {leave.has_proof && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Download proof for ${leave.employee_name}`}
                                                                    title="Download proof"
                                                                    onClick={() => void downloadProof(leave)}
                                                                >
                                                                    <Paperclip className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedRecord(leave)}
                                                            >
                                                                Details
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                                    {visibleRecords.map((leave) => (
                                        <li key={leave.id}>
                                            <button
                                                onClick={() => setSelectedRecord(leave)}
                                                className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                <Avatar name={leave.employee_name} />
                                                <span className="min-w-0 flex-1 space-y-0.5">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                                                            {leave.employee_name}
                                                        </span>
                                                        <StatusBadge status={leave.status} />
                                                    </span>
                                                    <span className="block text-xs text-slate-500">
                                                        {leave.employee_number}, {leave.department}
                                                    </span>
                                                    <span className="block pt-1 text-sm">
                                                        {leaveTypeLabel(leave)}
                                                    </span>
                                                    <span className="block text-xs text-slate-500">
                                                        {formatRange(leave.start_date, leave.end_date)} (
                                                        {pluralDays(leave.number_of_days)})
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                                    <span className="text-slate-500">
                                        Showing {(page - 1) * PAGE_SIZE + 1}–
                                        {Math.min(page * PAGE_SIZE, filteredRecords.length)} of{" "}
                                        {filteredRecords.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">
                                            Page {page} of {pages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage((current) => current - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= pages}
                                            onClick={() => setPage((current) => current + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {view !== "list" && (
                    <aside className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                {isSameDay(selectedDate, today)
                                    ? "Today"
                                    : format(selectedDate, "EEEE, MMM d")}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedDayRecords.length === 0
                                    ? "No approved or pending leave."
                                    : `${selectedDayRecords.length} on leave`}
                            </p>
                            {selectedDayRecords.length > 0 && (
                                <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                                    {selectedDayRecords.map((leave) => (
                                        <LeaveRow
                                            key={leave.id}
                                            leave={leave}
                                            onOpen={setSelectedRecord}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Awaiting approval
                                </h2>
                                {pendingQueue.length > 0 && (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                        {pendingQueue.length}
                                    </span>
                                )}
                            </div>
                            {pendingQueue.length === 0 ? (
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    No requests need a decision.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {pendingQueue.slice(0, 5).map((leave) => (
                                        <li key={leave.id}>
                                            <button
                                                onClick={() => setSelectedRecord(leave)}
                                                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                <Avatar name={leave.employee_name} size="sm" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {leave.employee_name}
                                                    </span>
                                                    <span className="block truncate text-xs text-slate-500">
                                                        {leaveTypeLabel(leave)},{" "}
                                                        {formatRange(leave.start_date, leave.end_date)}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {pendingQueue.length > 5 && (
                                <button
                                    onClick={viewPendingList}
                                    className="mt-3 text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                                >
                                    See all {pendingQueue.length} pending requests
                                </button>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Add / edit leave */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0">
                    <DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <DialogTitle>{editing ? "Edit leave" : "Add leave"}</DialogTitle>
                        <DialogDescription>
                            Pick an employee from the masterfile. Their details fill in
                            automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitForm} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                            <section className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Employee
                                </h3>
                                <Field label="Employee ID">
                                    <Input
                                        list="masterfile-employees"
                                        value={employeeQuery}
                                        onChange={(event) => selectEmployee(event.target.value)}
                                        placeholder="Search or select an Employee ID"
                                        required
                                    />
                                    <datalist id="masterfile-employees">
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.employee_id}>
                                                {employee.name}, {employee.department}
                                            </option>
                                        ))}
                                    </datalist>
                                </Field>
                                {selectedEmployee ? (
                                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                        <Avatar name={selectedEmployee.name} />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                {selectedEmployee.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                {selectedEmployee.position},{" "}
                                                {selectedEmployee.department}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        Choose an ID from the suggestions to load employee details.
                                    </p>
                                )}
                            </section>

                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Leave details
                                    </h3>
                                </div>
                                <Field label="Leave type">
                                    <select
                                        value={form.leave_type}
                                        onChange={(event) => {
                                            const leaveType = event.target.value;
                                            setForm({
                                                ...form,
                                                leave_type: leaveType,
                                                other_leave_type:
                                                    leaveType === "Other"
                                                        ? form.other_leave_type
                                                        : "",
                                            });
                                        }}
                                        required
                                        className={selectClass}
                                    >
                                        <option value="">Select leave type</option>
                                        {leaveTypes.map((type) => (
                                            <option key={type}>{type}</option>
                                        ))}
                                    </select>
                                </Field>
                                {form.leave_type === "Other" && (
                                    <Field label="Specify leave type">
                                        <Input
                                            value={form.other_leave_type}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    other_leave_type: event.target.value,
                                                })
                                            }
                                            placeholder="Enter the specific leave type"
                                            maxLength={150}
                                            required
                                        />
                                    </Field>
                                )}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Start date">
                                        <Input
                                            type="date"
                                            value={form.start_date}
                                            onChange={(event) =>
                                                setForm({ ...form, start_date: event.target.value })
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="End date"
                                        hint={dayCount ? pluralDays(dayCount) : undefined}
                                    >
                                        <Input
                                            type="date"
                                            min={form.start_date || undefined}
                                            value={form.end_date}
                                            onChange={(event) =>
                                                setForm({ ...form, end_date: event.target.value })
                                            }
                                            required
                                        />
                                    </Field>
                                </div>
                                <Field label="Reason">
                                    <textarea
                                        value={form.reason}
                                        onChange={(event) =>
                                            setForm({ ...form, reason: event.target.value })
                                        }
                                        required
                                        maxLength={5000}
                                        rows={3}
                                        className={textareaClass}
                                    />
                                </Field>
                                <Field
                                    label="Proof (optional)"
                                    hint={
                                        editing?.has_proof
                                            ? "An attachment is already saved. Uploading a new file replaces it."
                                            : "PDF, JPG or PNG."
                                    }
                                >
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                proof: event.target.files?.[0] || null,
                                            })
                                        }
                                    />
                                </Field>
                            </section>
                        </div>
                        <DialogFooter className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !selectedEmployee}
                                className={primaryButton}
                                style={PRIMARY_STYLE}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {editing ? "Save changes" : "Submit leave"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Leave types */}
            <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add leave type</DialogTitle>
                        <DialogDescription>
                            Existing types and records stay as they are.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addLeaveType} className="space-y-4">
                        <Field label="Leave type name">
                            <Input
                                value={newLeaveType}
                                onChange={(event) => setNewLeaveType(event.target.value)}
                                maxLength={100}
                                required
                                placeholder="e.g. Study leave"
                            />
                        </Field>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTypeDialogOpen(false)}
                            >
                                Close
                            </Button>
                            <Button
                                type="submit"
                                disabled={savingType}
                                className={primaryButton}
                                style={PRIMARY_STYLE}
                            >
                                {savingType ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                Add type
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Leave details */}
            <Dialog
                open={!!selectedRecord}
                onOpenChange={(open) => !open && setSelectedRecord(null)}
            >
                <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                    {selectedRecord && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 pr-6">
                                    <Avatar name={selectedRecord.employee_name} />
                                    <div className="min-w-0 flex-1 text-left">
                                        <DialogTitle className="truncate">
                                            {selectedRecord.employee_name}
                                        </DialogTitle>
                                        <DialogDescription className="truncate">
                                            {selectedRecord.employee_number},{" "}
                                            {selectedRecord.position}, {selectedRecord.department}
                                        </DialogDescription>
                                    </div>
                                    <StatusBadge status={selectedRecord.status} />
                                </div>
                            </DialogHeader>

                            <dl className="grid gap-x-6 gap-y-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 dark:bg-slate-800/60">
                                {[
                                    ["Leave type", leaveTypeLabel(selectedRecord)],
                                    [
                                        "Dates",
                                        `${formatRange(selectedRecord.start_date, selectedRecord.end_date)} (${pluralDays(selectedRecord.number_of_days)})`,
                                    ],
                                    [
                                        "Last updated",
                                        format(
                                            new Date(selectedRecord.updated_at),
                                            "MMM d, yyyy p",
                                        ),
                                    ],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                                            {label}
                                        </dt>
                                        <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                                <div className="sm:col-span-2">
                                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                                        Reason
                                    </dt>
                                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                                        {selectedRecord.reason}
                                    </dd>
                                </div>
                            </dl>

                            {selectedRecord.status === "Pending" || selectedRecord.status === "Approved" ? (
                                <Field
                                    label="Approved by"
                                    required={selectedRecord.status === "Pending"}
                                    hint="Only supervisors from the same department and higher management are listed."
                                >
                                    <select
                                        value={detailApprover}
                                        onChange={(event) => setDetailApprover(event.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">
                                            {selectedRecord.status === "Pending" ? "Select approver" : "Not assigned"}
                                        </option>
                                        {approvers.map((approver) => (
                                            <option key={approver.id} value={approver.id}>
                                                {approver.name}, {approver.position} ({approver.department})
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            ) : (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Approved by: </span>
                                    {selectedRecord.approver_name || "Not assigned"}
                                </p>
                            )}

                            <p className="text-xs text-slate-500">
                                Requested{" "}
                                {format(new Date(selectedRecord.created_at), "MMM d, yyyy p")}
                            </p>

                            {selectedRecord.has_proof && (
                                <div className="flex items-center gap-4 self-start">
                                    <button
                                        onClick={() => void viewProof(selectedRecord)}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                                    >
                                        <Eye className="h-4 w-4" /> View proof
                                    </button>
                                    <button
                                        onClick={() => void downloadProof(selectedRecord)}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                                    >
                                        <Download className="h-4 w-4" /> Download
                                    </button>
                                </div>
                            )}

                            <DialogFooter className="flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="justify-start text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                    onClick={() => void deleteRecord(selectedRecord)}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRecord.status === "Pending" && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => void updateStatus(selectedRecord, "Cancelled")}
                                            >
                                                <X className="h-4 w-4" /> Cancel leave
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                                onClick={() => void updateStatus(selectedRecord, "Rejected")}
                                            >
                                                Reject
                                            </Button>
                                            {/* One action: approver + approve */}
                                            <Button
                                                size="sm"
                                                className="bg-emerald-700 text-white hover:bg-emerald-800"
                                                style={{ backgroundColor: "#047857", color: "#ffffff" }}
                                                disabled={!detailApprover}
                                                title={!detailApprover ? "Select an approver first" : undefined}
                                                onClick={() => void updateStatus(selectedRecord, "Approved")}
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </Button>
                                        </>
                                    )}

                                    {selectedRecord.status === "Approved" && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => void updateStatus(selectedRecord, "Cancelled")}
                                            >
                                                <X className="h-4 w-4" /> Cancel leave
                                            </Button>
                                            <Button
                                                size="sm"
                                                style={PRIMARY_STYLE}
                                                className={primaryButton}
                                                disabled={
                                                    savingApprover ||
                                                    detailApprover ===
                                                    (selectedRecord.approved_by ? String(selectedRecord.approved_by) : "")
                                                }
                                                onClick={() => void saveApprover(selectedRecord)}
                                            >
                                                {savingApprover ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                                Update approver
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
