"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
} from "@heroui/react";
import { Bell, MessageSquare, ShieldCheck, X } from "lucide-react";
import { Portal, PortalRole, PortalTask } from "./types";
import { PortalIcon } from "./portal-icon";
import { PortalWorkspace } from "./use-portal-workspace";
import { RecordFormModal } from "./record-form-modal";
import { ConfirmDialog } from "./confirm-dialog";
import { TeamChatModal } from "./team-chat-modal";

interface DashboardOverviewProps {
  portal: Portal;
  role: PortalRole;
  workspace: PortalWorkspace;
  onNavChange: (id: string) => void;
}

const ALERTS = [
  { title: "Invoice overdue", detail: "Sample Partners · $1,200" },
  { title: "New task assigned", detail: "Review priority item" },
  { title: "Client replied", detail: "Demo Group · Client Portal Setup" },
];

const STAT_NAV_MAP: Record<string, string> = {
  "Active projects": "work",
  "Tasks due": "work",
  "Open leads": "work",
  "Calls today": "work",
  "Orders today": "work",
  "Jobs today": "work",
  "Bookings today": "work",
  Receivables: "finance",
  Revenue: "finance",
  "Pipeline value": "finance",
  "Closed this month": "finance",
  "Revenue today": "finance",
  "Revenue this month": "finance",
  "Low stock SKUs": "operations",
  "Open returns": "operations",
  "Pending estimates": "operations",
  "Unbilled jobs": "finance",
  "Renewals due": "people",
  "Checked-in": "people",
};

