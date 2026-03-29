"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SectionSettings {
  blog: boolean;
  projects: boolean;
  products: boolean;
  guides: boolean;
}

export async function getSectionSettings(): Promise<SectionSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "sections")
    .single();

  return (data?.value as SectionSettings) || {
    blog: true,
    projects: true,
    products: true,
    guides: true,
  };
}

export async function updateSectionSettings(sections: SectionSettings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "sections", value: sections });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
