import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Papa from "papaparse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean);

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let query = supabase
    .from("orders")
    .select("order_number, full_name, email, address_line1, address_line2, city, state, zip_code, status, total_cents, tracking_number, tracking_carrier, created_at")
    .order("created_at", { ascending: false });

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format for Pirate Ship compatibility
  const csvData = (orders || []).map((order) => ({
    "Order Number": order.order_number,
    "Name": order.full_name,
    "Email": order.email,
    "Address Line 1": order.address_line1,
    "Address Line 2": order.address_line2 || "",
    "City": order.city,
    "State": order.state,
    "Zip Code": order.zip_code,
    "Status": order.status,
    "Total": `$${(order.total_cents / 100).toFixed(2)}`,
    "Tracking Number": order.tracking_number || "",
    "Carrier": order.tracking_carrier || "",
    "Date": new Date(order.created_at).toLocaleDateString(),
  }));

  const csv = Papa.unparse(csvData);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
