"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSection(title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get max sort_order
  const { data: existing } = await supabase
    .from("product_sections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("product_sections")
    .insert({ title, sort_order: nextOrder })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/dashboard/product-manager");
  return { id: data.id };
}

export async function updateSection(id: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_sections")
    .update({ title })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/dashboard/product-manager");
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_sections").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/dashboard/product-manager");
  return { success: true };
}

export async function reorderSections(orderedIds: string[]) {
  const supabase = await createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from("product_sections").update({ sort_order: i }).eq("id", orderedIds[i]);
  }
  revalidatePath("/products");
  return { success: true };
}
