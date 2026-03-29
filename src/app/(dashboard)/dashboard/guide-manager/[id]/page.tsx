import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GuideEditorForm } from "@/components/guides/guide-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Guide",
};

export default async function EditGuidePage(
  props: PageProps<"/dashboard/guide-manager/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: guide } = await supabase
    .from("free_guides")
    .select("id, title, description, cover_image_url, cover_image_focal, guide_type, file_url, content, is_published")
    .eq("id", id)
    .single();

  if (!guide) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Edit Guide</h2>
      <GuideEditorForm guide={guide} />
    </div>
  );
}
