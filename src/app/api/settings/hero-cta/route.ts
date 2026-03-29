import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { primary, secondary } = await request.json();

  await supabase.from("site_settings").upsert({ key: "hero_cta", value: primary });
  await supabase.from("site_settings").upsert({ key: "hero_cta_secondary", value: secondary });

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
