"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function createGuide(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImageUrl = formData.get("cover_image_url") as string;
  const coverImageFocalRaw = formData.get("cover_image_focal") as string;
  const coverImageFocal = coverImageFocalRaw ? JSON.parse(coverImageFocalRaw) : null;
  const guideType = formData.get("guide_type") as string;
  const fileUrl = formData.get("file_url") as string;
  const filesRaw = formData.get("files") as string;
  const files = filesRaw ? JSON.parse(filesRaw) : [];
  const content = formData.get("content") as string;
  const tags = formData.get("tags") as string;
  const isPublished = formData.get("is_published") === "true";

  const slug = slugify(title);

  const { error } = await supabase.from("free_guides").insert({
    title,
    slug,
    description,
    cover_image_url: coverImageUrl || null,
    cover_image_focal: coverImageFocal,
    guide_type: guideType,
    file_url: guideType === "download" ? fileUrl || null : null,
    files: guideType === "download" ? files : [],
    content: guideType === "article" && content ? JSON.parse(content) : null,
    tags: tags ? JSON.parse(tags) : [],
    is_published: isPublished,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A guide with this title already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/guides");
  redirect("/dashboard/guide-manager");
}

export async function updateGuide(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const coverImageUrl = formData.get("cover_image_url") as string;
  const coverImageFocalRaw = formData.get("cover_image_focal") as string;
  const coverImageFocal = coverImageFocalRaw ? JSON.parse(coverImageFocalRaw) : null;
  const guideType = formData.get("guide_type") as string;
  const fileUrl = formData.get("file_url") as string;
  const filesRaw = formData.get("files") as string;
  const files = filesRaw ? JSON.parse(filesRaw) : [];
  const content = formData.get("content") as string;
  const tags = formData.get("tags") as string;
  const isPublished = formData.get("is_published") === "true";

  const slug = slugify(title);

  const { error } = await supabase
    .from("free_guides")
    .update({
      title,
      slug,
      description,
      cover_image_url: coverImageUrl || null,
    cover_image_focal: coverImageFocal,
      guide_type: guideType,
      file_url: guideType === "download" ? fileUrl || null : null,
    files: guideType === "download" ? files : [],
      content: guideType === "article" && content ? JSON.parse(content) : null,
      tags: tags ? JSON.parse(tags) : [],
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/guides");
  redirect("/dashboard/guide-manager");
}

export async function deleteGuide(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("free_guides").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/guides");
  redirect("/dashboard/guide-manager");
}
