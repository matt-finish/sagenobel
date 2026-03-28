import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Eye, EyeOff, Star } from "lucide-react";
import { DeleteBlogButton } from "@/components/blog/delete-blog-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Manager",
};

export default async function BlogManagerPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, is_published, is_featured, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Blog Manager</h2>
        <Link
          href="/dashboard/blog-manager/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted mb-4">No blog posts yet.</p>
          <Link
            href="/dashboard/blog-manager/new"
            className="text-sage hover:text-sage-dark font-medium text-sm"
          >
            Create your first post &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {post.title}
                      </span>
                      {post.is_featured && (
                        <Star
                          size={14}
                          className="text-accent fill-accent"
                        />
                      )}
                    </div>
                    {post.excerpt && (
                      <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {post.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground-muted">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground-muted">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/blog-manager/${post.id}`}
                        className="text-xs text-sage hover:text-sage-dark font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteBlogButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
