import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project Manager" };

export default async function ProjectManagerPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, is_published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Project Manager</h2>
        <Link href="/dashboard/project-manager/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors">
          <Plus size={16} />New Project
        </Link>
      </div>
      {!projects || projects.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted mb-4">No projects yet.</p>
          <Link href="/dashboard/project-manager/new" className="text-sage hover:text-sage-dark font-medium text-sm">Create your first project &rarr;</Link>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium ${p.is_published ? "text-success" : "text-foreground-muted"}`}>{p.is_published ? "Published" : "Draft"}</span></td>
                  <td className="px-4 py-3 text-xs text-foreground-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link href={`/dashboard/project-manager/${p.id}`} className="text-xs text-sage hover:text-sage-dark font-medium">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
