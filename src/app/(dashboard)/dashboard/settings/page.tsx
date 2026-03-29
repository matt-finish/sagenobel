import { getSectionSettings } from "@/lib/actions/settings";
import { SectionToggles } from "@/components/settings/section-toggles";
import { HeroCtaSettings } from "@/components/settings/hero-cta-settings";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const sections = await getSectionSettings();
  const supabase = await createClient();

  const { data: ctaPrimary } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_cta")
    .single();

  const { data: ctaSecondary } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_cta_secondary")
    .single();

  const primaryCta = (ctaPrimary?.value as { text: string; link: string }) || { text: "Explore the Blog", link: "/blog" };
  const secondaryCta = (ctaSecondary?.value as { text: string; link: string }) || { text: "Shop Products", link: "/products" };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
      <SectionToggles initial={sections} />
      <HeroCtaSettings primaryCta={primaryCta} secondaryCta={secondaryCta} />
    </div>
  );
}
