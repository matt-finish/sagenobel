import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileDown, FileText } from "lucide-react";
import { SortableList } from "@/components/shared/sortable-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide Manager",
};

export default async function GuideManagerPage() {
  const supabase = await createClient();

  const { data: guides } = await supabase
    .from("free_guides")
    .select("id, title, guide_type, is_published, download_count, sort_order, created_at")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Guide Manager</h2>
        <Link
          href="/dashboard/guide-manager/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors"
        >
          <Plus size={16} />
          New Guide
        </Link>
      </div>

      {!guides || guides.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted mb-4">No guides yet.</p>
          <Link
            href="/dashboard/guide-manager/new"
            className="text-sage hover:text-sage-dark font-medium text-sm"
          >
            Create your first guide &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr key={guide.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{guide.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                      {guide.guide_type === "download" ? (
                        <><FileDown size={12} /> Download</>
                      ) : (
                        <><FileText size={12} /> Article</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${guide.is_published ? "text-success" : "text-foreground-muted"}`}>
                      {guide.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/guide-manager/${guide.id}`}
                      className="text-xs text-sage hover:text-sage-dark font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {guides && guides.length > 1 && (
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Reorder</h3>
          <SortableList
            table="free_guides"
            items={guides.map((i) => ({ id: i.id, label: i.title, sublabel: i.guide_type }))}
          />
        </div>
      )}
    </div>
  );
}
