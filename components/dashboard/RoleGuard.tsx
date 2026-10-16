"use client";
// components/dashboard/RoleGuard.tsx

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  dashboardPathFor,
  resolveDashboardRole,
  type DashboardRole,
  type SessionLike,
} from "@/lib/role-dashboards";

/**
 * Loads the session and keeps each user on their own dashboard.
 * Superadmins may open any dashboard; everyone else is redirected.
 */
export default function RoleGuard({
  role,
  children,
}: {
  role: DashboardRole;
  children: (session: SessionLike) => ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<SessionLike | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("adminSessionActive")) {
      router.replace("/admin/login");
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await adminFetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Unable to load your session.");
        const data = (await res.json()) as SessionLike;
        if (!active) return;
        if (!data.is_superadmin && resolveDashboardRole(data) !== role) {
          router.replace(dashboardPathFor(data));
          return;
        }
        setSession(data);
      } catch (failure) {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : "Something went wrong.",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [role, router]);

  if (error) {
    return (
      <p
        className="m-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-96 items-center justify-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        Loading dashboard…
      </div>
    );
  }

  return <>{children(session)}</>;
}
