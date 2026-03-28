import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Site Settings
        </h3>
        <p className="text-sm text-foreground-muted">
          Site settings and hero content can be configured here once Supabase is connected.
          The settings are stored in the <code className="bg-border/50 px-1 rounded">site_settings</code> table.
        </p>
      </div>
    </div>
  );
}
