"use client";

import { useState } from "react";
import { createSection, updateSection, deleteSection, reorderSections } from "@/lib/actions/product-sections";
import { Plus, Trash2, ArrowUp, ArrowDown, Check, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface Section {
  id: string;
  title: string;
}

export function SectionManager({ sections: initial }: { sections: Section[] }) {
  const [sections, setSections] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [reordered, setReordered] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!newTitle.trim()) return;
    const result = await createSection(newTitle.trim());
    if (result.id) {
      setSections([...sections, { id: result.id, title: newTitle.trim() }]);
      setNewTitle("");
      router.refresh();
    }
  }

  async function handleRename(id: string) {
    if (!editTitle.trim()) return;
    await updateSection(id, editTitle.trim());
    setSections(sections.map((s) => s.id === id ? { ...s, title: editTitle.trim() } : s));
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section? Products in it will become uncategorized.")) return;
    await deleteSection(id);
    setSections(sections.filter((s) => s.id !== id));
    router.refresh();
  }

  function moveSection(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated);
    setReordered(true);
  }

  async function handleSaveOrder() {
    setSaving(true);
    await reorderSections(sections.map((s) => s.id));
    setReordered(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-background rounded-xl border border-border p-6 space-y-4">
      <h3 className="text-lg font-medium text-foreground">Shop Sections</h3>
      <p className="text-xs text-foreground-muted">Group products into sections. Each section becomes a horizontal scroll row on the shop page.</p>

      {sections.length > 0 && (
        <div className="space-y-1">
          {sections.map((section, i) => (
            <div key={section.id} className="flex items-center gap-2 px-3 py-2 bg-background-alt rounded-lg">
              {editingId === section.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(section.id); }}
                  className="flex-1 rounded border border-border bg-white px-2 py-1 text-sm focus:border-sage focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-foreground">{section.title}</span>
              )}
              <div className="flex gap-1 flex-shrink-0">
                {editingId === section.id ? (
                  <button onClick={() => handleRename(section.id)} className="p-1 text-sage hover:text-sage-dark"><Check size={14} /></button>
                ) : (
                  <button onClick={() => { setEditingId(section.id); setEditTitle(section.title); }} className="p-1 text-foreground-muted hover:text-foreground"><Pencil size={12} /></button>
                )}
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="p-1 text-foreground-muted hover:text-foreground disabled:opacity-20"><ArrowUp size={14} /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="p-1 text-foreground-muted hover:text-foreground disabled:opacity-20"><ArrowDown size={14} /></button>
                <button onClick={() => handleDelete(section.id)} className="p-1 text-error/50 hover:text-error"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reordered && (
        <button onClick={handleSaveOrder} disabled={saving}
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Order"}
        </button>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="New section name..."
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <button onClick={handleAdd} className="inline-flex items-center gap-1 rounded-lg bg-sage/10 px-3 py-2 text-sage text-sm font-medium hover:bg-sage/20 transition-colors">
          <Plus size={14} />Add
        </button>
      </div>
    </div>
  );
}
