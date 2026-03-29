import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductEditorForm } from "@/components/products/product-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage(
  props: PageProps<"/dashboard/product-manager/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price_cents, images, custom_fields, is_active, product_type, affiliate_url, tags, show_disclaimer, disclaimer, section_id")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: sections } = await supabase
    .from("product_sections")
    .select("id, title")
    .order("sort_order");

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Edit Product</h2>
      <ProductEditorForm
        product={product as Parameters<typeof ProductEditorForm>[0]["product"]}
        sections={sections || []}
      />
    </div>
  );
}
