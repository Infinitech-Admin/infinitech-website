// components/portal-demo/company-portal-demo.tsx
"use client";

import React, { useState } from "react";
import { useDisclosure } from "@heroui/react";
import { Portal, PortalRole } from "./types";
import { PortalGrid } from "./portal-grid";
import { RoleSelectDialog } from "./role-select-dialog";
import { PortalDashboard } from "./portal-dashboard";

/**
 * Self-contained admin-portal showcase.
 * No login / registration: visitors browse portal samples, pick a role,
 * and get dropped straight into a read-only mock dashboard for that role.
 */
export const CompanyPortalDemo = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activePortal, setActivePortal] = useState<Portal | null>(null);
  const [activeRole, setActiveRole] = useState<PortalRole | null>(null);

  const handleOpenDemo = (portal: Portal) => {
    setActivePortal(portal);
    onOpen();
  };

  const handleSelectRole = (role: PortalRole) => {
    setActiveRole(role);
    onClose();
  };

  const handleExitDashboard = () => {
    setActiveRole(null);
    setActivePortal(null);
  };

  return activePortal && activeRole ? (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-default-50">
      <PortalDashboard
        portal={activePortal}
        role={activeRole}
        onExit={handleExitDashboard}
      />
    </div>
  ) : (
    <>
      <PortalGrid onOpenDemo={handleOpenDemo} />
      <RoleSelectDialog
        portal={activePortal}
        isOpen={isOpen}
        onClose={onClose}
        onSelectRole={handleSelectRole}
      />
    </>
  );
};

export default CompanyPortalDemo;
