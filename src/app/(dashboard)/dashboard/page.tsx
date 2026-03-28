import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
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

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard name={profile?.full_name} />;
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">
        Welcome back
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "—" },
          { label: "Blog Posts", value: "—" },
          { label: "Products", value: "—" },
          { label: "Free Guides", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-background rounded-xl border border-border p-5"
          >
            <p className="text-sm text-foreground-muted">{stat.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Recent Orders
          </h3>
          <p className="text-foreground-muted text-sm">
            No orders yet. Orders will appear here once customers start
            purchasing.
          </p>
        </div>
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {[
              { label: "Create Blog Post", href: "/dashboard/blog-manager/new" },
              { label: "Add Product", href: "/dashboard/product-manager/new" },
              { label: "Create Guide", href: "/dashboard/guide-manager/new" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="block px-4 py-2.5 bg-sage/5 hover:bg-sage/10 text-sage rounded-lg text-sm font-medium transition-colors"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ name }: { name?: string | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">
        Welcome{name ? `, ${name}` : ""}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Your Orders
          </h3>
          <p className="text-foreground-muted text-sm">
            You haven&apos;t placed any orders yet.
          </p>
          <a
            href="/products"
            className="inline-block mt-4 text-sage hover:text-sage-dark text-sm font-medium transition-colors"
          >
            Browse Products &rarr;
          </a>
        </div>
        <div className="bg-background rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Account Details
          </h3>
          <p className="text-sm text-foreground-muted">
            Manage your account information and preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
