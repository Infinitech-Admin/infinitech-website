"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";

import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600";
const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-600";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

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
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      setForm({
        ...EMPTY_ITEM,
        sort_order: nextSortOrder([...remainingItems, result.data]),
      });
      setCategorySelection("");
      setOtherCategory("");
      setEditingId(null);
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
          ? "Checklist item deactivated for new sessions."
          : "Checklist item activated for new sessions.",
      );
    } catch (updateError) {
      console.error("QA checklist activation update failed:", updateError);
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update checklist item.",
      );
    }
  }

  const sortedItems = [...items].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      left.category.localeCompare(right.category) ||
      left.id - right.id,
  );
  const groupedItems = sortedItems.reduce<Map<string, ChecklistItem[]>>(
    (groups, item) => {
      const categoryItems = groups.get(item.category) ?? [];
      categoryItems.push(item);
      groups.set(item.category, categoryItems);
      return groups;
    },
    new Map(),
  );

  return (
    <main className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-5 text-white shadow-sm sm:p-7">
        <Link
          className="mb-4 inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white"
          href="/admin/website-directory"
        >
          <ArrowLeft className="h-4 w-4" />
          Website Directory
        </Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Default QA checklist
        </h1>
        <p className="mt-1 text-sm text-blue-100">
          Manage checks for new QA sessions. Newly added items are also added to
          unfinished sessions; approved sessions remain unchanged.
        </p>
      </header>

      <Card
        className="scroll-mt-6 rounded-2xl p-5 dark:bg-slate-950"
        ref={editorRef}
      >
        <h2 className="font-semibold">
          {editingId ? "Edit checklist item" : "Add checklist item"}
        </h2>
        <form className="mt-4 space-y-4" onSubmit={saveItem}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label
              className="space-y-1.5 text-sm font-medium"
              htmlFor="checklist-category"
            >
              Category
              <select
                required
                id="checklist-category"
                className={inputClass}
                value={categorySelection}
                onChange={(event) => setCategorySelection(event.target.value)}
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
                className="space-y-1.5 text-sm font-medium"
                htmlFor="checklist-other-category"
              >
                Other category
                <Input
                  required
                  id="checklist-other-category"
                  maxLength={150}
                  placeholder="Enter category name"
                  value={otherCategory}
                  onChange={(event) => setOtherCategory(event.target.value)}
                />
              </label>
            )}
            <label
              className="space-y-1.5 text-sm font-medium"
              htmlFor="checklist-sort-order"
            >
              Sort order
              <Input
                required
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
            <label
              className="space-y-1.5 text-sm font-medium sm:col-span-2"
              htmlFor="checklist-title"
            >
              Checklist item
              <Input
                required
                id="checklist-title"
                maxLength={255}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </label>
            <label
              className="space-y-1.5 text-sm font-medium sm:col-span-2"
              htmlFor="checklist-description"
            >
              Description
              <textarea
                required
                className={`${textareaClass} min-h-20`}
                id="checklist-description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} type="submit">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving…" : editingId ? "Save changes" : "Add item"}
            </Button>
            {editingId && (
              <Button
                disabled={saving}
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    ...EMPTY_ITEM,
                    sort_order: nextSortOrder(items),
                  });
                  setCategorySelection("");
                  setOtherCategory("");
                }}
              >
                Cancel edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden rounded-2xl dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold">Checklist definitions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Adjust categories and sort order to organize the checks. Deactivate
            definitions instead of deleting them to preserve QA history.
          </p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading checklist…</p>
        ) : error ? (
          <div
            className="flex items-center justify-between gap-3 p-6 text-sm text-rose-700"
            role="alert"
          >
            <span>{error}</span>
            <Button variant="outline" onClick={() => void loadItems()}>
              Try again
            </Button>
          </div>
        ) : sortedItems.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No checklist items exist yet. Add the first item above.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from(groupedItems, ([category, categoryItems]) => (
              <details key={category} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-600 dark:hover:bg-slate-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-semibold">{category}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {categoryItems.length}{" "}
                      {categoryItems.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                  />
                </summary>
                <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/30">
                  {categoryItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 p-4 pl-6 sm:flex-row sm:items-start sm:justify-between sm:pl-8"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-500">
                            Order {item.sort_order}
                          </span>
                          {!item.is_active && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                              Inactive
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-medium">{item.title}</h3>
                        {item.description !== item.title && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void toggleActive(item)}
                        >
                          {item.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        )}
      </Card>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Plus className="h-4 w-4" />
        {items.filter((item) => item.is_active).length} active item(s) will be
        included in new sessions. Adding an active item also adds it to
        unfinished sessions.
      </div>
    </main>
  );
}
