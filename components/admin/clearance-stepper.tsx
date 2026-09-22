// File: components/admin/clearance-stepper.tsx
"use client";

import { Check } from "lucide-react";

interface ClearanceStepperProps {
  steps: readonly { label: string }[];
  current: number;
  /** Only earlier (completed) steps are clickable — no skipping ahead. */
  onStepClick: (index: number) => void;
  disabled?: boolean;
}

export function ClearanceStepper({
  steps,
  current,
  onStepClick,
  disabled,
}: ClearanceStepperProps) {
  return (
    <div>
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.label}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              <button
                type="button"
                aria-label={step.label}
                aria-current={active ? "step" : undefined}
                disabled={disabled || !done}
                onClick={() => onStepClick(i)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40"
                    : done
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              {i < steps.length - 1 && (
                <span
                  className={`mx-2 h-0.5 flex-1 rounded ${
                    done ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        Step {current + 1} of {steps.length} ·{" "}
        <span className="font-medium text-foreground">
          {steps[current].label}
        </span>
      </p>
    </div>
  );
}
