import { createClient } from "@/lib/supabase/server";
import { ProjectEditorForm } from "@/components/projects/project-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Project" };

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: guides } = await supabase
    .from("free_guides")
    .select("id, title")
    .eq("is_published", true)
    .order("title");

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Create New Project</h2>
      <ProjectEditorForm guides={guides || []} />
    </div>
  );
}
