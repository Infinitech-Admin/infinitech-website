// 📁 Place this file at: components/portal-demo-admin/StepCardContent.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { FormState } from "./formState";

type Props = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
};

export function StepCardContent({ form, setForm }: Props) {
  const [areaInput, setAreaInput] = useState("");
  const [workflowInput, setWorkflowInput] = useState("");

  const addArea = () => {
    const value = areaInput.trim();
    if (!value) return;
    setForm((f) => ({
      ...f,
      core_operating_areas: [...f.core_operating_areas, value],
    }));
    setAreaInput("");
  };
  const removeArea = (index: number) =>
    setForm((f) => ({
      ...f,
      core_operating_areas: f.core_operating_areas.filter(
        (_, i) => i !== index,
      ),
    }));

  const addWorkflowStep = () => {
    const value = workflowInput.trim();
    if (!value) return;
    setForm((f) => ({
      ...f,
      example_workflow: [...f.example_workflow, value],
    }));
    setWorkflowInput("");
  };
  const removeWorkflowStep = (index: number) =>
    setForm((f) => ({
      ...f,
      example_workflow: f.example_workflow.filter((_, i) => i !== index),
    }));
  const moveWorkflowStep = (index: number, direction: -1 | 1) => {
    setForm((f) => {
      const steps = [...f.example_workflow];
      const target = index + direction;
      if (target < 0 || target >= steps.length) return f;
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...f, example_workflow: steps };
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Card Information
      </h3>

      <div className="space-y-2">
        <Label>Core Operating Areas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.core_operating_areas.map((area, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {area}
              <button type="button" onClick={() => removeArea(i)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArea();
              }
            }}
            placeholder="e.g. Customers"
          />
          <Button type="button" variant="outline" onClick={addArea}>
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Example Workflow</Label>
        {form.example_workflow.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2 text-sm">
            {form.example_workflow.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <Badge variant="outline" className="gap-1">
                  {step}
                  <button
                    type="button"
                    onClick={() => moveWorkflowStep(i, -1)}
                    className="ml-1 text-xs disabled:opacity-30"
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWorkflowStep(i, 1)}
                    className="text-xs disabled:opacity-30"
                    disabled={i === form.example_workflow.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => removeWorkflowStep(i)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
                {i < form.example_workflow.length - 1 && <span>→</span>}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={workflowInput}
            onChange={(e) => setWorkflowInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addWorkflowStep();
              }
            }}
            placeholder="e.g. Inquiry"
          />
          <Button type="button" variant="outline" onClick={addWorkflowStep}>
            Add Step
          </Button>
        </div>
      </div>
    </div>
  );
}
