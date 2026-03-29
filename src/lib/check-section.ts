import { getSectionSettings, type SectionSettings } from "@/lib/actions/settings";
import { notFound } from "next/navigation";

export async function requireSection(section: keyof SectionSettings) {
  const settings = await getSectionSettings();
  if (!settings[section]) {
    notFound();
  }
}
