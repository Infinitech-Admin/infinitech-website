"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="sm"
      classNames={{ wrapper: "z-[300]", backdrop: "z-[299]" }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              {title}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-500">{description}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  onConfirm();
                  close();
                }}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
