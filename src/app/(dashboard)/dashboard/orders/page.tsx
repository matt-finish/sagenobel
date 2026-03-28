import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminOrders } from "@/components/orders/admin-orders";
import { UserOrders } from "@/components/orders/user-orders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;

  if (isAdmin) {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    return <AdminOrders orders={orders || []} />;
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <UserOrders orders={orders || []} />;
}
