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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
        Products
      </h1>

      {!products || products.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">
            Products will appear here once added. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const images = product.images as string[];
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
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
                  <div className="aspect-square bg-background-alt flex items-center justify-center">
                    <span className="text-foreground-muted/20 text-5xl font-serif">
                      SN
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-semibold text-foreground group-hover:text-sage transition-colors">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-sage font-medium mt-2">
                    {formatPrice(product.price_cents)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
