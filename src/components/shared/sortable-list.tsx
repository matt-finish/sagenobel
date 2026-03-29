"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, GripVertical, Check } from "lucide-react";
import { reorderItems } from "@/lib/actions/reorder";

interface SortableItem {
  id: string;
  label: string;
  sublabel?: string;
}

export function SortableList({
  items: initialItems,
  table,
}: {
  items: SortableItem[];
  table: "products" | "projects" | "free_guides" | "blog_posts";
}) {
  const [items, setItems] = useState(initialItems);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setItems(updated);
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await reorderItems(table, items.map((i) => i.id));
    setSaving(false);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 bg-background rounded-lg border border-border group"
          >
            <GripVertical size={14} className="text-foreground-muted/30 flex-shrink-0" />
            <span className="text-xs text-foreground-muted w-6 text-center flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
              {item.sublabel && (
                <p className="text-xs text-foreground-muted truncate">{item.sublabel}</p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-alt disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Move up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveItem(i, 1)}
                disabled={i === items.length - 1}
                className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-alt disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Move down"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {(dirty || saved) && (
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
            saved
              ? "bg-success text-white"
              : "bg-sage text-white hover:bg-sage-dark"
          } disabled:opacity-50`}
        >
          {saved ? (
            <span className="flex items-center gap-1.5"><Check size={14} />Order Saved</span>
          ) : saving ? "Saving..." : "Save Order"}
        </button>
      )}
    </div>
  );
}
