// 📁 Place this file at: components/portal-demo-admin/StepBasicInfo.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader, X } from "lucide-react";
import type { FormState } from "./formState";

type Props = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  imageUploading: boolean;
  imageProgress: number;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
};

export function StepBasicInfo({
  form,
  setForm,
  imageUploading,
  imageProgress,
  onImageSelect,
  onRemoveImage,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Basic Information
      </h3>

      <div className="space-y-2">
        <Label htmlFor="name">Portal Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Business Operations Hub"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder="e.g. Business Operations"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as "active" | "inactive",
              }))
            }
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="A flexible company workspace for customers, projects..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="best_suited_for">Best Suited For</Label>
        <Input
          id="best_suited_for"
          value={form.best_suited_for}
          onChange={(e) =>
            setForm((f) => ({ ...f, best_suited_for: e.target.value }))
          }
          placeholder="Professional services, project teams and internal operations"
        />
      </div>

      <div className="space-y-2">
        <Label>Portal Image</Label>
        <p className="text-xs text-muted-foreground">
          Shown on the portal card. PNG, JPG, JPEG or WEBP.
        </p>
        {form.image_url ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.image_url}
              alt="Portal"
              className="h-28 w-44 rounded-lg object-cover border"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onImageSelect}
            disabled={imageUploading}
          />
        )}
        {imageUploading && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader className="h-3 w-3 animate-spin" />
            Uploading... {imageProgress}%
          </div>
        )}
      </div>
    </div>
  );
}
