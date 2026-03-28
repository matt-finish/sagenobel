import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Package, ExternalLink } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_price_cents: number;
    quantity: number;
    custom_field_values: Record<string, string>;
  }[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  in_progress: "In Progress",
  fulfilled: "Shipped",
  complete: "Complete",
};

export function UserOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">My Orders</h2>
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <Package size={40} className="mx-auto text-foreground-muted/30 mb-4" />
          <p className="text-foreground-muted mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="text-sage hover:text-sage-dark font-medium text-sm"
          >
            Browse Products &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">My Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-background rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {order.order_number}
                </span>
                <span className="text-xs text-foreground-muted ml-3">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-xs font-medium bg-sage/10 text-sage px-2.5 py-1 rounded-full">
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-foreground">
                    {item.product_name} x{item.quantity}
                    {Object.keys(item.custom_field_values).length > 0 && (
                      <span className="text-foreground-muted ml-2 text-xs">
                        ({Object.values(item.custom_field_values).join(", ")})
                      </span>
                    )}
                  </span>
                  <span className="text-foreground-muted">
                    {formatPrice(item.product_price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-foreground">
                Total: {formatPrice(order.total_cents)}
              </span>
              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium"
                >
                  Track Package
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
