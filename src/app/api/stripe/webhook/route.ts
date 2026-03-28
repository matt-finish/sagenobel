import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation } from "@/lib/resend";
import type Stripe from "stripe";

export async function POST(request: Request) {
  // Must use raw body for Stripe signature verification
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      console.error("Error handling checkout:", err);
      return NextResponse.json(
        { error: "Failed to process order" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  const sessionDetails = session as Stripe.Checkout.Session & {
    shipping_details?: { address?: Stripe.Address; name?: string };
  };
  const shipping = sessionDetails.shipping_details?.address;
  const customerName = sessionDetails.shipping_details?.name || session.customer_details?.name || "Customer";
  const email = session.customer_details?.email || session.customer_email || "";
  const userId = session.metadata?.user_id || null;
  const items = JSON.parse(session.metadata?.items || "[]");

  // Create order using service role (bypasses RLS)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId || null,
      email,
      full_name: customerName,
      address_line1: shipping?.line1 || "",
      address_line2: shipping?.line2 || "",
      city: shipping?.city || "",
      state: shipping?.state || "",
      zip_code: shipping?.postal_code || "",
      status: "paid",
      total_cents: session.amount_total || 0,
      stripe_session_id: session.id,
    })
    .select("id, order_number")
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(
    (item: {
      productId: string;
      productName: string;
      priceCents: number;
      quantity: number;
      customFieldValues: Record<string, string>;
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price_cents: item.priceCents,
      quantity: item.quantity,
      custom_field_values: item.customFieldValues,
    })
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Send confirmation email
  try {
    await sendOrderConfirmation(
      email,
      order.order_number,
      items.map(
        (item: { productName: string; quantity: number; priceCents: number }) => ({
          name: item.productName,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })
      ),
      session.amount_total || 0
    );
  } catch (emailErr) {
    console.error("Failed to send confirmation email:", emailErr);
    // Don't throw — order is still created successfully
  }
}
