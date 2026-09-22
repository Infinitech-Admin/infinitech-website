// 📁 Place this file at: components/portal-demo-admin/SidebarItemEditorPanel.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, X } from "lucide-react";
import type {
  SidebarMenuItem,
  PageField,
  PageFieldType,
  StatCard,
} from "@/lib/portalDemoApi";
import { SIDEBAR_ICON_OPTIONS, SidebarIconPreview } from "./sidebarIcons";

const PAGE_FIELD_TYPE_OPTIONS: { value: PageFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "badge", label: "Badge (status-style)" },
  { value: "select", label: "Dropdown" },
];

type ItemPageType = "none" | "table" | "dashboard";

type ItemDraft = {
  name: string;
  icon: string;
  route: string;
  page_type: ItemPageType;
  fields: PageField[];
  sample_rows: Record<string, string>[];
  stat_cards: StatCard[];
};

const slugifyKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const draftFromItem = (item: SidebarMenuItem | null): ItemDraft => {
  const cfg = item?.page_config;
  return {
    name: item?.name || "",
    icon: item?.icon || "LayoutGrid",
    route: item?.route || "",
    page_type: cfg?.page_type || "none",
    fields: cfg?.page_type === "table" ? cfg.fields : [],
    sample_rows: cfg?.page_type === "table" ? cfg.sample_rows : [],
    stat_cards: cfg?.page_type === "dashboard" ? cfg.stat_cards : [],
  };
};

type Props = {
  initial: SidebarMenuItem | null;
  onCancel: () => void;
  onSave: (item: SidebarMenuItem) => void;
  onError: (message: string) => void;
};

