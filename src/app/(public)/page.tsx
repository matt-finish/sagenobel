import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredPost } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, cover_image_url, created_at")
    .eq("is_published", true)
    .eq("is_featured", true)
    .single();

  const { data: recentProducts } = await supabase
    .from("products")
    .select("id, name, slug, price_cents, images")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-background-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight">
              Curating Experiences
              <span className="text-sage"> & </span>
              Environments
            </h1>
            <p className="mt-6 text-lg text-foreground-muted leading-relaxed">
              Travel, hosting, home decor, and inspiration for intentional
              living. Discover tips, guides, and curated products to elevate
              your everyday.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage px-6 py-3 text-white font-medium hover:bg-sage-dark transition-colors"
              >
                Explore the Blog
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-foreground font-medium hover:bg-white transition-colors"
              >
                Shop Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Featured Post
          </h2>
          <Link
            href="/blog"
            className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View all posts
            <ArrowRight size={16} />
          </Link>
        </div>
        {featuredPost ? (
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block bg-background-alt rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {featuredPost.cover_image_url ? (
                <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                  <Image
                    src={featuredPost.cover_image_url}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] md:aspect-auto bg-border/20 flex items-center justify-center">
                  <span className="text-foreground-muted/20 text-6xl font-serif">
                    SN
                  </span>
                </div>
              )}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <p className="text-sm text-foreground-muted mb-3">
                  {new Date(featuredPost.created_at).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground group-hover:text-sage transition-colors">
                  {featuredPost.title}
                </h3>
                {featuredPost.excerpt && (
                  <p className="text-foreground-muted mt-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sage font-medium mt-4">
                  Read more
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-background-alt rounded-2xl p-8 md:p-12">
            <p className="text-foreground-muted text-center py-12">
              Featured blog post will appear here once published.
            </p>
          </div>
        )}
      </section>

      {/* Products Preview Section */}
      <section className="bg-background-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Shop
            </h2>
            <Link
              href="/products"
              className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1 transition-colors"
            >
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>
          {recentProducts && recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProducts.map((product) => {
                const images = product.images as string[];
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-background rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {images?.[0] ? (
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-border/20 flex items-center justify-center">
                        <span className="text-foreground-muted/20 text-4xl font-serif">
                          SN
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-foreground group-hover:text-sage transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-foreground-muted mt-1">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(product.price_cents / 100)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background rounded-xl p-6 text-center"
                >
                  <div className="aspect-square bg-border/30 rounded-lg mb-4" />
                  <p className="text-foreground-muted text-sm">
                    Products coming soon
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guides Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Free Guides
          </h2>
          <Link
            href="/guides"
            className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View all guides
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bg-background-alt rounded-2xl p-8 md:p-12">
          <p className="text-foreground-muted text-center py-8">
            Free guides and resources will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
