"use client";
// app/admin/dashboard/page.tsx
// REPLACES your current dashboard page. Move that file's code to
// components/dashboard/AdminOverview.tsx first (see instructions).

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { dashboardPathFor } from "@/lib/role-dashboards";

// Entry point (login + sidebar "Dashboard" link): sends each user to their role's dashboard.
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("adminSessionActive")) {
      router.replace("/admin/login");
      return;
    }
    (async () => {
      try {
        const res = await adminFetch("/api/admin/session", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error();
        router.replace(dashboardPathFor(await res.json()));
      } catch {
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  return (
    <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">
      Redirecting to your dashboard…
    </div>
  );
}
