// components/portal-demo/portal-dashboard.tsx
"use client";

import React, { useState } from "react";
import { Portal, PortalRole } from "./types";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardOverview } from "./dashboard-overview";
import { SectionView } from "./section-view";
import { usePortalWorkspace } from "./use-portal-workspace";

interface PortalDashboardProps {
  portal: Portal;
  role: PortalRole;
  onExit: () => void;
}

export const PortalDashboard = ({
  portal,
  role,
  onExit,
}: PortalDashboardProps) => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const workspace = usePortalWorkspace(portal);
  const activeSection = workspace.sections[activeNav];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-default-50">
      <DashboardSidebar
        portal={portal}
        role={role}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onExit={onExit}
      />

      {activeNav === "dashboard" || !activeSection ? (
        <DashboardOverview
          portal={portal}
          role={role}
          workspace={workspace}
          onNavChange={setActiveNav}
        />
      ) : (
        <div className="flex-1 overflow-y-auto bg-default-50">
          <SectionView
            section={activeSection}
            onAdd={(record) => workspace.addRecord(activeNav, record)}
            onUpdate={(id, record) =>
              workspace.updateRecord(activeNav, id, record)
            }
            onDelete={(id) => workspace.deleteRecord(activeNav, id)}
          />
        </div>
      )}
    </div>
  );
};
