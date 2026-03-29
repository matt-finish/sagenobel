"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reorderItems(
  table: "products" | "projects" | "free_guides" | "blog_posts",
  orderedIds: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Update sort_order for each item
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from(table)
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
