// 📁 Place this file at: components/portal-demo-public/RoleSelectModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, UserCircle } from "lucide-react";
import type { PortalDemoRoleRecord } from "@/lib/portalDemoApi";

type Props = {
  open: boolean;
  demoName: string;
  roles: PortalDemoRoleRecord[];
  onSelect: (role: PortalDemoRoleRecord) => void;
  onOpenChange: (open: boolean) => void;
};

export function RoleSelectModal({
  open,
  demoName,
  roles,
  onSelect,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-w-3xl (was max-w-lg) + a grid of cards below turns this into a
          wide, landscape-shaped modal instead of a narrow, tall one. */}
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Who are you exploring {demoName} as?</DialogTitle>
          <DialogDescription>
            Pick a role to see the sidebar and pages built for that perspective.
            You can switch roles anytime.
          </DialogDescription>
        </DialogHeader>

        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            This demo doesn't have any roles configured yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto p-1">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onSelect(role)}
                className="group flex flex-col items-start gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-left hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/40 transition-colors"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="h-9 w-9 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center shrink-0">
                    <UserCircle className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">
                    {role.name}
                  </p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {role.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
