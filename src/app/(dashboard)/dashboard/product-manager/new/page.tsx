import { createClient } from "@/lib/supabase/server";
import { ProductEditorForm } from "@/components/products/product-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("product_sections")
    .select("id, title")
    .order("sort_order");

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Add New Product</h2>
      <ProductEditorForm sections={sections || []} />
    </div>
  );
}
