"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SidebarIconPreview } from "@/components/portal-demo-admin/sidebarIcons";
import type { StatCard } from "@/lib/portalDemoApi";

type Props = {
  pageName: string;
  statCards: StatCard[];
};

export function DashboardPageView({ pageName, statCards }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--portal-header_text, #0f172a)" }}
        >
          {pageName}
        </h2>
        <p className="text-sm text-muted-foreground">
          A quick snapshot — this is demo data, not live figures.
        </p>
      </div>

      {statCards.length === 0 ? (
        <p
          className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center"
          style={{ borderColor: "var(--portal-border, #e5e7eb)" }}
        >
          No stat cards configured for this page yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <Card
              key={i}
              className="border-2"
              style={{
                backgroundColor: "var(--portal-card_bg, #ffffff)",
                borderColor: "var(--portal-border, #e5e7eb)",
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                  <SidebarIconPreview name={s.icon} className="h-4 w-4" />
                  {s.label}
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--portal-primary, #0891b2)" }}
                >
                  {s.value}
                </p>
                {s.sublabel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.sublabel}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
