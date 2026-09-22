// 📁 Place this file at: components/portal-demo-public/modals/RecordFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PageField } from "@/lib/portalDemoApi";

type Props = {
  open: boolean;
  mode: "add" | "edit";
  pageSingularName: string;
  fields: PageField[];
  initialValues: Record<string, string> | null;
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
};

export function RecordFormModal({
  open,
  mode,
  pageSingularName,
  fields,
  initialValues,
  onCancel,
  onSave,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
    }
  }, [open, initialValues]);

  const setField = (key: string, val: string) =>
    setValues((v) => ({ ...v, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? `Add ${pageSingularName}`
              : `Edit ${pageSingularName}`}
          </DialogTitle>
          <DialogDescription>
            This is a demo — nothing gets saved to a real database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs">{f.label}</Label>
              {f.type === "select" || f.type === "badge" ? (
                <select
                  value={values[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select {f.label.toLowerCase()}...</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={
                    f.type === "number" || f.type === "currency"
                      ? "number"
                      : f.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={values[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.label}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(values)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {mode === "add" ? `Save ${pageSingularName}` : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
