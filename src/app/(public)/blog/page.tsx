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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
          Journal
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              {post.cover_image_url ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 image-hover">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl bg-background-alt flex items-center justify-center mb-5 image-hover border border-border">
                  <span className="font-serif text-foreground-muted/10 text-6xl italic">
                    SN
                  </span>
                </div>
              )}
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-sage transition-colors duration-300 leading-snug line-clamp-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-foreground-muted mt-2 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
