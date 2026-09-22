// 📁 Place this file at: app/admin/portal-demo/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LayoutGrid, Plus } from "lucide-react";
import {
  DEFAULT_PORTAL_THEME,
  PortalDemoRecord,
  PortalDemoPayload,
  PortalDemoRoleRecord,
  fetchPortalDemos,
  createPortalDemo,
  updatePortalDemo,
  deletePortalDemo,
  togglePortalDemoStatus,
  uploadPortalDemoImage,
  fetchPortalDemoRoles,
  createPortalDemoRole,
  updatePortalDemoRole,
  deletePortalDemoRole,
  reorderPortalDemoRoles,
} from "@/lib/portalDemoApi";

import {
  emptyForm,
  makeLocalId,
  type FormState,
} from "@/components/portal-demo-admin/formState";
import { DemoListTable } from "@/components/portal-demo-admin/DemoListTable";
import { ViewDemoDialog } from "@/components/portal-demo-admin/ViewDemoDialog";
import { DemoFormWizard } from "@/components/portal-demo-admin/DemoFormWizard";
import { ConfirmDialog } from "@/components/portal-demo-admin/ConfirmDialog";
import type {
  LocalRole,
  RolePayload,
  RolesController,
} from "@/components/portal-demo-admin/types";

const ITEMS_PER_PAGE = 10;

