"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendShippingNotification } from "@/lib/resend";
import { generateTrackingUrl } from "@/lib/utils";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function addTracking(
  orderId: string,
  trackingNumber: string,
  carrier: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const trackingUrl = generateTrackingUrl(carrier, trackingNumber);

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      tracking_carrier: carrier,
      tracking_url: trackingUrl,
      status: "fulfilled",
    })
    .eq("id", orderId)
    .select("email, order_number")
    .single();

  if (error) return { error: error.message };

  // Send shipping notification email
  try {
    await sendShippingNotification(
      order.email,
      order.order_number,
      trackingNumber,
      trackingUrl,
      carrier
    );
  } catch (emailErr) {
    console.error("Failed to send shipping notification:", emailErr);
  }

  revalidatePath("/dashboard/orders");
  return { success: true };
}
