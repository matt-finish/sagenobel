import { ProductEditorForm } from "@/components/products/product-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Product",
};

export default function NewProductPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Add New Product</h2>
      <ProductEditorForm />
    </div>
  );
}
