import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="text-lg font-medium text-foreground">
            {isAdmin ? "Admin Dashboard" : "My Account"}
          </h1>
          <span className="text-sm text-foreground-muted">
            {profile?.full_name || user.email}
          </span>
        </header>
        <main className="flex-1 p-6 bg-background-alt/50">{children}</main>
      </div>
    </div>
  );
}
