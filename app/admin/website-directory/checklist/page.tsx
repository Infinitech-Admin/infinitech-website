"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ChecklistItem = {
  id: number;
  category: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
};

type ChecklistForm = Omit<ChecklistItem, "id" | "is_active"> & {
  is_active: boolean;
};

type StatusFilter = "all" | "active" | "inactive";

const CATEGORIES = [
  "General & Navigation",
  "Design & Responsiveness",
  "Content & Links",
  "Forms & Functionality",
  "Performance & Compatibility",
  "Security & Accessibility",
  "SEO & Deployment",
] as const;

const EMPTY_ITEM: ChecklistForm = {
  category: "",
  title: "",
  description: "",
  is_active: true,
  sort_order: 1,
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-600 ";
const labelClass = "block space-y-1.5 text-sm font-medium text-slate-800 ";

function nextSortOrder(checklistItems: ChecklistItem[]) {
  return (
    checklistItems.reduce(
      (highest, item) => Math.max(highest, item.sort_order),
      0,
    ) + 1
  );
}

export default function QaChecklistManagementPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [form, setForm] = useState<ChecklistForm>(EMPTY_ITEM);
  const [categorySelection, setCategorySelection] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/websites/checklist-items", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to load the QA checklist.");
      }
      setItems(result.data);
      setForm((current) =>
        current.title.trim() || current.category.trim()
          ? current
          : { ...current, sort_order: nextSortOrder(result.data) },
      );
    } catch (loadError) {
      console.error("QA checklist load failed:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the QA checklist.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function resetForm(nextItems: ChecklistItem[]) {
    setForm({ ...EMPTY_ITEM, sort_order: nextSortOrder(nextItems) });
    setCategorySelection("");
    setOtherCategory("");
    setEditingId(null);
    setEditorOpen(false);
  }

  function openNewItem() {
    setForm({ ...EMPTY_ITEM, sort_order: nextSortOrder(items) });
    setCategorySelection("");
    setOtherCategory("");
    setEditingId(null);
    setEditorOpen(true);
  }

  function editItem(item: ChecklistItem) {
    setEditingId(item.id);
    const isStandardCategory = CATEGORIES.some(
      (category) => category === item.category,
    );
    setCategorySelection(isStandardCategory ? item.category : "Other");
    setOtherCategory(isStandardCategory ? "" : item.category);
    setForm({
      category: item.category,
      title: item.title,
      description: item.description,
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setEditorOpen(true);
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category =
      categorySelection === "Other" ? otherCategory.trim() : categorySelection;
    if (!category) {
      toast.error("Select a category or enter a name for Other.");
      return;
    }

    setSaving(true);
    try {
      const response = await adminFetch(
        editingId
          ? `/api/admin/websites/checklist-items/${editingId}`
          : "/api/admin/websites/checklist-items",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, category }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        const firstError = result.errors
          ? Object.values(result.errors as Record<string, string[]>)[0]?.[0]
          : null;
        throw new Error(
          firstError || result.message || "Unable to save checklist item.",
        );
      }
      toast.success(
        editingId
          ? "Checklist item updated."
          : "Checklist item added to unfinished and new QA sessions.",
      );
      const remainingItems = items.filter((item) => item.id !== result.data.id);
      resetForm([...remainingItems, result.data]);
      setExpanded((current) => new Set(current).add(category));
      await loadItems();
    } catch (saveError) {
      console.error("QA checklist save failed:", saveError);
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save checklist item.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: ChecklistItem) {
    if (updatingItemId !== null || updatingCategory !== null) return;

    setUpdatingItemId(item.id);
    try {
      const response = await adminFetch(
        `/api/admin/websites/checklist-items/${item.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !item.is_active }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update checklist item.");
      }
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? result.data : entry)),
      );
      toast.success(
        item.is_active
          ? "Checklist item deactivated and removed from unfinished sessions."
          : "Checklist item activated for unfinished and new sessions.",
      );
    } catch (updateError) {
      console.error("QA checklist activation update failed:", updateError);
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update checklist item.",
      );
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function toggleCategoryActive(category: string) {
    if (updatingItemId !== null || updatingCategory !== null) return;

    const categoryItems = sortedItems.filter(
      (item) => item.category === category,
    );
    const shouldActivate = categoryItems.every((item) => !item.is_active);

    setUpdatingCategory(category);
    try {
      for (const item of categoryItems) {
        if (item.is_active === shouldActivate) continue;

        const response = await adminFetch(
          `/api/admin/websites/checklist-items/${item.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: shouldActivate }),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || `Unable to update ${category}.`);
        }
        setItems((current) =>
          current.map((entry) => (entry.id === item.id ? result.data : entry)),
        );
      }

      toast.success(
        shouldActivate
          ? `All ${category} items activated.`
          : `All ${category} items deactivated.`,
      );
    } catch (updateError) {
      console.error("QA checklist category update failed:", updateError);
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : `Unable to update ${category}. Some items may already have changed.`,
      );
    } finally {
      setUpdatingCategory(null);
    }
  }

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (left, right) =>
          left.sort_order - right.sort_order ||
          left.category.localeCompare(right.category) ||
          left.id - right.id,
      ),
    [items],
  );

  const searching = query.trim().length > 0;
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sortedItems.filter((item) => {
      if (statusFilter === "active" && !item.is_active) return false;
      if (statusFilter === "inactive" && item.is_active) return false;
      if (!needle) return true;
      return [item.title, item.description, item.category].some((text) =>
        text.toLowerCase().includes(needle),
      );
    });
  }, [sortedItems, query, statusFilter]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ChecklistItem[]>();
    for (const item of visibleItems) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups, ([category, categoryItems]) => ({
      category,
      items: categoryItems,
    }));
  }, [visibleItems]);

  const activeCount = items.filter((item) => item.is_active).length;
  const allExpanded =
    groupedItems.length > 0 &&
    groupedItems.every((group) => expanded.has(group.category));

  function toggleCategory(category: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function toggleAll() {
    setExpanded(
      allExpanded ? new Set() : new Set(groupedItems.map((g) => g.category)),
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 text-slate-900 sm:p-6">
      <header className="space-y-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white shadow-lg sm:p-7">
        <Link
          className="inline-flex items-center gap-1.5 text-sm text-blue-100 transition-colors hover:text-white"
          href="/admin/website-directory"
        >
          <ArrowLeft className="h-4 w-4" />
          Website Directory
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Default QA checklist
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-blue-100">
              Active items are included in new sessions, and new or reactivated
              items are added to unfinished sessions. Deactivating an item
              removes it from unfinished sessions and excludes it from new
              sessions, while completed session history stays intact.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <dl className="flex gap-5 text-sm">
              <div>
                <dt className="text-blue-100">Active</dt>
                <dd className="text-2xl font-semibold tabular-nums text-white">
                  {activeCount}
                </dd>
              </div>
              <div>
                <dt className="text-blue-100">Inactive</dt>
                <dd className="text-2xl font-semibold tabular-nums text-white">
                  {items.length - activeCount}
                </dd>
              </div>
            </dl>
            <Button
              className="bg-white text-blue-700 shadow-sm hover:bg-blue-50"
              onClick={openNewItem}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </div>
        </div>
      </header>

      <div>
        {/* Definitions */}
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white ">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                aria-label="Search checklist items"
                className="pl-9"
                placeholder="Search by title, description, or category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div
              aria-label="Filter by status"
              className="flex shrink-0 rounded-md bg-slate-100 p-0.5 text-sm "
              role="group"
            >
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.value}
                  aria-pressed={statusFilter === option.value}
                  className={`rounded px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${
                    statusFilter === option.value
                      ? "bg-white text-slate-900 shadow-sm "
                      : "text-slate-500 hover:text-slate-900 "
                  }`}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Loading checklist…
            </p>
          ) : error ? (
            <div
              className="flex items-center justify-between gap-3 p-6 text-sm text-rose-700 "
              role="alert"
            >
              <span>{error}</span>
              <Button variant="outline" onClick={() => void loadItems()}>
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No checklist items yet. Add the first one using the form.
            </p>
          ) : groupedItems.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No items match your search or filter.
            </p>
          ) : (
            <>
              {!searching && (
                <div className="flex items-center justify-between px-4 pt-3 text-xs text-slate-500">
                  <span>
                    {groupedItems.length}{" "}
                    {groupedItems.length === 1 ? "category" : "categories"}
                  </span>
                  <button
                    className="font-medium text-cyan-700 hover:underline "
                    type="button"
                    onClick={toggleAll}
                  >
                    {allExpanded ? "Collapse all" : "Expand all"}
                  </button>
                </div>
              )}
              <div className="space-y-2 p-3">
                {groupedItems.map(({ category, items: categoryItems }) => {
                  const open = searching || expanded.has(category);
                  const allCategoryItems = sortedItems.filter(
                    (item) => item.category === category,
                  );
                  const activeInGroup = allCategoryItems.filter(
                    (item) => item.is_active,
                  ).length;
                  const allActive = activeInGroup === allCategoryItems.length;
                  const someActive = activeInGroup > 0;
                  const panelId = `panel-${category.replace(/\W+/g, "-")}`;
                  return (
                    <div
                      key={category}
                      className="overflow-hidden rounded-lg border border-slate-200 "
                    >
                      <div className="flex items-center gap-3 bg-slate-50 px-3 py-2.5 ">
                        <button
                          aria-controls={panelId}
                          aria-expanded={open}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
                          type="button"
                          onClick={() => toggleCategory(category)}
                        >
                          <ChevronRight
                            aria-hidden="true"
                            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                              open ? "rotate-90" : ""
                            }`}
                          />
                          <span className="min-w-0 flex-1 truncate font-semibold">
                            {category}
                          </span>
                        </button>
                        <span className="shrink-0 text-xs tabular-nums text-slate-500">
                          {activeInGroup} of {allCategoryItems.length} active
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-2 h-5 w-px shrink-0 bg-slate-200 "
                        />
                        <button
                          aria-checked={
                            allActive ? "true" : someActive ? "mixed" : "false"
                          }
                          aria-label={`Activate or deactivate all ${category} items`}
                          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 ${
                            allActive ? "bg-cyan-700" : "bg-slate-300 "
                          } ${
                            updatingCategory !== null ? "animate-pulse" : ""
                          }`}
                          disabled={
                            updatingItemId !== null || updatingCategory !== null
                          }
                          role="switch"
                          title={
                            updatingCategory === category
                              ? "Updating category"
                              : someActive
                                ? "Deactivate all in category"
                                : "Activate all in category"
                          }
                          type="button"
                          onClick={() => void toggleCategoryActive(category)}
                        >
                          <span
                            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              allActive
                                ? "translate-x-4"
                                : someActive
                                  ? "translate-x-2"
                                  : ""
                            }`}
                          />
                        </button>
                      </div>
                      {open && (
                        <ul className="divide-y divide-slate-100 " id={panelId}>
                          {categoryItems.map((item) => {
                            const isEditing = editingId === item.id;
                            return (
                              <li
                                key={item.id}
                                className={`flex items-start gap-3 border-l-2 py-3 pl-3 pr-3 ${
                                  isEditing
                                    ? "border-cyan-600 bg-cyan-50/60 "
                                    : "border-transparent"
                                }`}
                              >
                                <span
                                  className="mt-0.5 w-7 shrink-0 text-right text-xs tabular-nums text-slate-400"
                                  title="Sort order"
                                >
                                  {item.sort_order}
                                </span>
                                <div
                                  className={`min-w-0 flex-1 ${
                                    item.is_active ? "" : "opacity-55"
                                  }`}
                                >
                                  <p className="text-sm font-medium">
                                    {item.title}
                                  </p>
                                  {item.description !== item.title && (
                                    <p className="mt-0.5 text-sm leading-snug text-slate-500">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <button
                                    aria-checked={item.is_active}
                                    aria-label={`${item.is_active ? "Deactivate" : "Activate"} ${item.title}`}
                                    className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 ${
                                      item.is_active
                                        ? "bg-cyan-700"
                                        : "bg-slate-300 "
                                    }`}
                                    disabled={
                                      updatingItemId !== null ||
                                      updatingCategory !== null
                                    }
                                    role="switch"
                                    title={
                                      item.is_active ? "Active" : "Inactive"
                                    }
                                    type="button"
                                    onClick={() => void toggleActive(item)}
                                  >
                                    <span
                                      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                        item.is_active ? "translate-x-4" : ""
                                      }`}
                                    />
                                  </button>
                                  <Button
                                    aria-label={`Edit ${item.title}`}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => editItem(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 ">
            Deactivate items instead of deleting them to preserve QA history.
          </p>
        </section>

        <Dialog
          open={editorOpen}
          onOpenChange={(open) => {
            if (!open && !saving) resetForm(items);
            else if (open) setEditorOpen(true);
          }}
        >
          <DialogContent className="max-h-[100dvh] max-w-[90vh] gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl">
            <DialogHeader className="border-b border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-white px-6 py-5 pr-12 text-left ">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700 text-white shadow-sm">
                {editingId ? (
                  <Pencil aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Plus aria-hidden="true" className="h-5 w-5" />
                )}
              </div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950 ">
                {editingId ? "Edit checklist item" : "Add checklist item"}
              </DialogTitle>
              <DialogDescription className="max-w-md text-sm leading-relaxed text-slate-600 ">
                {editingId
                  ? "Update the item details used in website QA sessions."
                  : "Create a reusable check for new and unfinished QA sessions."}
              </DialogDescription>
            </DialogHeader>

            <form className="flex min-h-0 flex-col" onSubmit={saveItem}>
              <div className="max-h-[calc(90dvh-190px)] space-y-5 overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="checklist-category">
                      Category
                      <select
                        required
                        className={`${fieldClass} h-11`}
                        id="checklist-category"
                        value={categorySelection}
                        onChange={(event) =>
                          setCategorySelection(event.target.value)
                        }
                      >
                        <option disabled value="">
                          Select a category
                        </option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    {categorySelection === "Other" && (
                      <label
                        className={labelClass}
                        htmlFor="checklist-other-category"
                      >
                        Category name
                        <Input
                          required
                          id="checklist-other-category"
                          maxLength={150}
                          placeholder="Enter category name"
                          value={otherCategory}
                          onChange={(event) =>
                            setOtherCategory(event.target.value)
                          }
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor="checklist-sort-order"
                    >
                      Sort order
                      <Input
                        required
                        className="h-11 w-32"
                        id="checklist-sort-order"
                        min={0}
                        type="number"
                        value={form.sort_order}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            sort_order: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <label className={labelClass} htmlFor="checklist-title">
                  Checklist item
                  <Input
                    required
                    className="h-11"
                    id="checklist-title"
                    maxLength={255}
                    placeholder="e.g. Navigation links work correctly"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                  />
                </label>

                <label className={labelClass} htmlFor="checklist-description">
                  Description
                  <textarea
                    required
                    className={`${fieldClass} min-h-28 resize-y py-2.5`}
                    id="checklist-description"
                    placeholder="Describe what the tester should verify."
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </label>
              </div>

              <DialogFooter className="flex-row justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-6 py-4 sm:space-x-0">
                <Button
                  disabled={saving}
                  type="button"
                  variant="outline"
                  onClick={() => resetForm(items)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-cyan-700 text-white shadow-sm hover:bg-cyan-800"
                  disabled={saving}
                  type="submit"
                >
                  {editingId ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
