import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      customFieldValues: z.record(z.string(), z.string()),
    })
  ),
});

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = checkoutSchema.parse(body);

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Re-fetch products with custom_fields for pricing validation
    const productIds = items.map((item) => item.productId);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price_cents, custom_fields, is_active")
      .in("id", productIds);

    if (error || !products) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product no longer available: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Resolve the correct price for each item (base price or pricing dropdown)
    function resolvePrice(
      product: { price_cents: number; custom_fields: unknown },
      customFieldValues: Record<string, string>
    ): number {
      const fields = (product.custom_fields || []) as CustomField[];

      for (const field of fields) {
        if (field.type === "pricing_dropdown" && customFieldValues[field.label]) {
          const selectedOption = (field.pricing_options || []).find(
            (opt) => opt.label === customFieldValues[field.label]
          );
          if (selectedOption) {
            return selectedOption.price_cents;
          }
        }
      }

      return product.price_cents;
    }

    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const priceCents = resolvePrice(product, item.customFieldValues);

      // Build description from custom field selections
      const selections = Object.entries(item.customFieldValues)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(selections ? { description: selections } : {}),
          },
          unit_amount: priceCents,
        },
        quantity: item.quantity,
      };
    });

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      customer_email: user?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        user_id: user?.id || "",
        items: JSON.stringify(
          items.map((item) => {
            const product = productMap.get(item.productId)!;
            const priceCents = resolvePrice(product, item.customFieldValues);
            return {
              productId: item.productId,
              productName: product.name,
              priceCents,
              quantity: item.quantity,
              customFieldValues: item.customFieldValues,
            };
          })
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