export const DashboardOverview = ({
  portal,
  role,
  workspace,
  onNavChange,
}: DashboardOverviewProps) => {
  const { queue, tasks, completeQueueItem, addTask, toggleTask, deleteTask } =
    workspace;

  const addTaskModal = useDisclosure();
  const deleteTaskModal = useDisclosure();
  const teamChatModal = useDisclosure();

  const [pendingDeleteTask, setPendingDeleteTask] = useState<PortalTask | null>(
    null,
  );

  const taskColumns = [
    { key: "title", label: "Title" },
    { key: "meta", label: "Details" },
  ];

  const openDeleteTask = (task: PortalTask) => {
    setPendingDeleteTask(task);
    deleteTaskModal.onOpen();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-default-50">
      {/* Topbar */}
      <header className="flex items-center justify-between border-b border-default-200 bg-content1 px-8 py-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary">
            {portal.categoryLabel}
          </p>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-default-400">{portal.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Demo system operational
          </div>
          <Chip variant="bordered" size="sm">
            {role.name}
          </Chip>
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button isIconOnly size="sm" variant="flat" aria-label="Alerts">
                <Bell className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0">
              <div className="border-b border-default-200 px-4 py-3">
                <p className="text-sm font-medium text-foreground">Alerts</p>
                <p className="text-xs text-default-400">
                  Demo notifications, nothing is sent for real.
                </p>
              </div>
              <div className="divide-y divide-default-100">
                {ALERTS.map((a) => (
                  <div key={a.title} className="px-4 py-3">
                    <p className="text-sm text-foreground">{a.title}</p>
                    <p className="text-xs text-default-400">{a.detail}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <div className="space-y-6 px-8 py-6">
        {/* Disclosure banner */}
        <div className="flex items-start gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-xs text-primary-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-medium">
              Interactive portal demonstration.
            </span>{" "}
            This workspace uses fictional sample data. It cannot send real
            email, SMS, calls, payments, or messages.
          </p>
        </div>

        {/* Hero + focus */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <Card className="overflow-hidden bg-[#0b1120] text-white">
            <CardBody className="gap-4 p-8">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {portal.categoryLabel} · {role.name}
              </p>
              <h2 className="max-w-md text-2xl font-semibold leading-snug">
                {portal.heroHeadline}
              </h2>
              <p className="max-w-md text-sm text-slate-400">
                {portal.heroBody}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-white/30 text-white"
                  onPress={() => onNavChange("work")}
                >
                  Open current work
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-white/30 text-white"
                  onPress={() => onNavChange("operations")}
                >
                  View operations
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-white/30 text-white"
                  onPress={() => onNavChange("reports")}
                >
                  Review reports
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="gap-4 p-5">
              <p className="text-sm font-medium text-foreground">
                Today&apos;s focus
              </p>
              <div className="space-y-3">
                {portal.focusItems.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => onNavChange("work")}
                    className="flex w-full items-center justify-between rounded-lg text-left transition-colors hover:bg-default-100"
                  >
                    <div>
                      <p className="text-xs font-medium text-default-400">{`0${i + 1}`}</p>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-default-400">{item.helper}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portal.stats.map((stat) => (
            <Card
              key={stat.label}
              isPressable
              onPress={() => onNavChange(STAT_NAV_MAP[stat.label] ?? "work")}
              className="text-left"
            >
              <CardBody className="gap-1 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-default-400">{stat.helper}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Cross-department snapshot */}
        <Card>
          <CardBody className="gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                More across your business
              </p>
              <p className="text-xs text-default-400">
                A quick pulse on the other areas this workspace touches.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1 sm:grid-cols-3 lg:grid-cols-5">
              {portal.departmentSnapshots.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavChange("resources")}
                  className="flex flex-col gap-2 rounded-lg border border-default-200 p-4 text-left transition-colors hover:border-primary hover:bg-primary-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-default-100">
                    <PortalIcon
                      icon={item.icon}
                      className="h-4 w-4 text-default-600"
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <div>
                    <p className="text-xs text-default-600">{item.label}</p>
                    <p className="text-[11px] text-default-400">
                      {item.helper}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Workflow at a glance */}
        <Card>
          <CardBody className="gap-3 p-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Workflow at a glance
              </p>
              <p className="text-xs text-default-400">
                Typical progression for this portal family.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {portal.exampleWorkflow.map((step, i) => (
                <React.Fragment key={step}>
                  <Chip
                    size="sm"
                    variant={
                      i === 0 || i === portal.exampleWorkflow.length - 1
                        ? "solid"
                        : "bordered"
                    }
                    color={
                      i === 0 || i === portal.exampleWorkflow.length - 1
                        ? "primary"
                        : "default"
                    }
                  >
                    {step}
                  </Chip>
                  {i < portal.exampleWorkflow.length - 1 && (
                    <span className="text-default-300">›</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Priority queue + tasks */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardBody className="gap-3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Priority work queue
                  </p>
                  <p className="text-xs text-default-400">
                    Records that matter to the active role right now.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onNavChange("work")}
                >
                  View all
                </Button>
              </div>
              <Table removeWrapper aria-label="Priority work queue">
                <TableHeader>
                  <TableColumn>RECORD</TableColumn>
                  <TableColumn>SUBJECT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>PROGRESS</TableColumn>
                  <TableColumn>ACTION</TableColumn>
                </TableHeader>
                <TableBody>
                  {queue.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium text-foreground">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-default-500">
                        {row.subject}
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color={row.statusTone}>
                          {row.status}
                        </Chip>
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={row.progress}
                            size="sm"
                            className="w-16"
                            aria-label="progress"
                          />
                          <span className="text-xs text-default-400">
                            {row.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="flat"
                          isDisabled={row.status === "Completed"}
                          onPress={() => completeQueueItem(row.name)}
                        >
                          {row.status === "Completed" ? "Done" : "Complete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="gap-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">My tasks</p>
                <Button size="sm" color="primary" onPress={addTaskModal.onOpen}>
                  Add task
                </Button>
              </div>
              <p className="text-xs text-default-400">
                Personal actions and due items.
              </p>
              <div className="space-y-3 pt-1">
                {tasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-default-200 px-3 py-4 text-center text-xs text-default-400">
                    No tasks yet. Use Add task to create one.
                  </p>
                )}
                {tasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between rounded-lg border border-default-200 px-3 py-2.5"
                  >
                    <div>
                      <p
                        className={`text-sm ${task.done ? "text-default-400 line-through" : "text-foreground"}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-default-400">{task.meta}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => toggleTask(task.title)}
                      >
                        {task.done ? "Reopen" : "Complete"}
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        aria-label="Delete task"
                        onPress={() => openDeleteTask(task)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <RecordFormModal
        isOpen={addTaskModal.isOpen}
        mode="add"
        title="My tasks"
        columns={taskColumns}
        onClose={addTaskModal.onClose}
        onSubmit={(values) => {
          addTask({
            title: values.title || "Untitled task",
            meta: values.meta || "You · Today · Open",
          });
        }}
      />

      <ConfirmDialog
        isOpen={deleteTaskModal.isOpen}
        title="Delete this task?"
        description={
          pendingDeleteTask
            ? `This removes "${pendingDeleteTask.title}" from My tasks.`
            : ""
        }
        confirmLabel="Delete"
        onClose={deleteTaskModal.onClose}
        onConfirm={() => {
          if (pendingDeleteTask) deleteTask(pendingDeleteTask.title);
          setPendingDeleteTask(null);
        }}
      />

      <button
        onClick={teamChatModal.onOpen}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#0b1120] px-4 py-3 text-sm font-medium text-white shadow-lg"
        aria-label="Team chat"
      >
        <MessageSquare className="h-4 w-4" />
        Team Chat
      </button>

      <TeamChatModal
        isOpen={teamChatModal.isOpen}
        onClose={teamChatModal.onClose}
      />
    </div>
  );
};
