// components/portal-demo/role-select-dialog.tsx
"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { Portal, PortalRole } from "./types";

interface RoleSelectDialogProps {
  portal: Portal | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: PortalRole) => void;
}

export const RoleSelectDialog = ({
  portal,
  isOpen,
  onClose,
  onSelectRole,
}: RoleSelectDialogProps) => {
  if (!portal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col items-start gap-1 border-b border-default-200 pb-4">
              <p className="text-xs font-medium text-primary">
                Interactive portal demo
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {portal.title}
              </h2>
              <p className="text-sm font-normal text-default-500">
                {portal.description}
              </p>
            </ModalHeader>

            <ModalBody className="py-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Choose the role you want to explore
                </p>
                <p className="hidden text-xs text-default-400 sm:block">
                  The workspace changes based on responsibilities and access.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {portal.roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => onSelectRole(role)}
                    className="rounded-xl border border-default-200 bg-content1 p-4 text-left transition-colors hover:border-primary hover:bg-primary-50"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {role.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-default-500">
                      Open the portal with this role&apos;s workspace and
                      access.
                    </p>
                  </button>
                ))}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-default-200 pt-4">
              <div className="flex items-center gap-2 text-xs text-default-400">
                <ShieldCheck className="h-4 w-4" />
                All businesses, people, payments and records shown here are
                fictional demo data.
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
