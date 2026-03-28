import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { formatPrice } from "@/lib/utils";

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

  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, created_at")
    .eq("is_published", true)
    .eq("is_featured", false)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background-alt via-background to-sage/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <div className="decorative-line mb-6 animate-fade-in" />
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.1] animate-fade-in-up">
                Curating
                {" "}
                <span className="italic text-sage">Experiences</span>
                {" "}
                & Environments
              </h1>
              <p className="mt-5 text-base md:text-lg text-foreground-muted leading-relaxed animate-fade-in-up delay-200">
                Travel, hosting, home decor, and inspiration for intentional
                living. Discover tips, guides, and curated products to elevate
                your everyday.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-300">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-7 py-3 text-white text-sm font-medium hover:bg-sage-dark transition-all duration-300 hover:shadow-lg hover:shadow-sage/20"
                >
                  Explore the Blog
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-7 py-3 text-foreground text-sm font-medium hover:border-sage hover:text-sage transition-all duration-300"
                >
                  Shop Products
                </Link>
              </div>
            </div>

            {/* Right — Image grid */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in delay-200">
              <div className="space-y-3">
                <div className="aspect-[3/4] rounded-xl bg-background-alt border border-border/50 overflow-hidden">
                  {recentProducts?.[0]?.images?.[0] ? (
                    <Image src={(recentProducts[0].images as string[])[0]} alt="" fill className="object-cover !relative" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-foreground-muted/8 text-5xl italic">SN</span>
                    </div>
                  )}
                </div>
                <div className="aspect-square rounded-xl bg-sage/10 border border-sage/10 flex items-center justify-center">
                  <p className="font-serif text-sage/40 text-sm italic text-center px-4">curated with intention</p>
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="aspect-square rounded-xl bg-background-alt border border-border/50 overflow-hidden">
                  {featuredPost?.cover_image_url ? (
                    <Image src={featuredPost.cover_image_url} alt="" fill className="object-cover !relative" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-foreground-muted/8 text-5xl italic">SN</span>
                    </div>
                  )}
                </div>
                <div className="aspect-[3/4] rounded-xl bg-background-alt border border-border/50 overflow-hidden">
                  {recentProducts?.[1]?.images?.[0] ? (
                    <Image src={(recentProducts[1].images as string[])[0]} alt="" fill className="object-cover !relative" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-foreground-muted/8 text-5xl italic">SN</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex items-center gap-4 mb-10">
            <div className="decorative-line" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
              Featured
            </span>
          </div>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-7">
                {featuredPost.cover_image_url ? (
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden image-hover">
                    <Image
                      src={featuredPost.cover_image_url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-2xl bg-background-alt flex items-center justify-center">
                    <span className="font-serif text-foreground-muted/15 text-8xl italic">
                      SN
                    </span>
                  </div>
                )}
              </div>
              <div className="md:col-span-5">
                <p className="text-sm text-foreground-muted mb-4">
                  {new Date(featuredPost.created_at).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground group-hover:text-sage transition-colors duration-300 leading-tight">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt && (
                  <p className="text-foreground-muted mt-4 leading-relaxed text-lg">
                    {featuredPost.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-sage font-medium mt-6 link-underline">
                  Read the full story
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="bg-background-alt/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="decorative-line" />
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
                  Latest Posts
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1.5 link-underline transition-colors"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`group animate-fade-in-up delay-${(i + 1) * 100}`}
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
                    <div className="aspect-[4/3] rounded-xl bg-background flex items-center justify-center mb-5 image-hover border border-border">
                      <span className="font-serif text-foreground-muted/10 text-6xl italic">
                        SN
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-sage transition-colors duration-300 leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-foreground-muted mt-2 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="decorative-line" />
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              The Shop
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sage hover:text-sage-dark font-medium text-sm flex items-center gap-1.5 link-underline transition-colors"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        {recentProducts && recentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentProducts.map((product) => {
              const images = product.images as string[];
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  {images?.[0] ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 image-hover">
                      <Image
                        src={images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-xl bg-background-alt flex items-center justify-center mb-4 image-hover border border-border">
                      <span className="font-serif text-foreground-muted/10 text-6xl italic">
                        SN
                      </span>
                    </div>
                  )}
                  <h3 className="font-medium text-foreground group-hover:text-sage transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground-muted mt-1">
                    {formatPrice(product.price_cents)}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="aspect-[3/4] bg-background-alt rounded-xl mb-4 border border-border/50" />
                <p className="text-foreground-muted text-sm">Coming soon</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Guides Section */}
      <section className="bg-sage/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="decorative-line mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              Free Guides & Resources
            </h2>
            <p className="text-foreground-muted mt-4 text-lg leading-relaxed">
              Downloadable guides and articles to help you curate your ideal lifestyle.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 rounded-full border border-sage/30 px-8 py-3.5 text-sage font-medium hover:bg-sage hover:text-white transition-all duration-300"
            >
              Browse Free Guides
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-sage/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="decorative-line mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Stay Inspired
          </h2>
          <p className="text-foreground-muted mt-4 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            Curated tips, new guides, and product drops delivered to your
            inbox. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
