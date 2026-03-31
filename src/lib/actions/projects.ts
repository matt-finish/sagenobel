"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function createProject(data: {
  title: string;
  description: string;
  cover_image_url: string | null;
  cover_image_focal: { focalX: number; focalY: number } | null;
  gallery_images: { url: string; focalX?: number; focalY?: number }[];
  video_urls: string[];
  product_links: { label: string; url: string }[];
  guide_ids: string[];
  linked_product_ids: string[];
  files: { url: string; name: string }[];
  show_gallery: boolean;
  show_videos: boolean;
  show_guides: boolean;
  show_products: boolean;
  show_order_form: boolean;
  show_reviews: boolean;
  order_form_fields: { id: string; label: string; type: string; required: boolean; options: string[] }[];
  order_form_instructions: string;
  tags: string[];
  is_published: boolean;
  is_promoted: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const slug = slugify(data.title);

  const { error } = await supabase.from("projects").insert({
    ...data,
    slug,
  });

  if (error) {
    if (error.code === "23505") return { error: "A project with this title already exists." };
    return { error: error.message };
  }

  revalidatePath("/projects");
  redirect("/dashboard/project-manager");
}

export async function updateProject(id: string, data: {
  title: string;
  description: string;
  cover_image_url: string | null;
  cover_image_focal: { focalX: number; focalY: number } | null;
  gallery_images: { url: string; focalX?: number; focalY?: number }[];
  video_urls: string[];
  product_links: { label: string; url: string }[];
  guide_ids: string[];
  linked_product_ids: string[];
  files: { url: string; name: string }[];
  show_gallery: boolean;
  show_videos: boolean;
  show_guides: boolean;
  show_products: boolean;
  show_order_form: boolean;
  show_reviews: boolean;
  order_form_fields: { id: string; label: string; type: string; required: boolean; options: string[] }[];
  order_form_instructions: string;
  tags: string[];
  is_published: boolean;
  is_promoted: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const slug = slugify(data.title);

  const { error } = await supabase
    .from("projects")
    .update({ ...data, slug })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect("/dashboard/project-manager");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect("/dashboard/project-manager");
}

export async function approveReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_reviews")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}

export async function updateSubmissionStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_submissions")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
