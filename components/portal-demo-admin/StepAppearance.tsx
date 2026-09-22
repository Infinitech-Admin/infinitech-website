// 📁 Place this file at: components/portal-demo-admin/StepAppearance.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  DEFAULT_PORTAL_THEME,
  THEME_FIELD_LABELS,
  PortalDemoTheme,
} from "@/lib/portalDemoApi";
import type { FormState } from "./formState";

type Props = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
};

export function StepAppearance({ form, setForm }: Props) {
  const setThemeColor = (key: keyof PortalDemoTheme, value: string) =>
    setForm((f) => ({
      ...f,
      theme_configuration: { ...f.theme_configuration, [key]: value },
    }));

  const resetTheme = () =>
    setForm((f) => ({ ...f, theme_configuration: DEFAULT_PORTAL_THEME }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={resetTheme}>
          Reset Theme
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        These colors apply only to this portal's demo and won't affect other
        demos.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {THEME_FIELD_LABELS.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.theme_configuration[key]}
                onChange={(e) => setThemeColor(key, e.target.value)}
                className="h-9 w-9 rounded border cursor-pointer shrink-0"
              />
              <Input
                value={form.theme_configuration[key]}
                onChange={(e) => setThemeColor(key, e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
