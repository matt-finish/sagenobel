import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ClearCart } from "@/components/cart/clear-cart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <ClearCart />
      <CheckCircle size={56} className="mx-auto text-success mb-6" />
      <h1 className="text-3xl font-semibold text-foreground mb-3">
        Thank You!
      </h1>
      <p className="text-foreground-muted leading-relaxed mb-8">
        Your order has been confirmed. You&apos;ll receive a confirmation email
        shortly. We&apos;ll send you another email when your order ships with
        tracking information.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center justify-center rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors"
        >
          View My Orders
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
