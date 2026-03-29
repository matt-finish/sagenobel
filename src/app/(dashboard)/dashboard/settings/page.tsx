import { getSectionSettings } from "@/lib/actions/settings";
import { SectionToggles } from "@/components/settings/section-toggles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const sections = await getSectionSettings();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
      <SectionToggles initial={sections} />
    </div>
  );
}