export default function PortalDemoAdminPage() {
  const router = useRouter();
  const [demos, setDemos] = useState<PortalDemoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const flashMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const [viewDemo, setViewDemo] = useState<PortalDemoRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [unlockedStep, setUnlockedStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<PortalDemoRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Remote roles (only relevant once the demo already has an id)
  const [remoteRoles, setRemoteRoles] = useState<PortalDemoRoleRecord[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [reorderingRoles, setReorderingRoles] = useState(false);

  const isNewDemo = form.id === null;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadDemos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentPage]);

  const loadDemos = async () => {
    setLoading(true);
    try {
      const res = await fetchPortalDemos({
        search: searchQuery || undefined,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      });
      setDemos(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (error) {
      console.error("Error fetching portal demos:", error);
      flashMessage(
        `Failed to load portal demos: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setDemos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadDemos();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Only fetch server-backed roles for a demo that already exists.
  useEffect(() => {
    if (formOpen && step === 4 && form.id) {
      loadRemoteRoles(form.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, step, form.id]);

  const loadRemoteRoles = async (demoId: number) => {
    setRolesLoading(true);
    try {
      const data = await fetchPortalDemoRoles(demoId);
      setRemoteRoles(data);
    } catch (error) {
      flashMessage(
        error instanceof Error ? error.message : "Failed to load roles.",
      );
    } finally {
      setRolesLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Form open/close
  // -----------------------------------------------------------------------
  const openCreateForm = () => {
    setForm(emptyForm);
    setRemoteRoles([]);
    setStep(1);
    setUnlockedStep(1);
    setFormOpen(true);
  };

  const openEditForm = (demo: PortalDemoRecord, initialStep: number = 1) => {
    setForm({
      id: demo.id,
      name: demo.name,
      description: demo.description,
      category: demo.category || "",
      best_suited_for: demo.best_suited_for || "",
      core_operating_areas: demo.core_operating_areas || [],
      example_workflow: demo.example_workflow || [],
      image: demo.image,
      image_url: demo.image_url,
      status: demo.status,
      theme_configuration: {
        ...DEFAULT_PORTAL_THEME,
        ...demo.theme_configuration,
      },
      localRoles: [],
    });
    setStep(initialStep);
    setUnlockedStep(4);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setRemoteRoles([]);
    setStep(1);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageProgress(0);
    try {
      const result = await uploadPortalDemoImage(file, setImageProgress);
      setForm((f) => ({ ...f, image: result.path, image_url: result.url }));
    } catch (error) {
      flashMessage(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = () =>
    setForm((f) => ({ ...f, image: null, image_url: null }));

  // -----------------------------------------------------------------------
  // Persisting the base demo record (name/description/theme/etc — NOT roles)
  // -----------------------------------------------------------------------
  const persistBase = async (): Promise<PortalDemoRecord | null> => {
    if (!form.name.trim() || !form.description.trim()) {
      flashMessage("Portal name and description are required.");
      return null;
    }
    setSaving(true);
    try {
      const payload: PortalDemoPayload = {
        name: form.name,
        description: form.description,
        category: form.category || null,
        best_suited_for: form.best_suited_for || null,
        core_operating_areas: form.core_operating_areas,
        example_workflow: form.example_workflow,
        image: form.image,
        status: form.status,
        theme_configuration: form.theme_configuration,
      };

      let record: PortalDemoRecord;
      if (form.id) {
        record = await updatePortalDemo(form.id, payload);
      } else {
        record = await createPortalDemo(payload);
        setForm((f) => ({ ...f, id: record.id }));
      }
      loadDemos();
      return record;
    } catch (error) {
      flashMessage(
        error instanceof Error ? error.message : "Failed to save portal demo.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Step 3 → Step 4. For an EXISTING demo this saves the edited fields.
  // For a NEW demo nothing is persisted yet — we just move on, so the
  // demo record is only ever created together with its roles at the end.
  const handleContinueToRoles = async (): Promise<boolean> => {
    if (!form.id) {
      setUnlockedStep((u) => Math.max(u, 4));
      return true;
    }
    const record = await persistBase();
    if (!record) return false;
    setUnlockedStep((u) => Math.max(u, 4));
    flashMessage("Changes saved.");
    return true;
  };

  const handleSaveAndClose = async () => {
    const record = await persistBase();
    if (!record) return;
    flashMessage("Portal demo updated successfully!");
    closeForm();
  };

  // Step 4 finish, NEW demo: create the demo record AND every staged role
  // in one go. This is the fix — nothing exists in the database until the
  // whole wizard, roles included, is complete.
  const handleFinishCreate = async () => {
    if (form.localRoles.length === 0) {
      flashMessage("Add at least one role before creating the demo.");
      return;
    }
    setSaving(true);
    try {
      const record = await persistBase(); // creates the demo, sets form.id
      if (!record) return;
      for (const role of form.localRoles) {
        await createPortalDemoRole(record.id, {
          name: role.name,
          description: role.description || null,
          status: role.status,
          sidebar_menu: role.sidebar_menu,
        });
      }
      flashMessage("Portal demo created successfully!");
      closeForm();
      loadDemos();
    } catch (error) {
      flashMessage(
        error instanceof Error
          ? error.message
          : "Failed to create roles for this demo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFinishEdit = () => {
    closeForm();
    loadDemos();
  };

  // -----------------------------------------------------------------------
  // Demo list actions
  // -----------------------------------------------------------------------
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePortalDemo(deleteTarget.id);
      flashMessage("Portal demo deleted successfully!");
      setDeleteTarget(null);
      loadDemos();
    } catch (error) {
      flashMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete portal demo.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (demo: PortalDemoRecord) => {
    setTogglingId(demo.id);
    const nextStatus = demo.status === "active" ? "inactive" : "active";
    try {
      await togglePortalDemoStatus(demo.id, nextStatus);
      flashMessage(
        `${demo.name} is now ${nextStatus === "active" ? "active" : "disabled"}.`,
      );
      loadDemos();
    } catch (error) {
      flashMessage(
        error instanceof Error ? error.message : "Failed to update status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // -----------------------------------------------------------------------
  // Roles controller — local (staged) for a new demo, API-backed for an
  // existing one. StepRoles/RoleEditorPanel don't need to know which.
  // -----------------------------------------------------------------------
  const localRolesController: RolesController = {
    roles: form.localRoles.map((r) => ({
      id: r.localId,
      name: r.name,
      description: r.description,
      status: r.status,
      sidebar_menu: r.sidebar_menu,
    })),
    loading: false,
    reordering: false,
    add: (payload: RolePayload) => {
      const newRole: LocalRole = { localId: makeLocalId(), ...payload };
      setForm((f) => ({ ...f, localRoles: [...f.localRoles, newRole] }));
    },
    update: (id, payload: RolePayload) => {
      setForm((f) => ({
        ...f,
        localRoles: f.localRoles.map((r) =>
          r.localId === id ? { ...r, ...payload } : r,
        ),
      }));
    },
    remove: (id) => {
      setForm((f) => ({
        ...f,
        localRoles: f.localRoles.filter((r) => r.localId !== id),
      }));
    },
    reorder: (orderedIds) => {
      setForm((f) => {
        const byId = new Map(f.localRoles.map((r) => [r.localId, r]));
        const reordered = orderedIds
          .map((id) => byId.get(id as string))
          .filter(Boolean) as LocalRole[];
        return { ...f, localRoles: reordered };
      });
    },
  };

  const remoteRolesController: RolesController = {
    roles: remoteRoles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      sidebar_menu: r.sidebar_menu || [],
    })),
    loading: rolesLoading,
    reordering: reorderingRoles,
    add: async (payload: RolePayload) => {
      if (!form.id) return;
      try {
        await createPortalDemoRole(form.id, {
          name: payload.name,
          description: payload.description || null,
          status: payload.status,
          sidebar_menu: payload.sidebar_menu,
        });
        flashMessage("Role added successfully!");
        loadRemoteRoles(form.id);
      } catch (error) {
        flashMessage(
          error instanceof Error ? error.message : "Failed to save role.",
        );
      }
    },
    update: async (id, payload: RolePayload) => {
      if (!form.id) return;
      try {
        await updatePortalDemoRole(form.id, id as number, {
          name: payload.name,
          description: payload.description || null,
          status: payload.status,
          sidebar_menu: payload.sidebar_menu,
        });
        flashMessage("Role updated successfully!");
        loadRemoteRoles(form.id);
      } catch (error) {
        flashMessage(
          error instanceof Error ? error.message : "Failed to save role.",
        );
      }
    },
    remove: async (id) => {
      if (!form.id) return;
      try {
        await deletePortalDemoRole(form.id, id as number);
        flashMessage("Role deleted successfully!");
        loadRemoteRoles(form.id);
      } catch (error) {
        flashMessage(
          error instanceof Error ? error.message : "Failed to delete role.",
        );
      }
    },
    reorder: async (orderedIds) => {
      if (!form.id) return;
      const previous = remoteRoles;
      const byId = new Map(remoteRoles.map((r) => [r.id, r]));
      setRemoteRoles(
        orderedIds
          .map((id) => byId.get(id as number))
          .filter(Boolean) as PortalDemoRoleRecord[],
      );
      setReorderingRoles(true);
      try {
        await reorderPortalDemoRoles(form.id, orderedIds as number[]);
      } catch (error) {
        flashMessage("Failed to reorder roles.");
        setRemoteRoles(previous);
      } finally {
        setReorderingRoles(false);
      }
    },
  };

  if (loading && demos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <LayoutGrid className="h-8 w-8 text-cyan-600" />
          </div>
          <p className="text-muted-foreground">Loading portal demos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Portal Demos
              </h1>
              <p className="text-muted-foreground">
                Manage the interactive software demos shown to visitors
              </p>
            </div>
          </div>
          <Button
            onClick={openCreateForm}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Demo
          </Button>
        </div>

        {message && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <DemoListTable
          demos={demos}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          togglingId={togglingId}
          onSearchChange={setSearchQuery}
          onPageChange={setCurrentPage}
          onView={(demo) => {
            setViewDemo(demo);
            setViewOpen(true);
          }}
          onEditBasic={(demo) => openEditForm(demo, 1)}
          onEditRoles={(demo) => openEditForm(demo, 4)}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteTarget}
        />

        <ViewDemoDialog
          demo={viewDemo}
          open={viewOpen}
          onOpenChange={setViewOpen}
        />

        <DemoFormWizard
          open={formOpen}
          form={form}
          setForm={setForm}
          step={step}
          setStep={setStep}
          unlockedStep={unlockedStep}
          saving={saving}
          imageUploading={imageUploading}
          imageProgress={imageProgress}
          onImageSelect={handleImageSelect}
          onRemoveImage={removeImage}
          rolesController={
            isNewDemo ? localRolesController : remoteRolesController
          }
          isNewDemo={isNewDemo}
          onError={flashMessage}
          onClose={closeForm}
          onContinueToRoles={handleContinueToRoles}
          onSaveAndClose={handleSaveAndClose}
          onFinishCreate={handleFinishCreate}
          onFinishEdit={handleFinishEdit}
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          title="Delete this portal demo?"
          description={
            deleteTarget && (
              <>
                You're about to permanently delete{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  "{deleteTarget.name}"
                </span>
                , including its roles and theme configuration. This cannot be
                undone.
              </>
            )
          }
          confirmLabel="Delete Demo"
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
