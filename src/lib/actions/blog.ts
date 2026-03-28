"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImageUrl = formData.get("cover_image_url") as string;
  const isPublished = formData.get("is_published") === "true";
  const isFeatured = formData.get("is_featured") === "true";

  const slug = slugify(title);

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    content: content ? JSON.parse(content) : {},
    excerpt,
    cover_image_url: coverImageUrl || null,
    is_published: isPublished,
    is_featured: isFeatured,
    author_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A post with this title already exists. Please use a different title." };
    }
    return { error: error.message };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/dashboard/blog-manager");
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImageUrl = formData.get("cover_image_url") as string;
  const isPublished = formData.get("is_published") === "true";
  const isFeatured = formData.get("is_featured") === "true";

  const slug = slugify(title);

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      content: content ? JSON.parse(content) : {},
      excerpt,
      cover_image_url: coverImageUrl || null,
      is_published: isPublished,
      is_featured: isFeatured,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A post with this title already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/dashboard/blog-manager/${id}`);
  redirect("/dashboard/blog-manager");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/dashboard/blog-manager");
}
