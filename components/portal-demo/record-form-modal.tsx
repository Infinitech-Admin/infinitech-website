"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { SectionColumn, SectionRecord } from "./section-data";

interface RecordFormModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  title: string;
  columns: SectionColumn[];
  initialValues?: SectionRecord | null;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

const inputTypeFor = (column: SectionColumn) => {
  if (column.type === "email") return "email";
  if (column.type === "tel") return "tel";
  return "text";
};

const placeholderFor = (column: SectionColumn) => {
  if (column.type === "email") return "name@example.com";
  if (column.type === "tel") return "+1 (555) 010-0000";
  return undefined;
};

export const RecordFormModal = ({
  isOpen,
  mode,
  title,
  columns,
  initialValues,
  onClose,
  onSubmit,
}: RecordFormModalProps) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, string> = {};
    columns.forEach((c) => {
      next[c.key] = initialValues?.[c.key] ?? "";
    });
    setValues(next);
  }, [isOpen, initialValues, columns]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="lg"
      classNames={{ wrapper: "z-[300]", backdrop: "z-[299]" }}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col items-start gap-0.5">
              <span>{mode === "add" ? "Add" : "Edit"} record</span>
              <span className="text-sm font-normal text-default-400">
                {title}
              </span>
            </ModalHeader>
            <ModalBody className="gap-4 pb-2">
              {columns.length === 0 && (
                <p className="text-sm text-default-400">
                  No fields configured for this record type.
                </p>
              )}
              {columns.map((c) => (
                <Input
                  key={c.key}
                  type={inputTypeFor(c)}
                  label={c.label}
                  placeholder={placeholderFor(c)}
                  value={values[c.key] ?? ""}
                  onValueChange={(v) =>
                    setValues((prev) => ({ ...prev, [c.key]: v }))
                  }
                />
              ))}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onSubmit(values);
                  close();
                }}
              >
                {mode === "add" ? "Add record" : "Save changes"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
