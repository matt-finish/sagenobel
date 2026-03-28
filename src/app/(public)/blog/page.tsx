import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { BlogSearch } from "@/components/blog/blog-search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage(props: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const sort = searchParams.sort || "newest";

  const supabase = await createClient();

  let dbQuery = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, created_at")
    .eq("is_published", true);

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  dbQuery = dbQuery.order("created_at", {
    ascending: sort === "oldest",
  });

  const { data: posts } = await dbQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
        Blog
      </h1>

      <BlogSearch initialQuery={query} initialSort={sort} />

      {!posts || posts.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center mt-8">
          <p className="text-foreground-muted">
            {query
              ? `No posts found for "${query}".`
              : "No blog posts yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.cover_image_url ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-background-alt flex items-center justify-center">
                  <span className="text-foreground-muted/30 text-4xl font-serif">
                    SN
                  </span>
                </div>
              )}
              <div className="p-5">
                <p className="text-xs text-foreground-muted mb-2">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-sage transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-foreground-muted mt-2 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
