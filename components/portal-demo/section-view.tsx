"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from "@heroui/react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { SectionConfig, SectionRecord } from "./section-data";
import { RecordFormModal } from "./record-form-modal";
import { ConfirmDialog } from "./confirm-dialog";

interface SectionViewProps {
  section: SectionConfig;
  onAdd: (record: Record<string, string>) => void;
  onUpdate: (id: string, record: Record<string, string>) => void;
  onDelete: (id: string) => void;
}

export const SectionView = ({
  section,
  onAdd,
  onUpdate,
  onDelete,
}: SectionViewProps) => {
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingRecord, setEditingRecord] = useState<SectionRecord | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<SectionRecord | null>(
    null,
  );

  const openAdd = () => {
    setFormMode("add");
    setEditingRecord(null);
    formModal.onOpen();
  };

  const openEdit = (record: SectionRecord) => {
    setFormMode("edit");
    setEditingRecord(record);
    formModal.onOpen();
  };

  const openDelete = (record: SectionRecord) => {
    setPendingDelete(record);
    deleteModal.onOpen();
  };

  const handleSubmit = (values: Record<string, string>) => {
    if (formMode === "add") {
      onAdd(values);
    } else if (editingRecord) {
      onUpdate(editingRecord.id, values);
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  const tableColumns = [
    ...section.columns,
    { key: "__actions", label: "ACTIONS" },
  ];
  const primaryLabel = pendingDelete
    ? pendingDelete[section.columns[0].key]
    : "";
  const singular = section.title.toLowerCase().replace(/s$/, "");

  return (
    <div className="space-y-5 px-8 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {section.title}
          </h2>
          <p className="text-sm text-default-500">{section.description}</p>
        </div>

        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={openAdd}
        >
          {section.addLabel}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <Table removeWrapper aria-label={section.title}>
            <TableHeader columns={tableColumns}>
              {(column) => (
                <TableColumn key={column.key}>
                  {column.label.toUpperCase()}
                </TableColumn>
              )}
            </TableHeader>

            <TableBody
              items={section.records}
              emptyContent="No records yet. Use Add to create one."
            >
              {(record) => (
                <TableRow key={record.id}>
                  {(columnKey) => {
                    if (columnKey === "__actions") {
                      return (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              aria-label="Edit record"
                              onPress={() => openEdit(record)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              aria-label="Delete record"
                              onPress={() => openDelete(record)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      );
                    }

                    const columnIndex = section.columns.findIndex(
                      (column) => column.key === columnKey,
                    );
                    const value = record[columnKey as string];

                    return (
                      <TableCell>
                        {columnIndex === section.columns.length - 1 ? (
                          <Chip size="sm" variant="flat">
                            {value}
                          </Chip>
                        ) : (
                          <span
                            className={
                              columnIndex === 0
                                ? "font-medium text-foreground"
                                : "text-default-500"
                            }
                          >
                            {value}
                          </span>
                        )}
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add / Edit Modal */}
      <RecordFormModal
        isOpen={formModal.isOpen}
        mode={formMode}
        title={section.title}
        columns={section.columns}
        initialValues={editingRecord}
        onClose={formModal.onClose}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title={`Delete this ${singular}?`}
        description={
          pendingDelete
            ? `This removes "${primaryLabel}" from ${section.title}. This can't be undone in this demo session.`
            : ""
        }
        confirmLabel="Delete"
        onClose={deleteModal.onClose}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
