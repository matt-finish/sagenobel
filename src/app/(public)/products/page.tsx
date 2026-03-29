import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FocusImage, type ImageWithFocus } from "@/components/shared/focus-image";
import { PageSearch } from "@/components/shared/page-search";
import { HorizontalScroll } from "@/components/products/horizontal-scroll";
import type { Metadata } from "next";
import { requireSection } from "@/lib/check-section";

export const metadata: Metadata = {
  title: "Products",
};

function ProductCard({ product }: { product: { id: string; name: string; slug: string; price_cents: number | null; images: unknown; description: string | null; product_type: string; affiliate_url: string | null } }) {
  const rawImages = product.images as (string | ImageWithFocus)[];
  const firstImage = rawImages?.[0];
  const isAffiliate = product.product_type === "affiliate";
  const href = isAffiliate ? product.affiliate_url || "#" : `/products/${product.slug}`;

  return (
    <Link
      href={href}
      {...(isAffiliate ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex-shrink-0 w-44 sm:w-48"
    >
      <div className="relative">
        {firstImage ? (
          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 image-hover">
            <FocusImage image={firstImage} alt={product.name} />
          </div>
        ) : (
          <div className="aspect-square rounded-xl bg-background-alt flex items-center justify-center mb-2 border border-border">
            <span className="font-serif text-foreground-muted/10 text-4xl italic">SN</span>
          </div>
        )}
        {isAffiliate && (
          <span className="absolute top-2 left-2 text-[8px] font-medium uppercase tracking-[0.1em] bg-foreground/[0.06] backdrop-blur-sm text-foreground-muted/70 px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <ExternalLink size={8} />
            Amazon
          </span>
        )}
      </div>
      <h3 className="font-serif text-sm font-medium text-foreground group-hover:text-sage transition-colors duration-300 leading-snug line-clamp-2">
        {product.name}
      </h3>
      <p className="mt-0.5">
        {isAffiliate ? (
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-sage flex items-center gap-0.5">Shop on Amazon <ExternalLink size={8} /></span>
        ) : product.price_cents ? <span className="text-xs text-foreground-muted">{formatPrice(product.price_cents)}</span> : null}
      </p>
    </Link>
  );
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSection("products");
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const supabase = await createClient();
  const isSearching = query.trim().length > 0;

  // Fetch all products
  const searchTerm = query.toLowerCase().trim();

  let dbQuery = supabase
    .from("products")
    .select("id, name, slug, price_cents, images, description, product_type, affiliate_url, tags")
    .eq("is_active", true);

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data: nameResults } = await dbQuery.order("sort_order").order("created_at", { ascending: false });

  let tagResults: typeof nameResults = [];
  if (searchTerm) {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price_cents, images, description, product_type, affiliate_url, tags")
      .eq("is_active", true)
      .contains("tags", [searchTerm]);
    tagResults = data || [];
  }

  const seen = new Set<string>();
  const products = [...(nameResults || []), ...tagResults].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Fetch sections and their product assignments
  const { data: sections } = await supabase
    .from("product_sections")
    .select("id, title")
    .eq("is_visible", true)
    .order("sort_order");

  const { data: sectionItems } = await supabase
    .from("product_section_items")
    .select("product_id, section_id");

  // Group products by section (a product can appear in multiple sections)
  const productMap = new Map(products.map((p) => [p.id, p]));
  const sectionMap = new Map<string, typeof products>();
  const assignedProductIds = new Set<string>();

  for (const item of sectionItems || []) {
    const product = productMap.get(item.product_id);
    if (!product) continue;
    assignedProductIds.add(item.product_id);
    if (!sectionMap.has(item.section_id)) sectionMap.set(item.section_id, []);
    sectionMap.get(item.section_id)!.push(product);
  }

  // Uncategorized = products not in any section
  const uncategorized = products.filter((p) => !assignedProductIds.has(p.id));

  const hasAffiliate = products.some((p) => p.product_type === "affiliate");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
          Curated
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-8">
        The Shop
      </h1>
      <div className="mb-8 max-w-md">
        <PageSearch basePath="/products" placeholder="Search products..." />
      </div>

      {hasAffiliate && (
        <p className="text-[11px] text-foreground-muted mb-6 leading-relaxed">
          Some links on this page are affiliate links. As an Amazon Associate, we earn from qualifying purchases. This comes at no additional cost to you.
        </p>
      )}

      {products.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">
            {isSearching ? `No products found for "${query}".` : "Products will appear here once added. Check back soon!"}
          </p>
        </div>
      ) : isSearching ? (
        /* Search results — flat grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Browse mode — sections with horizontal scroll */
        <div className="space-y-12">
          {(sections || []).map((section) => {
            const sectionProducts = sectionMap.get(section.id);
            if (!sectionProducts || sectionProducts.length === 0) return null;
            return (
              <section key={section.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="decorative-line" />
                  <h2 className="font-serif text-2xl font-medium text-foreground">{section.title}</h2>
                </div>
                <HorizontalScroll>
                  {sectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </HorizontalScroll>
              </section>
            );
          })}

          {/* Uncategorized products */}
          {uncategorized.length > 0 && (
            <section>
              {(sections || []).length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="decorative-line" />
                  <h2 className="font-serif text-2xl font-medium text-foreground">More</h2>
                </div>
              )}
              <HorizontalScroll>
                {uncategorized.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </HorizontalScroll>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
