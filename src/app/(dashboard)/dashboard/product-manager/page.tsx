import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Manager",
};

export default async function ProductManagerPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_cents, images, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Product Manager</h2>
        <Link
          href="/dashboard/product-manager/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors"
        >
          <Plus size={16} />
          New Product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted mb-4">No products yet.</p>
          <Link
            href="/dashboard/product-manager/new"
            className="text-sage hover:text-sage-dark font-medium text-sm"
          >
            Add your first product &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{formatPrice(product.price_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${product.is_active ? "text-success" : "text-foreground-muted"}`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/product-manager/${product.id}`}
                        className="text-xs text-sage hover:text-sage-dark font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
