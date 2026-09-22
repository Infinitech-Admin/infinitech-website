// 📁 Place this file at: app/portal-demos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Loader } from "lucide-react";
import { DemoBrowseGrid } from "@/components/portal-demo-public/DemoBrowseGrid";
import { fetchPublicPortalDemos } from "@/lib/portalDemoPublicApi";
import type { PortalDemoRecord } from "@/lib/portalDemoApi";

export default function PortalDemosBrowsePage() {
  const router = useRouter();
  const [demos, setDemos] = useState<PortalDemoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicPortalDemos()
      .then(setDemos)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load demos."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    // pt-28 (vs. the old p-6) clears the site's fixed/sticky top nav, which
    // was otherwise overlapping the heading and first line of the intro
    // text. Bump this if your nav's actual height differs — it just needs
    // to be taller than the nav bar.
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 pb-6 pt-28">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Explore Our Interactive Demos
            </h1>
            <p className="text-muted-foreground">
              Pick a portal, choose a role, and click around a live simulation.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            Loading demos...
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-24">{error}</p>
        ) : (
          <DemoBrowseGrid
            demos={demos}
            onOpen={(demo) => router.push(`/portal-demos/${demo.slug}`)}
          />
        )}
      </div>
    </div>
  );
}
