// 📁 Place this file at: components/portal-demo/RoleSelectionModal.tsx
"use client";

import { X, Loader2, ArrowRight } from "lucide-react";
import {
  PublicPortalDemo,
  PublicPortalDemoRole,
} from "@/lib/publicPortalDemoApi";

interface RoleSelectionModalProps {
  demo: PublicPortalDemo | null;
  loading: boolean;
  onClose: () => void;
  onSelectRole: (demo: PublicPortalDemo, role: PublicPortalDemoRole) => void;
}

export default function RoleSelectionModal({
  demo,
  loading,
  onClose,
  onSelectRole,
}: RoleSelectionModalProps) {
  if (!demo && !loading) return null;

  const accent = demo?.theme_configuration?.primary || "#22d3ee";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400 mb-1">
              Interactive portal demo
            </p>
            {loading ? (
              <div className="h-7 w-52 bg-slate-800 rounded animate-pulse" />
            ) : (
              <h2 className="text-2xl font-bold text-white">{demo?.name}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading roles...</p>
          </div>
        ) : (
          <>
            <p className="text-slate-300 mb-2">{demo?.description}</p>
            <p className="text-sm text-slate-400 mb-1 mt-4 font-semibold">
              Choose the role you want to explore
            </p>
            <p className="text-xs text-slate-500 mb-6">
              The workspace changes based on responsibilities and access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {demo?.roles?.map((role) => (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(demo, role)}
                  className="text-left p-4 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-slate-500 transition-all group"
                  style={{ borderColor: undefined }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = accent)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                >
                  <p className="font-semibold text-white mb-1 flex items-center justify-between">
                    {role.name}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {role.description ||
                      "Open the portal with this role's workspace and permissions."}
                  </p>
                </button>
              ))}
              {demo?.roles?.length === 0 && (
                <p className="text-sm text-slate-500 col-span-full text-center py-8">
                  No roles have been configured for this demo yet.
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              All businesses, people, payments and records shown here are
              fictional demo data.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
