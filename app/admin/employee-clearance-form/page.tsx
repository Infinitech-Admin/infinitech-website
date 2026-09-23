// File: app/admin/employee-clearance-form/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { ClearanceStepper } from "@/components/admin/clearance-stepper";
import {
  type ClearanceUnitRow,
  type ClearancePropertyRow,
  type SectionCPresetKey,
  newUnitRow,
  newPropertyRow,
  patchRow,
  removeRow,
  moveRow,
  normalizeItems,
  DEFAULT_SECTION_B,
  SECTION_C_PRESETS,
  sectionCRows,
} from "@/components/admin/clearance-types";

interface TemplateResponse {
  units: { unit: string; items: string }[];
  properties: { item: string }[];
  updated_at: string | null;
}

const authHeaders = () => {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Fresh-install seed — same defaults the old per-generation wizard used, so
// the page opens with something sensible to edit instead of one blank row.
const defaultUnits = () =>
  DEFAULT_SECTION_B.map((r) => newUnitRow(r.unit, r.items));
const defaultProperties = () => sectionCRows("it");

const STEPS = [
  { label: "Departments (B)" },
  { label: "Property (C)" },
] as const;
const LAST_STEP = STEPS.length - 1;

export default function EmployeeClearanceFormPage() {
  const [step, setStep] = useState(0);
  const [units, setUnits] = useState<ClearanceUnitRow[]>(defaultUnits);
  const [properties, setProperties] =
    useState<ClearancePropertyRow[]>(defaultProperties);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  // True once a save has actually happened on the backend, so we know
  // whether what's on screen is "the saved template" or just the seeded
  // defaults waiting for a first save.
  const [isSavedOnServer, setIsSavedOnServer] = useState(false);

  useEffect(() => {
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clearance-template", {
        headers: authHeaders(),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to load the template");
      }
      const data: TemplateResponse = json.data;

      // Nothing saved yet (fresh install) — seed with the known-good
      // defaults instead of one blank row, so there's something sensible
      // to edit/save right away instead of typing everything from scratch.
      if (data.units.length || data.properties.length) {
        setUnits(
          data.units.length
            ? data.units.map((u) => newUnitRow(u.unit, u.items))
            : defaultUnits(),
        );
        setProperties(
          data.properties.length
            ? data.properties.map((p) => newPropertyRow(p.item))
            : defaultProperties(),
        );
        setIsSavedOnServer(true);
      } else {
        setUnits(defaultUnits());
        setProperties(defaultProperties());
        setIsSavedOnServer(false);
      }
      setLastSavedAt(data.updated_at);
    } catch (error: any) {
      toast.error(error.message || "Failed to load the clearance template");
    } finally {
      setLoading(false);
    }
  };

  // ── Section B handlers ──
  const addUnit = () => setUnits((prev) => [...prev, newUnitRow()]);
  const updateUnit = (id: string, patch: Partial<ClearanceUnitRow>) => {
    setUnits((prev) => patchRow(prev, id, patch));
    setErrors((prev) => ({
      ...prev,
      [`${id}.unit`]: false,
      [`${id}.items`]: false,
    }));
  };
  const deleteUnit = (id: string) =>
    setUnits((prev) => (prev.length > 1 ? removeRow(prev, id) : prev));
  const moveUnit = (index: number, dir: -1 | 1) =>
    setUnits((prev) => moveRow(prev, index, index + dir));
  const resetUnitsToDefault = () => setUnits(defaultUnits());

  // ── Section C handlers ──
  const addProperty = () =>
    setProperties((prev) => [...prev, newPropertyRow()]);
  const updateProperty = (id: string, item: string) => {
    setProperties((prev) => patchRow(prev, id, { item }));
    setErrors((prev) => ({ ...prev, [`${id}.item`]: false }));
  };
  const deleteProperty = (id: string) =>
    setProperties((prev) => (prev.length > 1 ? removeRow(prev, id) : prev));
  const moveProperty = (index: number, dir: -1 | 1) =>
    setProperties((prev) => moveRow(prev, index, index + dir));
  const loadPropertyPreset = (key: SectionCPresetKey) =>
    setProperties(sectionCRows(key));

  // Validates just the section currently on screen; used both when
  // advancing to the next step and again right before saving.
  const validateStep = (index: number): boolean => {
    if (index === 0) {
      const found: Record<string, boolean> = {};
      let hasAny = false;
      for (const row of units) {
        const unit = row.unit.trim();
        const items = normalizeItems(row.items);
        if (!unit && !items) continue;
        hasAny = true;
        if (!unit) found[`${row.id}.unit`] = true;
        if (!items) found[`${row.id}.items`] = true;
      }
      setErrors((prev) => ({ ...prev, ...found, _units: !hasAny }));
      if (Object.keys(found).length > 0 || !hasAny) {
        toast.error(
          "Each Responsible Unit needs a name and at least one item to verify.",
        );
        return false;
      }
      return true;
    }

    const hasAny = properties.some((row) => row.item.trim() !== "");
    setErrors((prev) => ({ ...prev, _properties: !hasAny }));
    if (!hasAny) {
      toast.error("Add at least one property item.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const handleSave = async () => {
    // Re-check both sections regardless of which one is on screen right now.
    if (!validateStep(0)) return setStep(0);
    if (!validateStep(1)) return setStep(1);

    const cleanUnits = units
      .map((row) => ({
        unit: row.unit.trim(),
        items: normalizeItems(row.items),
      }))
      .filter((row) => row.unit || row.items);
    const cleanProperties = properties
      .map((row) => ({ item: row.item.trim() }))
      .filter((row) => row.item);

    setSaving(true);
    try {
      const res = await fetch("/api/admin/clearance-template", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          units: cleanUnits,
          properties: cleanProperties,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to save the template");
      }
      setLastSavedAt(json.data.updated_at);
      setIsSavedOnServer(true);
      toast.success("The clearance form template has been updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save the clearance template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading clearance form template...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10" />
                Employee Clearance Form Template
              </h1>
              <p className="text-blue-100">
                Section B and Section C used every time a clearance form is
                generated for an employee. No employee info here — this is
                shared across all of them.
              </p>
            </div>
            <Link href="/admin/employee-masterfile">
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-100 text-blue-900"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-6xl mx-auto">
        {!isSavedOnServer && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            No template has been saved yet — showing the default starting list
            below. Edit as needed, then click{" "}
            <span className="font-semibold">Save Template</span> to make it the
            one used for every clearance form.
          </div>
        )}
        {isSavedOnServer && lastSavedAt && (
          <p className="text-sm text-muted-foreground">
            Last saved: {new Date(lastSavedAt).toLocaleString()}
          </p>
        )}

        <Card className="border-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b">
            <ClearanceStepper
              steps={STEPS}
              current={step}
              onStepClick={setStep}
              disabled={saving}
            />
          </CardHeader>

          {step === 0 ? (
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    B. Departmental Clearance
                  </CardTitle>
                  <CardDescription>
                    Each row is a Responsible Unit and the items it verifies.
                    Separate multiple items with a semicolon ( ; ).
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={resetUnitsToDefault}
                  disabled={saving}
                >
                  Reset to default list
                </Button>
              </div>

              {errors["_units"] && (
                <p className="text-sm text-red-600">
                  Add at least one Responsible Unit.
                </p>
              )}
              {units.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-lg border p-3 bg-white/60 dark:bg-slate-900/40"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_auto] gap-2 lg:items-start">
                    <Input
                      placeholder="Responsible Unit (e.g. Accounting)"
                      value={row.unit}
                      disabled={saving}
                      onChange={(e) =>
                        updateUnit(row.id, { unit: e.target.value })
                      }
                      className={`min-w-0 ${
                        errors[`${row.id}.unit`]
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    <Textarea
                      placeholder="Items to verify, separated by ; (e.g. Company ID; Laptop; Access cards)"
                      value={row.items}
                      disabled={saving}
                      onChange={(e) =>
                        updateUnit(row.id, { items: e.target.value })
                      }
                      className={`min-w-0 ${
                        errors[`${row.id}.items`]
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      rows={2}
                    />
                    <div className="flex w-full lg:w-auto lg:flex-col items-center justify-end lg:justify-start gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={saving || index === 0}
                        onClick={() => moveUnit(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={saving || index === units.length - 1}
                        onClick={() => moveUnit(index, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUnit(row.id)}
                        disabled={saving || units.length === 1}
                        className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addUnit}
                disabled={saving}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Responsible Unit
              </Button>
            </CardContent>
          ) : (
            <CardContent className="space-y-2 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <CardTitle className="text-base">
                    C. Detailed Property and Access Turnover
                  </CardTitle>
                  <CardDescription>
                    Item / account / property names. The other columns (date
                    returned, condition, checked by) stay blank for handwriting.
                  </CardDescription>
                </div>
                <Select
                  value=""
                  disabled={saving}
                  onValueChange={(key) =>
                    loadPropertyPreset(key as SectionCPresetKey)
                  }
                >
                  <SelectTrigger className="h-8 w-full sm:w-[190px] text-xs">
                    <SelectValue placeholder="Load preset list…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(SECTION_C_PRESETS) as SectionCPresetKey[]
                    ).map((key) => (
                      <SelectItem key={key} value={key}>
                        {SECTION_C_PRESETS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {errors["_properties"] && (
                <p className="text-sm text-red-600">
                  Add at least one property item.
                </p>
              )}
              {properties.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="e.g. Company ID / Access Card"
                    value={row.item}
                    disabled={saving}
                    onChange={(e) => updateProperty(row.id, e.target.value)}
                    className={
                      errors[`${row.id}.item`]
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving || index === 0}
                    onClick={() => moveProperty(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving || index === properties.length - 1}
                    onClick={() => moveProperty(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProperty(row.id)}
                    disabled={saving || properties.length === 1}
                    className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addProperty}
                disabled={saving}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property Item
              </Button>
            </CardContent>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t px-6 py-4">
            {step === 0 ? (
              <div className="flex-1" />
            ) : (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {step < LAST_STEP ? (
              <Button
                onClick={handleNext}
                disabled={saving}
                className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
