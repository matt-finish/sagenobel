import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectEditorForm } from "@/components/projects/project-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage(
  props: PageProps<"/dashboard/project-manager/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: guides } = await supabase
    .from("free_guides")
    .select("id, title")
    .eq("is_published", true)
    .order("title");

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Edit Project</h2>
      <ProjectEditorForm
        project={project as Parameters<typeof ProjectEditorForm>[0]["project"]}
        guides={guides || []}
      />
    </div>
  );
}
