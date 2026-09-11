// components/portal-demo/use-portal-workspace.ts
"use client";

import { useState } from "react";
import { Portal, PortalQueueRow, PortalTask } from "./types";
import { buildSections, SectionConfig } from "./section-data";

let seq = 0;
const genId = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`;

export function usePortalWorkspace(portal: Portal) {
  const [queue, setQueue] = useState<PortalQueueRow[]>(portal.queue);
  const [tasks, setTasks] = useState<PortalTask[]>(portal.tasks);
  const [sections, setSections] = useState<Record<string, SectionConfig>>(() =>
    buildSections(portal),
  );

  const completeQueueItem = (name: string) =>
    setQueue((prev) =>
      prev.map((row) =>
        row.name === name
          ? {
              ...row,
              status: "Completed",
              statusTone: "success",
              progress: 100,
            }
          : row,
      ),
    );

  const addTask = (task: PortalTask) => setTasks((prev) => [task, ...prev]);

  const toggleTask = (title: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.title === title ? { ...t, done: !t.done } : t)),
    );

  const deleteTask = (title: string) =>
    setTasks((prev) => prev.filter((t) => t.title !== title));

  const addRecord = (sectionId: string, record: Record<string, string>) =>
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        records: [
          { id: genId(sectionId), ...record },
          ...prev[sectionId].records,
        ],
      },
    }));

  const updateRecord = (
    sectionId: string,
    id: string,
    record: Record<string, string>,
  ) =>
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        records: prev[sectionId].records.map((r) =>
          r.id === id ? { ...r, ...record } : r,
        ),
      },
    }));

  const deleteRecord = (sectionId: string, id: string) =>
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        records: prev[sectionId].records.filter((r) => r.id !== id),
      },
    }));

  return {
    queue,
    tasks,
    sections,
    completeQueueItem,
    addTask,
    toggleTask,
    deleteTask,
    addRecord,
    updateRecord,
    deleteRecord,
  };
}

export type PortalWorkspace = ReturnType<typeof usePortalWorkspace>;
