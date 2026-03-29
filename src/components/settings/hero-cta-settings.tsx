"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const linkOptions = [
  { value: "/blog", label: "Blog" },
  { value: "/projects", label: "Projects" },
  { value: "/products", label: "Shop" },
  { value: "/guides", label: "Guides" },
];

interface CtaValue {
  text: string;
  link: string;
}

export function HeroCtaSettings({
  primaryCta,
  secondaryCta,
}: {
  primaryCta: CtaValue;
  secondaryCta: CtaValue;
}) {
  const [primary, setPrimary] = useState(primaryCta);
  const [secondary, setSecondary] = useState(secondaryCta);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);

    await fetch("/api/settings/hero-cta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primary, secondary }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-background rounded-xl border border-border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">Homepage Buttons</h3>
        <p className="text-sm text-foreground-muted mt-1">
          Customize the call-to-action buttons on the homepage hero.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary CTA */}
        <div className="space-y-3 p-4 rounded-lg border border-sage/20 bg-sage/5">
          <p className="text-sm font-medium text-foreground">Primary Button</p>
          <div>
            <label className="block text-xs text-foreground-muted mb-1">Button Text</label>
            <input
              type="text"
              value={primary.text}
              onChange={(e) => setPrimary({ ...primary, text: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="Explore the Blog"
            />
          </div>
          <div>
            <label className="block text-xs text-foreground-muted mb-1">Links To</label>
            <select
              value={primary.link}
              onChange={(e) => setPrimary({ ...primary, link: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              {linkOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="bg-sage text-white text-xs font-medium rounded-full px-4 py-2 text-center">
            {primary.text || "Preview"}
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="space-y-3 p-4 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground">Secondary Button</p>
          <div>
            <label className="block text-xs text-foreground-muted mb-1">Button Text</label>
            <input
              type="text"
              value={secondary.text}
              onChange={(e) => setSecondary({ ...secondary, text: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="Shop Products"
            />
          </div>
          <div>
            <label className="block text-xs text-foreground-muted mb-1">Links To</label>
            <select
              value={secondary.link}
              onChange={(e) => setSecondary({ ...secondary, link: e.target.value })}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              {linkOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="border border-foreground/20 text-foreground text-xs font-medium rounded-full px-4 py-2 text-center">
            {secondary.text || "Preview"}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
          saved ? "bg-success text-white" : "bg-sage text-white hover:bg-sage-dark"
        } disabled:opacity-50`}
      >
        {saved ? (
          <span className="flex items-center gap-2"><Check size={16} />Saved</span>
        ) : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
