// 📁 Place this file at: components/portal-demo-admin/RoleEditorPanel.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader, Pencil, Plus, X } from "lucide-react";
import type { SidebarMenuItem } from "@/lib/portalDemoApi";
import { SidebarIconPreview } from "./sidebarIcons";
import { SidebarItemEditorPanel } from "./SidebarItemEditorPanel";
import type { RoleLike, RolePayload } from "./types";

type Props = {
  initial: RoleLike | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (payload: RolePayload) => void;
  onError: (message: string) => void;
};

export function RoleEditorPanel({
  initial,
  saving,
  onCancel,
  onSave,
  onError,
}: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<"active" | "inactive">(
    initial?.status || "active",
  );
  const [sidebarMenu, setSidebarMenu] = useState<SidebarMenuItem[]>(
    initial?.sidebar_menu || [],
  );

  const [itemEditorOpen, setItemEditorOpen] = useState(false);
  const [itemEditIndex, setItemEditIndex] = useState<number | null>(null);

  const removeSidebarItem = (index: number) =>
    setSidebarMenu((items) => items.filter((_, i) => i !== index));

  const moveSidebarItem = (index: number, direction: -1 | 1) => {
    setSidebarMenu((items) => {
      const copy = [...items];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return items;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const handleSaveRole = () => {
    if (!name.trim()) {
      onError("Role name is required.");
      return;
    }
    onSave({ name, description, status, sidebar_menu: sidebarMenu });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {initial ? "Edit Role" : "Add Role"}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to roles
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HR"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What this role can see and do..."
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-3">
          <Label>Sidebar Buttons</Label>
          <p className="text-xs text-muted-foreground">
            Each button can just be a label, or you can wire it to a real demo
            page — a data Table (with columns + sample rows) or a Dashboard
            (stat cards).
          </p>

          {!itemEditorOpen ? (
            <>
              {sidebarMenu.length > 0 ? (
                <div className="space-y-1">
                  {sidebarMenu.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 border rounded-md px-2 py-2"
                    >
                      <div className="flex flex-col text-[10px] leading-none">
                        <button
                          type="button"
                          onClick={() => moveSidebarItem(i, -1)}
                          disabled={i === 0}
                          className="disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSidebarItem(i, 1)}
                          disabled={i === sidebarMenu.length - 1}
                          className="disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                      <SidebarIconPreview
                        name={item.icon}
                        className="h-4 w-4 text-slate-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm">{item.name}</span>{" "}
                        {item.page_config?.page_type === "table" ? (
                          <Badge
                            variant="secondary"
                            className="align-middle text-[10px]"
                          >
                            Table · {item.page_config.fields.length} cols ·{" "}
                            {item.page_config.sample_rows.length} rows
                          </Badge>
                        ) : item.page_config?.page_type === "dashboard" ? (
                          <Badge
                            variant="secondary"
                            className="align-middle text-[10px]"
                          >
                            Dashboard · {item.page_config.stat_cards.length}{" "}
                            stats
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="align-middle text-[10px] text-muted-foreground"
                          >
                            Not configured
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemEditIndex(i);
                          setItemEditorOpen(true);
                        }}
                        title="Configure this button's page"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeSidebarItem(i)}
                        className="p-1"
                        title="Remove button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground border border-dashed rounded-md p-4 text-center">
                  No sidebar buttons yet.
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setItemEditIndex(null);
                  setItemEditorOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Button
              </Button>
            </>
          ) : (
            <SidebarItemEditorPanel
              initial={
                itemEditIndex !== null ? sidebarMenu[itemEditIndex] : null
              }
              onCancel={() => setItemEditorOpen(false)}
              onError={onError}
              onSave={(item) => {
                setSidebarMenu((items) => {
                  const copy = [...items];
                  if (itemEditIndex !== null) {
                    copy[itemEditIndex] = item;
                  } else {
                    copy.push(item);
                  }
                  return copy;
                });
                setItemEditorOpen(false);
              }}
            />
          )}
        </div>

        <div className="w-full md:w-56 shrink-0">
          <Label className="text-xs">Sidebar Preview</Label>
          <div className="rounded-xl overflow-hidden border mt-1">
            <div className="bg-slate-900 text-white p-3 space-y-1 min-h-[200px]">
              {sidebarMenu.length === 0 ? (
                <p className="text-xs text-slate-500">No buttons yet</p>
              ) : (
                sidebarMenu.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-slate-800"
                  >
                    <SidebarIconPreview name={item.icon} className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveRole}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {saving ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initial ? (
            "Save Role"
          ) : (
            "Add Role"
          )}
        </Button>
      </div>
    </div>
  );
}
