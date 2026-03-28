import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/products/[slug]">
): Promise<Metadata> {
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
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const images = product.images as string[];
  const customFields = product.custom_fields as {
    id: string;
    label: string;
    type: "dropdown" | "text";
    required: boolean;
    options: string[];
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
          {images?.[0] ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-background-alt flex items-center justify-center">
              <span className="text-foreground-muted/20 text-7xl font-serif">
                SN
              </span>
            </div>
          )}
          {images && images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`${product.name} image ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            {product.name}
          </h1>
          <p className="text-2xl text-sage font-medium mt-2">
            {formatPrice(product.price_cents)}
          </p>
          {product.description && (
            <p className="text-foreground-muted mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          <AddToCartButton
            productId={product.id}
            productName={product.name}
            priceCents={product.price_cents}
            image={images?.[0]}
            customFields={customFields}
          />
        </div>
      </div>
    </div>
  );
}
