import { createClient } from "@/lib/supabase/server";
import { getSectionSettings } from "@/lib/actions/settings";
import Link from "next/link";
import Image from "next/image";
import { Search, FileText, Package, Layers, BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FocusImage, type ImageWithFocus } from "@/components/shared/focus-image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const sections = await getSectionSettings();
  const supabase = await createClient();

  type Result = { type: string; id: string; title: string; slug: string; description?: string | null; image?: string | ImageWithFocus | null; price_cents?: number; tags?: string[] };
  const results: Result[] = [];

  if (query) {
    const q = `%${query}%`;

    if (sections.blog) {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url")
        .eq("is_published", true)
        .or(`title.ilike.${q},excerpt.ilike.${q}`)
        .limit(10);
      posts?.forEach((p) => results.push({ type: "blog", id: p.id, title: p.title, slug: p.slug, description: p.excerpt, image: p.cover_image_url }));
    }

    const searchTerm = query.toLowerCase().trim();

    if (sections.products) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, description, images, price_cents, tags")
        .eq("is_active", true)
        .or(`name.ilike.${q},description.ilike.${q}`)
        .limit(10);
      products?.forEach((p) => {
        const imgs = p.images as (string | ImageWithFocus)[];
        results.push({ type: "product", id: p.id, title: p.name, slug: p.slug, description: p.description, image: imgs?.[0], price_cents: p.price_cents, tags: p.tags as string[] });
      });
      // Also search by exact tag match
      const { data: tagProducts } = await supabase
        .from("products")
        .select("id, name, slug, description, images, price_cents, tags")
        .eq("is_active", true)
        .contains("tags", [searchTerm])
        .limit(10);
      tagProducts?.forEach((p) => {
        if (!results.some((r) => r.type === "product" && r.id === p.id)) {
          const imgs = p.images as (string | ImageWithFocus)[];
          results.push({ type: "product", id: p.id, title: p.name, slug: p.slug, description: p.description, image: imgs?.[0], price_cents: p.price_cents, tags: p.tags as string[] });
        }
      });
    }

    if (sections.projects) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, slug, description, cover_image_url, tags")
        .eq("is_published", true)
        .or(`title.ilike.${q},description.ilike.${q}`)
        .limit(10);
      projects?.forEach((p) => results.push({ type: "project", id: p.id, title: p.title, slug: p.slug, description: p.description, image: p.cover_image_url, tags: p.tags as string[] }));
      const { data: tagProjects } = await supabase
        .from("projects")
        .select("id, title, slug, description, cover_image_url, tags")
        .eq("is_published", true)
        .contains("tags", [searchTerm])
        .limit(10);
      tagProjects?.forEach((p) => {
        if (!results.some((r) => r.type === "project" && r.id === p.id)) {
          results.push({ type: "project", id: p.id, title: p.title, slug: p.slug, description: p.description, image: p.cover_image_url, tags: p.tags as string[] });
        }
      });
    }

    if (sections.guides) {
      const { data: guides } = await supabase
        .from("free_guides")
        .select("id, title, slug, description, cover_image_url, tags")
        .eq("is_published", true)
        .or(`title.ilike.${q},description.ilike.${q}`)
        .limit(10);
      guides?.forEach((g) => results.push({ type: "guide", id: g.id, title: g.title, slug: g.slug, description: g.description, image: g.cover_image_url, tags: g.tags as string[] }));
      const { data: tagGuides } = await supabase
        .from("free_guides")
        .select("id, title, slug, description, cover_image_url, tags")
        .eq("is_published", true)
        .contains("tags", [searchTerm])
        .limit(10);
      tagGuides?.forEach((g) => {
        if (!results.some((r) => r.type === "guide" && r.id === g.id)) {
          results.push({ type: "guide", id: g.id, title: g.title, slug: g.slug, description: g.description, image: g.cover_image_url, tags: g.tags as string[] });
        }
      });
    }
  }

  const typeConfig: Record<string, { icon: typeof FileText; label: string; prefix: string }> = {
    blog: { icon: FileText, label: "Blog", prefix: "/blog" },
    product: { icon: Package, label: "Shop", prefix: "/products" },
    project: { icon: Layers, label: "Project", prefix: "/projects" },
    guide: { icon: BookOpen, label: "Guide", prefix: "/guides" },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">Search</span>
      </div>

      <form action="/search" method="get" className="mb-10">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search blog posts, products, projects, guides..."
            className="w-full rounded-xl border border-border bg-white pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage text-lg"
          />
        </div>
      </form>

      {query && (
        <p className="text-sm text-foreground-muted mb-6">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}

      {results.length === 0 && query && (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">No results found. Try a different search term.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => {
            const config = typeConfig[result.type];
            const Icon = config.icon;
            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={`${config.prefix}/${result.slug}`}
                className="group flex gap-4 p-4 rounded-xl border border-border hover:border-sage/30 hover:bg-sage/[0.02] transition-all duration-300"
              >
                {result.image ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    {typeof result.image === "string" ? (
                      <Image src={result.image} alt="" fill className="object-cover" />
                    ) : (
                      <FocusImage image={result.image} alt="" />
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-background-alt flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-foreground-muted/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-sage">{config.label}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-sage transition-colors duration-300 line-clamp-1">
                    {result.title}
                  </h3>
                  {result.description && (
                    <p className="text-sm text-foreground-muted line-clamp-1 mt-0.5">{result.description}</p>
                  )}
                  {result.price_cents !== undefined && (
                    <p className="text-sm text-sage font-medium mt-0.5">{formatPrice(result.price_cents)}</p>
                  )}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {result.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] bg-sage/10 text-sage px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
