"use client";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function CartContents() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckingOut(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            customFieldValues: item.customFieldValues,
          })),
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setCheckingOut(false);
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-background-alt rounded-2xl p-12 text-center">
        <ShoppingBag size={40} className="mx-auto text-foreground-muted/30 mb-4" />
        <p className="text-foreground-muted mb-4">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}:${JSON.stringify(item.customFieldValues)}`}
            className="flex gap-4 bg-background rounded-xl border border-border p-4"
          >
            {item.image ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-background-alt flex items-center justify-center flex-shrink-0">
                <span className="text-foreground-muted/20 text-lg font-serif">
                  SN
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">{item.productName}</h3>
              {Object.entries(item.customFieldValues).length > 0 && (
                <p className="text-xs text-foreground-muted mt-0.5">
                  {Object.entries(item.customFieldValues)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ")}
                </p>
              )}
              <p className="text-sm text-sage font-medium mt-1">
                {formatPrice(item.priceCents)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() =>
                  removeItem(item.productId, item.customFieldValues)
                }
                className="p-1 text-foreground-muted hover:text-error transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.customFieldValues,
                      item.quantity - 1
                    )
                  }
                  className="p-1 rounded border border-border hover:bg-background-alt transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-medium w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      item.customFieldValues,
                      item.quantity + 1
                    )
                  }
                  className="p-1 rounded border border-border hover:bg-background-alt transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-foreground-muted">Subtotal</span>
          <span className="text-lg font-semibold text-foreground">
            {formatPrice(totalCents)}
          </span>
        </div>
        <p className="text-xs text-foreground-muted mb-4">
          Shipping calculated at checkout.
        </p>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="w-full rounded-lg bg-sage px-6 py-3 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkingOut ? "Redirecting to checkout..." : "Proceed to Checkout"}
        </button>
        <p className="text-xs text-foreground-muted text-center mt-3">
          You can checkout as a guest. Create an account to track your orders.
        </p>
      </div>
    </div>
  );
}
