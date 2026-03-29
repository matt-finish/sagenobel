import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { FocusImage, getImageUrl, type ImageWithFocus } from "@/components/shared/focus-image";
import type { Metadata } from "next";
import { requireSection } from "@/lib/check-section";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">
): Promise<Metadata> {
  await requireSection("products");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || undefined,
  };
}

export default async function ProductPage(
  props: PageProps<"/products/[slug]">
) {
  await requireSection("products");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const rawImages = product.images as (string | ImageWithFocus)[];
  const images = rawImages?.map((img) =>
    typeof img === "string" ? { url: img, focalX: 50, focalY: 50 } : img
  ) || [];
  const customFields = product.custom_fields as {
    id: string;
    label: string;
    type: "dropdown" | "text" | "pricing_dropdown";
    required: boolean;
    options: string[];
    pricing_options?: { label: string; price_cents: number }[];
  }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-sage transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          {images[0] ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <FocusImage image={images[0]} alt={product.name} priority />
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-background-alt flex items-center justify-center">
              <span className="font-serif text-foreground-muted/10 text-7xl italic">
                SN
              </span>
            </div>
          )}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <FocusImage image={img} alt={`${product.name} image ${i + 2}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            {product.name}
          </h1>
          {product.product_type === "affiliate" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/10 text-accent-dark px-2.5 py-1 rounded-full mt-2">
              <ExternalLink size={10} />
              Available on Amazon
            </span>
          ) : customFields.some((f) => f.type === "pricing_dropdown") ? (
            <p className="text-xl text-foreground-muted mt-2">
              From{" "}
              <span className="text-sage font-medium">
                {formatPrice(
                  Math.min(
                    ...customFields
                      .filter((f) => f.type === "pricing_dropdown")
                      .flatMap((f) => (f.pricing_options || []).map((o) => o.price_cents))
                  )
                )}
              </span>
            </p>
          ) : product.price_cents ? (
            <p className="text-2xl text-sage font-medium mt-2">
              {formatPrice(product.price_cents)}
            </p>
          ) : null}
          {product.description && (
            <p className="text-foreground-muted mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.product_type === "affiliate" && product.affiliate_url ? (
            <div className="mt-6">
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition-colors"
              >
                Shop on Amazon
                <ExternalLink size={16} />
              </a>
              <p className="text-xs text-foreground-muted mt-2 text-center">
                As an Amazon Associate, we may earn from qualifying purchases.
              </p>
            </div>
          ) : (
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              priceCents={product.price_cents || 0}
              image={images[0] ? getImageUrl(images[0]) : undefined}
              customFields={customFields}
            />
          )}
        </div>
      </div>
    </div>
  );
}
