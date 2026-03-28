import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BlogEditorForm } from "@/components/blog/blog-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Blog Post",
};

export default async function EditBlogPostPage(
  props: PageProps<"/dashboard/blog-manager/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, content, excerpt, cover_image_url, is_published, is_featured")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Edit Blog Post</h2>
      <BlogEditorForm post={post} />
    </div>
  );
}