export function SidebarItemEditorPanel({
  initial,
  onCancel,
  onSave,
  onError,
}: Props) {
  const [itemDraft, setItemDraft] = useState<ItemDraft>(draftFromItem(initial));

  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<PageFieldType>("text");
  const [fieldOptions, setFieldOptions] = useState("");
  const [rowDraft, setRowDraft] = useState<Record<string, string>>({});
  const [statLabel, setStatLabel] = useState("");
  const [statValue, setStatValue] = useState("");
  const [statSublabel, setStatSublabel] = useState("");
  const [statIcon, setStatIcon] = useState("BarChart3");

  const addField = () => {
    const label = fieldLabel.trim();
    if (!label) return;
    const key = slugifyKey(label) || `field_${itemDraft.fields.length + 1}`;
    const options =
      fieldType === "badge" || fieldType === "select"
        ? fieldOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    setItemDraft((d) => ({
      ...d,
      fields: [...d.fields, { key, label, type: fieldType, options }],
    }));
    setFieldLabel("");
    setFieldType("text");
    setFieldOptions("");
  };

  const removeField = (index: number) => {
    setItemDraft((d) => {
      const removedKey = d.fields[index]?.key;
      return {
        ...d,
        fields: d.fields.filter((_, i) => i !== index),
        sample_rows: d.sample_rows.map((row) => {
          const copy = { ...row };
          delete copy[removedKey];
          return copy;
        }),
      };
    });
  };

  const addSampleRow = () => {
    if (itemDraft.fields.length === 0) return;
    const hasAnyValue = itemDraft.fields.some((f) => rowDraft[f.key]?.trim());
    if (!hasAnyValue) return;
    setItemDraft((d) => ({ ...d, sample_rows: [...d.sample_rows, rowDraft] }));
    setRowDraft({});
  };

  const removeSampleRow = (index: number) =>
    setItemDraft((d) => ({
      ...d,
      sample_rows: d.sample_rows.filter((_, i) => i !== index),
    }));

  const addStatCard = () => {
    if (!statLabel.trim() || !statValue.trim()) return;
    setItemDraft((d) => ({
      ...d,
      stat_cards: [
        ...d.stat_cards,
        {
          label: statLabel.trim(),
          value: statValue.trim(),
          sublabel: statSublabel.trim() || undefined,
          icon: statIcon,
        },
      ],
    }));
    setStatLabel("");
    setStatValue("");
    setStatSublabel("");
  };

  const removeStatCard = (index: number) =>
    setItemDraft((d) => ({
      ...d,
      stat_cards: d.stat_cards.filter((_, i) => i !== index),
    }));

  const handleSave = () => {
    if (!itemDraft.name.trim()) {
      onError("Button label is required.");
      return;
    }

    let page_config: SidebarMenuItem["page_config"];
    if (itemDraft.page_type === "table") {
      page_config = {
        page_type: "table",
        fields: itemDraft.fields,
        sample_rows: itemDraft.sample_rows,
      };
    } else if (itemDraft.page_type === "dashboard") {
      page_config = {
        page_type: "dashboard",
        stat_cards: itemDraft.stat_cards,
      };
    }

    onSave({
      name: itemDraft.name.trim(),
      icon: itemDraft.icon,
      route: itemDraft.route.trim() || undefined,
      page_config,
    });
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {initial ? "Edit Sidebar Button" : "New Sidebar Button"}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          value={itemDraft.name}
          onChange={(e) =>
            setItemDraft((d) => ({ ...d, name: e.target.value }))
          }
          placeholder="Button label e.g. Payroll"
        />
        <select
          value={itemDraft.icon}
          onChange={(e) =>
            setItemDraft((d) => ({ ...d, icon: e.target.value }))
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {SIDEBAR_ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Input
          value={itemDraft.route}
          onChange={(e) =>
            setItemDraft((d) => ({ ...d, route: e.target.value }))
          }
          placeholder="route (optional) e.g. payroll"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">What does this button open?</Label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "none", label: "Just a label" },
              { value: "table", label: "Data Table" },
              { value: "dashboard", label: "Dashboard" },
            ] as { value: ItemPageType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setItemDraft((d) => ({ ...d, page_type: opt.value }))
              }
              className={`text-xs px-3 py-1.5 rounded-full border-2 ${
                itemDraft.page_type === opt.value
                  ? "border-cyan-600 bg-cyan-50 text-cyan-700 dark:bg-cyan-950"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {itemDraft.page_type === "table" && (
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label className="text-xs">Columns</Label>
            {itemDraft.fields.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {itemDraft.fields.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {f.label}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      ({f.type})
                    </span>
                    <button type="button" onClick={() => removeField(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Column name e.g. Client"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addField();
                  }
                }}
              />
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as PageFieldType)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PAGE_FIELD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldType === "badge" || fieldType === "select" ? (
                <Input
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  placeholder="Options, comma separated"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addField();
                    }
                  }}
                />
              ) : (
                <Button type="button" variant="outline" onClick={addField}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Column
                </Button>
              )}
            </div>
            {(fieldType === "badge" || fieldType === "select") && (
              <Button type="button" variant="outline" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            )}
          </div>

          {itemDraft.fields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Sample Data</Label>
              {itemDraft.sample_rows.length > 0 && (
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        {itemDraft.fields.map((f) => (
                          <th
                            key={f.key}
                            className="text-left px-2 py-1.5 font-semibold whitespace-nowrap"
                          >
                            {f.label}
                          </th>
                        ))}
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {itemDraft.sample_rows.map((row, ri) => (
                        <tr key={ri} className="border-t">
                          {itemDraft.fields.map((f) => (
                            <td
                              key={f.key}
                              className="px-2 py-1.5 whitespace-nowrap"
                            >
                              {row[f.key] || "—"}
                            </td>
                          ))}
                          <td className="px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() => removeSampleRow(ri)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemDraft.fields.map((f) => (
                  <Input
                    key={f.key}
                    value={rowDraft[f.key] || ""}
                    onChange={(e) =>
                      setRowDraft((r) => ({ ...r, [f.key]: e.target.value }))
                    }
                    placeholder={f.label}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSampleRow();
                      }
                    }}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSampleRow}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      )}

      {itemDraft.page_type === "dashboard" && (
        <div className="space-y-3 border-t pt-4">
          <Label className="text-xs">Stat Cards</Label>
          {itemDraft.stat_cards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {itemDraft.stat_cards.map((s, i) => (
                <div key={i} className="border rounded-md p-2 text-xs relative">
                  <button
                    type="button"
                    onClick={() => removeStatCard(i)}
                    className="absolute top-1 right-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <SidebarIconPreview name={s.icon} className="h-3 w-3" />
                    {s.label}
                  </div>
                  <p className="font-semibold text-sm">{s.value}</p>
                  {s.sublabel && (
                    <p className="text-muted-foreground">{s.sublabel}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Input
              value={statLabel}
              onChange={(e) => setStatLabel(e.target.value)}
              placeholder="Label e.g. Active Projects"
            />
            <Input
              value={statValue}
              onChange={(e) => setStatValue(e.target.value)}
              placeholder="Value e.g. 3"
            />
            <Input
              value={statSublabel}
              onChange={(e) => setStatSublabel(e.target.value)}
              placeholder="Sublabel (optional)"
            />
            <select
              value={statIcon}
              onChange={(e) => setStatIcon(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {SIDEBAR_ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStatCard}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stat Card
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {initial ? "Save Button" : "Add Button"}
        </Button>
      </div>
    </div>
  );
}
