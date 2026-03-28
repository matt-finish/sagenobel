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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = checkoutSchema.parse(body);

    const supabase = await createClient();

    // Get current user if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Re-fetch prices from database — never trust client
    const productIds = items.map((item) => item.productId);
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price_cents, is_active")
      .in("id", productIds);

    if (error || !products) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Validate all products exist and are active
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

    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price_cents,
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
          items.map((item) => ({
            productId: item.productId,
            productName: productMap.get(item.productId)!.name,
            priceCents: productMap.get(item.productId)!.price_cents,
            quantity: item.quantity,
            customFieldValues: item.customFieldValues,
          }))
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
