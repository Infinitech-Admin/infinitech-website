"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { PageField } from "@/lib/portalDemoApi";
import { RecordFormModal } from "../modals/RecordFormModal";
import { ConfirmDialog } from "@/components/portal-demo-admin/ConfirmDialog";
import { useDemoToast } from "../DemoToaster";

type Row = Record<string, string> & { __id: string };

let rowIdCounter = 0;
const makeRowId = () => `row-${Date.now()}-${rowIdCounter++}`;

function CellValue({ field, value }: { field: PageField; value: string }) {
  if (!value) return <span className="text-slate-300">—</span>;
  if (field.type === "badge") {
    return <Badge variant="secondary">{value}</Badge>;
  }
  return <span>{value}</span>;
}

type Props = {
  pageName: string;
  fields: PageField[];
  initialRows: Record<string, string>[];
};

export function TablePageView({ pageName, fields, initialRows }: Props) {
  const { show } = useDemoToast();
  const singular = pageName.replace(/s$/i, "") || pageName;

  const [rows, setRows] = useState<Row[]>(() =>
    initialRows.map((r) => ({ ...r, __id: makeRowId() })),
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [viewRow, setViewRow] = useState<Row | null>(null);

  const filterableFields = fields.filter(
    (f) => (f.type === "badge" || f.type === "select") && f.options?.length,
  );

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches = fields.some((f) =>
          (row[f.key] || "").toLowerCase().includes(q),
        );
        if (!matches) return false;
      }
      for (const [key, val] of Object.entries(filters)) {
        if (val && row[key] !== val) return false;
      }
      return true;
    });
  }, [rows, search, filters, fields]);

  const openAdd = () => {
    setFormMode("add");
    setEditingRow(null);
    setFormOpen(true);
  };

  const openEdit = (row: Row) => {
    setFormMode("edit");
    setEditingRow(row);
    setFormOpen(true);
  };

  const handleSave = (values: Record<string, string>) => {
    if (formMode === "add") {
      setRows((r) => [{ ...values, __id: makeRowId() }, ...r]);
      show(`${singular} added. This is a demo — nothing was actually saved.`);
    } else if (editingRow) {
      setRows((r) =>
        r.map((row) =>
          row.__id === editingRow.__id ? { ...row, ...values } : row,
        ),
      );
      show(`${singular} updated. This is a demo — nothing was actually saved.`);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setRows((r) => r.filter((row) => row.__id !== deleteTarget.__id));
    show(
      `${singular} deleted. This is a demo — nothing was actually removed.`,
      "info",
    );
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--portal-header_text, #0f172a)" }}
          >
            {pageName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {visibleRows.length} records
          </p>
        </div>
        <Button
          onClick={openAdd}
          style={{
            backgroundColor: "var(--portal-button_bg, #0891b2)",
            color: "var(--portal-button_text, #ffffff)",
          }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {singular}
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${pageName.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {filterableFields.map((f) => (
          <select
            key={f.key}
            value={filters[f.key] || ""}
            onChange={(e) =>
              setFilters((fl) => ({ ...fl, [f.key]: e.target.value }))
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All {f.label}</option>
            {f.options!.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div
        className="border-2 rounded-lg overflow-hidden"
        style={{
          borderColor: "var(--portal-border, #e5e7eb)",
          backgroundColor: "var(--portal-card_bg, #ffffff)",
        }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  backgroundColor: "var(--portal-page_bg, #f8fafc)",
                }}
              >
                {fields.map((f) => (
                  <TableHead
                    key={f.key}
                    className="font-bold whitespace-nowrap"
                    style={{ color: "var(--portal-header_text, #0f172a)" }}
                  >
                    {f.label}
                  </TableHead>
                ))}
                <TableHead
                  className="font-bold text-center"
                  style={{ color: "var(--portal-header_text, #0f172a)" }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.__id}>
                  {fields.map((f) => (
                    <TableCell key={f.key} className="whitespace-nowrap">
                      <CellValue field={f} value={row[f.key]} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewRow(row)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(row)}
                        style={{
                          borderColor: "var(--portal-danger, #fecaca)",
                          color: "var(--portal-danger, #b91c1c)",
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visibleRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={fields.length + 1}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No {pageName.toLowerCase()} match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <RecordFormModal
        open={formOpen}
        mode={formMode}
        pageSingularName={singular}
        fields={fields}
        initialValues={editingRow}
        onCancel={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete this ${singular.toLowerCase()}?`}
        description="This is a demo action — no real record will be removed."
        loading={false}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={viewRow !== null}
        title={`${singular} details`}
        confirmLabel="Close"
        description={
          viewRow && (
            <div className="space-y-1 text-left pt-2">
              {fields.map((f) => (
                <p key={f.key} className="text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {f.label}:
                  </span>{" "}
                  {viewRow[f.key] || "—"}
                </p>
              ))}
            </div>
          )
        }
        onCancel={() => setViewRow(null)}
        onConfirm={() => setViewRow(null)}
      />
    </div>
  );
}
