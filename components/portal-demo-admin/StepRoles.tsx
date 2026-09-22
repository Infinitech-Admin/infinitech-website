// 📁 Place this file at: components/portal-demo-admin/StepRoles.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Pencil, Plus, Trash2 } from "lucide-react";
import { SidebarIconPreview } from "./sidebarIcons";
import { RoleEditorPanel } from "./RoleEditorPanel";
import { ConfirmDialog } from "./ConfirmDialog";
import type { RoleLike, RolesController } from "./types";

type Props = {
  hasDemoId: boolean;
  isNewDemo: boolean;
  controller: RolesController;
  onError: (message: string) => void;
};

export function StepRoles({
  hasDemoId,
  isNewDemo,
  controller,
  onError,
}: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RoleLike | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleLike | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!hasDemoId && !isNewDemo) {
    return (
      <p className="text-sm text-muted-foreground">
        Save the basic info first to start adding roles.
      </p>
    );
  }

  if (editorOpen) {
    return (
      <RoleEditorPanel
        initial={editing}
        saving={savingRole}
        onCancel={() => setEditorOpen(false)}
        onError={onError}
        onSave={async (payload) => {
          setSavingRole(true);
          try {
            if (editing) {
              await controller.update(editing.id, payload);
            } else {
              await controller.add(payload);
            }
            setEditorOpen(false);
          } finally {
            setSavingRole(false);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Roles & Sidebar Menus
          </h3>
          <p className="text-xs text-muted-foreground">
            Each role gets its own sidebar buttons (Dashboard, Employee,
            Payroll, etc.) shown when a visitor picks that role in the demo.
            {isNewDemo && (
              <>
                {" "}
                Nothing is saved to the server yet — the demo and its roles are
                created together once you finish this step.
              </>
            )}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Role
        </Button>
      </div>

      {controller.loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader className="h-4 w-4 animate-spin" />
          Loading roles...
        </div>
      ) : controller.roles.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
          No roles yet. Add a role (e.g. "Owner / Executive", "HR") and set up
          its sidebar buttons.
        </div>
      ) : (
        <div className="space-y-2">
          {controller.roles.map((role, i) => (
            <div
              key={role.id}
              className="flex items-center justify-between gap-3 border rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col text-xs pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      controller.reorder(swapIds(controller.roles, i, i - 1))
                    }
                    disabled={i === 0 || controller.reordering}
                    className="disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      controller.reorder(swapIds(controller.roles, i, i + 1))
                    }
                    disabled={
                      i === controller.roles.length - 1 || controller.reordering
                    }
                    className="disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {role.name}
                    {role.status === "active" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {role.sidebar_menu?.length || 0} sidebar buttons
                    {role.description ? ` · ${role.description}` : ""}
                  </p>
                  {role.sidebar_menu?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.sidebar_menu.slice(0, 6).map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5"
                        >
                          <SidebarIconPreview
                            name={item.icon}
                            className="h-3 w-3"
                          />
                          {item.name}
                        </span>
                      ))}
                      {role.sidebar_menu.length > 6 && (
                        <span className="text-[11px] text-muted-foreground">
                          +{role.sidebar_menu.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(role);
                    setEditorOpen(true);
                  }}
                  title="Edit role"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(role)}
                  className="border-red-200 hover:bg-red-50 hover:text-red-700"
                  title="Delete role"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this role?"
        description={
          deleteTarget && (
            <>
              You're about to permanently remove{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                "{deleteTarget.name}"
              </span>{" "}
              and its sidebar buttons.{" "}
              {isNewDemo
                ? "This role hasn't been saved yet."
                : "This cannot be undone."}
            </>
          )
        }
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await controller.remove(deleteTarget.id);
            setDeleteTarget(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function swapIds(roles: RoleLike[], a: number, b: number) {
  if (b < 0 || b >= roles.length) return roles.map((r) => r.id);
  const ids = roles.map((r) => r.id);
  [ids[a], ids[b]] = [ids[b], ids[a]];
  return ids;
}
