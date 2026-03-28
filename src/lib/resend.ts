import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  items: { name: string; quantity: number; priceCents: number }[],
  totalCents: number
) {
  const itemList = items
    .map(
      (item) =>
        `${item.name} x${item.quantity} - $${(item.priceCents * item.quantity / 100).toFixed(2)}`
    )
    .join("\n");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
    to: email,
    subject: `Order Confirmed - ${orderNumber}`,
    text: `Thank you for your order!\n\nOrder Number: ${orderNumber}\n\nItems:\n${itemList}\n\nTotal: $${(totalCents / 100).toFixed(2)}\n\nWe'll send you another email when your order ships.\n\n— Sage Nobel`,
  });
}

export async function sendShippingNotification(
  email: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl: string,
  carrier: string
) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
    to: email,
    subject: `Your Order Has Shipped - ${orderNumber}`,
    text: `Great news! Your order ${orderNumber} has shipped.\n\nCarrier: ${carrier}\nTracking Number: ${trackingNumber}\nTrack your package: ${trackingUrl}\n\nThank you for shopping with Sage Nobel!`,
  });
}
