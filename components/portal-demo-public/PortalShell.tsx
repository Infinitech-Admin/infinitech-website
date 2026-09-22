// 📁 Place this file at: components/portal-demo-public/PortalShell.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Repeat, UserCircle } from "lucide-react";
import { SidebarIconPreview } from "@/components/portal-demo-admin/sidebarIcons";
import { DashboardPageView } from "./pages/DashboardPageView";
import { TablePageView } from "./pages/TablePageView";
import { PlaceholderPageView } from "./pages/PlaceholderPageView";
import type {
  PortalDemoRecord,
  PortalDemoRoleRecord,
} from "@/lib/portalDemoApi";

type Props = {
  demo: PortalDemoRecord;
  role: PortalDemoRoleRecord;
  onSwitchRole: () => void;
  onExit: () => void;
};

export function PortalShell({ demo, role, onSwitchRole, onExit }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const menu = role.sidebar_menu || [];
  const activeItem = menu[activeIndex];

  const themeVars = useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(demo.theme_configuration || {}).forEach(([key, value]) => {
      vars[`--portal-${key}`] = String(value);
    });
    return vars as React.CSSProperties;
  }, [demo.theme_configuration]);

  return (
    <div style={themeVars} className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 p-4 flex flex-col gap-1"
        style={{
          backgroundColor: "var(--portal-sidebar_bg, #0f172a)",
          color: "var(--portal-sidebar_text, #ffffff)",
        }}
      >
        <div className="mb-6 px-2">
          <p
            className="text-xs uppercase tracking-wide"
            style={{ opacity: 0.5 }}
          >
            Demo Portal
          </p>
          <p className="font-semibold leading-tight">{demo.name}</p>
        </div>
        {menu.length === 0 ? (
          <p className="text-xs px-2" style={{ opacity: 0.4 }}>
            No sidebar buttons configured.
          </p>
        ) : (
          menu.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--portal-sidebar_active, rgba(255,255,255,0.15))"
                    : "transparent",
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <SidebarIconPreview name={item.icon} className="h-4 w-4" />
                {item.name}
              </button>
            );
          })
        )}

        <div
          className="mt-auto pt-4 space-y-1 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={onSwitchRole}
            className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{ opacity: 0.7 }}
          >
            <Repeat className="h-4 w-4" />
            Switch Role
          </button>
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{ opacity: 0.7 }}
          >
            <LogOut className="h-4 w-4" />
            Exit Demo
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ backgroundColor: "var(--portal-page_bg, #f8fafc)" }}
      >
        <header
          className="h-16 border-b flex items-center justify-between px-6 shrink-0"
          style={{
            backgroundColor: "var(--portal-header_bg, #ffffff)",
            color: "var(--portal-header_text, #111827)",
            borderColor: "var(--portal-border, #e5e7eb)",
          }}
        >
          <div>
            <p className="text-sm font-semibold">
              {activeItem?.name || demo.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className="gap-1 border"
              style={{
                backgroundColor: "var(--portal-header_bg, #ffffff)",
                color: "var(--portal-primary, #0891b2)",
                borderColor: "var(--portal-primary, #0891b2)",
              }}
            >
              <UserCircle className="h-3.5 w-3.5" />
              {role.name}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              style={{
                backgroundColor: "var(--portal-button_bg, transparent)",
                color: "var(--portal-button_text, inherit)",
                borderColor: "var(--portal-border, #e5e7eb)",
              }}
            >
              Exit Demo
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {!activeItem ? (
            <PlaceholderPageView name="Nothing here yet" />
          ) : activeItem.page_config?.page_type === "table" ? (
            <TablePageView
              pageName={activeItem.name}
              fields={activeItem.page_config.fields}
              initialRows={activeItem.page_config.sample_rows}
            />
          ) : activeItem.page_config?.page_type === "dashboard" ? (
            <DashboardPageView
              pageName={activeItem.name}
              statCards={activeItem.page_config.stat_cards}
            />
          ) : (
            <PlaceholderPageView name={activeItem.name} />
          )}
        </main>
      </div>
    </div>
  );
}
