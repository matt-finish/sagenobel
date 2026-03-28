"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PricingOption {
  label: string;
  price_cents: number;
}

interface CustomField {
  id: string;
  label: string;
  type: "dropdown" | "text" | "pricing_dropdown";
  required: boolean;
  options: string[];
  pricing_options?: PricingOption[];
}

export function AddToCartButton({
  productId,
  productName,
  priceCents,
  image,
  customFields,
}: {
  productId: string;
  productName: string;
  priceCents: number;
  image?: string;
  customFields: CustomField[];
}) {
  const { addItem } = useCart();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate current price based on pricing dropdown selections
  function getCurrentPrice(): number {
    for (const field of customFields) {
      if (field.type === "pricing_dropdown" && fieldValues[field.label]) {
        const selected = field.pricing_options?.find(
          (opt) => opt.label === fieldValues[field.label]
        );
        if (selected) return selected.price_cents;
      }
    }
    return priceCents;
  }

  const currentPrice = getCurrentPrice();

  function handleAdd() {
    const newErrors: Record<string, string> = {};
    for (const field of customFields) {
      if (field.required && !fieldValues[field.label]) {
        newErrors[field.label] = `${field.label} is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    addItem({
      productId,
      productName,
      priceCents: currentPrice,
      quantity: 1,
      image,
      customFieldValues: fieldValues,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6 space-y-4">
      {customFields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {field.label}
            {field.required && <span className="text-error ml-0.5">*</span>}
          </label>

          {field.type === "pricing_dropdown" ? (
            <select
              value={fieldValues[field.label] || ""}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.label]: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              <option value="">Select {field.label}</option>
              {(field.pricing_options || []).map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label} — {formatPrice(opt.price_cents)}
                </option>
              ))}
            </select>
          ) : field.type === "dropdown" ? (
            <select
              value={fieldValues[field.label] || ""}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.label]: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={fieldValues[field.label] || ""}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.label]: e.target.value })
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          )}
          {errors[field.label] && (
            <p className="text-xs text-error mt-1">{errors[field.label]}</p>
          )}
        </div>
      ))}

      {/* Dynamic price display */}
      {customFields.some((f) => f.type === "pricing_dropdown") && (
        <div className="flex items-center justify-between py-3 border-t border-border">
          <span className="text-sm text-foreground-muted">Price</span>
          <span className="text-xl font-semibold text-sage">
            {formatPrice(currentPrice)}
          </span>
        </div>
      )}

      <button
        onClick={handleAdd}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
          added
            ? "bg-success text-white"
            : "bg-sage text-white hover:bg-sage-dark"
        }`}
      >
        {added ? (
          <>
            <Check size={18} />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            Add to Cart — {formatPrice(currentPrice)}
          </>
        )}
      </button>
    </div>
  );
}
