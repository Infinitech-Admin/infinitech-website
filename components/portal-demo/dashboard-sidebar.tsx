// components/portal-demo/dashboard-sidebar.tsx
"use client";

import React from "react";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Settings2,
  Landmark,
  UsersRound,
  FolderOpen,
  BarChart2,
  Cog,
  ArrowLeft,
} from "lucide-react";
import { Portal, PortalRole } from "./types";
import { PortalIcon } from "./portal-icon";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group: "workspace" | "collaboration" | "system";
}

export const DASHBOARD_NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "workspace",
  },
  { id: "work", label: "Current Work", icon: ListChecks, group: "workspace" },
  { id: "people", label: "Customers", icon: Users, group: "workspace" },
  {
    id: "operations",
    label: "Operations",
    icon: Settings2,
    group: "workspace",
  },
  { id: "finance", label: "Finance", icon: Landmark, group: "collaboration" },
  { id: "team", label: "Team", icon: UsersRound, group: "collaboration" },
  {
    id: "resources",
    label: "Resources",
    icon: FolderOpen,
    group: "collaboration",
  },
  { id: "reports", label: "Reports", icon: BarChart2, group: "collaboration" },
  { id: "admin", label: "Administration", icon: Cog, group: "system" },
];

interface DashboardSidebarProps {
  portal: Portal;
  role: PortalRole;
  activeNav: string;
  onNavChange: (id: string) => void;
  onExit: () => void;
}

export const DashboardSidebar = ({
  portal,
  role,
  activeNav,
  onNavChange,
  onExit,
}: DashboardSidebarProps) => {
  const visible = role.visibleNav ?? DASHBOARD_NAV.map((n) => n.id);
  const items = DASHBOARD_NAV.filter((n) => visible.includes(n.id));
  const groups: NavItem["group"][] = ["workspace", "collaboration", "system"];
  const groupLabels: Record<NavItem["group"], string> = {
    workspace: "Workspace",
    collaboration: "Collaboration",
    system: "System",
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-[#0b1120] text-slate-300">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <PortalIcon icon={portal.icon} className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Business Portal</p>
          <p className="text-xs text-slate-400">{portal.categoryLabel}</p>
        </div>
      </div>

      <button
        onClick={onExit}
        className="mx-5 mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to portal demos
      </button>

      <div className="mx-5 mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Viewing workspace as
        </p>
        <p className="text-sm font-medium text-white">{role.name}</p>
      </div>

      <nav className="mt-5 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {groups.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {groupLabels[group]}
              </p>
              <div className="space-y-1">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavChange(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Demo session active
        </div>
      </div>
    </aside>
  );
};
