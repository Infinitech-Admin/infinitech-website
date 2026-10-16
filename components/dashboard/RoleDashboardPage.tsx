"use client";
// components/dashboard/RoleDashboardPage.tsx

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminOverview from "@/components/dashboard/AdminOverview";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import { adminFetch } from "@/lib/admin-fetch";
import {
  dashboardPathFor,
  resolveDashboardRole,
  type DashboardRole,
  type SessionLike,
} from "@/lib/role-dashboards";

export default function RoleDashboardPage({ role }: { role: DashboardRole }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionLike | null>(null);

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
        if (!res.ok) throw new Error();
        const data: SessionLike = await res.json();
        if (!active) return;
        // Visiting another role's URL: send the user to their own dashboard.
        if (resolveDashboardRole(data) !== role) {
          router.replace(dashboardPathFor(data));
          return;
        }
        setSession(data);
      } catch {
        if (active) router.replace("/admin/login");
      }
    })();
    return () => {
      active = false;
    };
  }, [role, router]);

  if (!session) {
    return (
      <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  return role === "admin" ? (
    <AdminOverview />
  ) : (
    <RoleDashboard role={role} session={session} />
  );
}
