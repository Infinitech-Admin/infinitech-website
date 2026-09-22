// 📁 Place this file at: components/portal-demo-admin/ViewDemoDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { THEME_FIELD_LABELS, type PortalDemoRecord } from "@/lib/portalDemoApi";

type Props = {
  demo: PortalDemoRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViewDemoDialog({ demo, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {demo && (
          <>
            <DialogHeader>
              <DialogTitle>{demo.name}</DialogTitle>
              <DialogDescription>
                {demo.category || "Uncategorized"} · {demo.role_count} role
                perspectives · Updated{" "}
                {new Date(demo.updated_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {demo.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={demo.image_url}
                  alt={demo.name}
                  className="w-full h-40 rounded-lg object-cover"
                />
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {demo.description}
              </p>
              {demo.best_suited_for && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Best suited for
                  </p>
                  <p className="text-sm">{demo.best_suited_for}</p>
                </div>
              )}
              {demo.core_operating_areas?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Core operating areas
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {demo.core_operating_areas.map((area, i) => (
                      <Badge key={i} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {demo.example_workflow?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Example workflow
                  </p>
                  <p className="text-sm">{demo.example_workflow.join(" → ")}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Theme
                </p>
                <div className="flex flex-wrap gap-2">
                  {THEME_FIELD_LABELS.slice(0, 6).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1 text-xs">
                      <span
                        className="h-4 w-4 rounded border"
                        style={{
                          backgroundColor: demo.theme_configuration[key],
                        }}
                      />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
