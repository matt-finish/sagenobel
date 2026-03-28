import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_cents, images, description")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
          Curated
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-10">
        The Shop
      </h1>

      {!products || products.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">
            Products will appear here once added. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
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
                <h2 className="font-medium text-foreground group-hover:text-sage transition-colors duration-300">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="text-sm text-foreground-muted mt-1">
                  {formatPrice(product.price_cents)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
