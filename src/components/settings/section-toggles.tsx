"use client";

import { useState } from "react";
import { updateSectionSettings, type SectionSettings } from "@/lib/actions/settings";
import { Check, FileText, Layers, Package, BookOpen } from "lucide-react";

const sectionConfig = [
  { key: "blog" as const, label: "Blog", description: "Blog posts and journal entries", icon: FileText },
  { key: "projects" as const, label: "Projects", description: "Project showcase gallery", icon: Layers },
  { key: "products" as const, label: "Shop", description: "Product catalog and checkout", icon: Package },
  { key: "guides" as const, label: "Guides", description: "Free downloadable guides and articles", icon: BookOpen },
];

export function SectionToggles({ initial }: { initial: SectionSettings }) {
  const [sections, setSections] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateSectionSettings(sections);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-background rounded-xl border border-border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">Site Sections</h3>
        <p className="text-sm text-foreground-muted mt-1">
          Enable or disable sections of your site. Disabled sections are hidden from navigation and inaccessible to visitors.
        </p>
      </div>

      <div className="space-y-3">
        {sectionConfig.map(({ key, label, description, icon: Icon }) => (
          <label
            key={key}
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
              sections[key] ? "border-sage/30 bg-sage/5" : "border-border bg-background-alt/50"
            }`}
          >
            <Icon size={20} className={sections[key] ? "text-sage" : "text-foreground-muted"} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-foreground-muted">{description}</p>
            </div>
            <input
              type="checkbox"
              checked={sections[key]}
              onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
              className="rounded border-border text-sage focus:ring-sage h-5 w-5"
            />
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
          saved
            ? "bg-success text-white"
            : "bg-sage text-white hover:bg-sage-dark"
        } disabled:opacity-50`}
      >
        {saved ? (
          <span className="flex items-center gap-2"><Check size={16} />Saved</span>
        ) : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
