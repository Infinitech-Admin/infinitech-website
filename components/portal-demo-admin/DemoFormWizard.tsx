// 📁 Place this file at: components/portal-demo-admin/DemoFormWizard.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { STEPS, type FormState } from "./formState";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepCardContent } from "./StepCardContent";
import { StepAppearance } from "./StepAppearance";
import { StepRoles } from "./StepRoles";
import type { RolesController } from "./types";

type Props = {
  open: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  step: number;
  setStep: (n: number) => void;
  unlockedStep: number;
  saving: boolean;
  imageUploading: boolean;
  imageProgress: number;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  rolesController: RolesController;
  /** true when this demo has never been persisted (no id yet) */
  isNewDemo: boolean;
  onError: (message: string) => void;
  onClose: () => void;
  /** Steps 1→2 and 2→3: purely local, no persistence needed. */
  /** Step 3 → Step 4: for an EXISTING demo this saves the edited fields.
   *  For a NEW demo this does nothing — creation is deferred to onFinishCreate. */
  onContinueToRoles: () => Promise<boolean>;
  /** "Save & Close" while on steps 1–3, only available for an existing demo. */
  onSaveAndClose: () => Promise<void>;
  /** Step 4 finish button for a NEW demo: creates the demo AND all staged
   *  roles in one flow, then closes. */
  onFinishCreate: () => Promise<void>;
  /** Step 4 finish button for an EXISTING demo: nothing left to persist
   *  (roles already save themselves), just close. */
  onFinishEdit: () => void;
};

export function DemoFormWizard({
  open,
  form,
  setForm,
  step,
  setStep,
  unlockedStep,
  saving,
  imageUploading,
  imageProgress,
  onImageSelect,
  onRemoveImage,
  rolesController,
  isNewDemo,
  onError,
  onClose,
  onContinueToRoles,
  onSaveAndClose,
  onFinishCreate,
  onFinishEdit,
}: Props) {
  const goBack = () => setStep(Math.max(1, step - 1));

  const goNextSimple = () => {
    if (step === 1 && (!form.name.trim() || !form.description.trim())) {
      onError("Portal name and description are required.");
      return;
    }
    setStep(Math.min(3, step + 1));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {form.id ? "Edit Portal Demo" : "Create Portal Demo"}
          </DialogTitle>
          <DialogDescription>
            {form.id
              ? "Update this demo's information, content, theme, and roles."
              : "Set up the portal, then add roles and sidebar buttons. Nothing is saved until you finish the last step."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (s.id <= unlockedStep) setStep(s.id);
                }}
                disabled={s.id > unlockedStep}
                className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                  s.id > unlockedStep
                    ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
                    : "cursor-pointer text-slate-600 dark:text-slate-300"
                } ${step === s.id ? "text-cyan-700 dark:text-cyan-400" : ""}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                    step === s.id
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : s.id <= unlockedStep
                        ? "border-cyan-300 text-cyan-700 dark:text-cyan-400"
                        : "border-slate-200 text-slate-300 dark:border-slate-700"
                  }`}
                >
                  {s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6 py-2">
          {step === 1 && (
            <StepBasicInfo
              form={form}
              setForm={setForm}
              imageUploading={imageUploading}
              imageProgress={imageProgress}
              onImageSelect={onImageSelect}
              onRemoveImage={onRemoveImage}
            />
          )}
          {step === 2 && <StepCardContent form={form} setForm={setForm} />}
          {step === 3 && <StepAppearance form={form} setForm={setForm} />}
          {step === 4 && (
            <StepRoles
              hasDemoId={!!form.id}
              isNewDemo={isNewDemo}
              controller={rolesController}
              onError={onError}
            />
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={goBack} disabled={saving}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {step === 4 ? "Close" : "Cancel"}
            </Button>

            {step < 4 && form.id && (
              <Button
                variant="outline"
                onClick={onSaveAndClose}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Close"
                )}
              </Button>
            )}

            {step < 3 && (
              <Button
                onClick={goNextSimple}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={async () => {
                  const ok = await onContinueToRoles();
                  if (ok) setStep(4);
                }}
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Roles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}

            {step === 4 && isNewDemo && (
              <Button
                onClick={onFinishCreate}
                disabled={saving || rolesController.roles.length === 0}
                title={
                  rolesController.roles.length === 0
                    ? "Add at least one role before creating"
                    : undefined
                }
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Demo"
                )}
              </Button>
            )}

            {step === 4 && !isNewDemo && (
              <Button
                onClick={onFinishEdit}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
