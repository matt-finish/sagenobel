"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Package,
  BookOpen,
  Layers,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
];

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/blog-manager", label: "Blog Manager", icon: FileText },
  {
    href: "/dashboard/product-manager",
    label: "Product Manager",
    icon: Package,
  },
  { href: "/dashboard/guide-manager", label: "Guide Manager", icon: BookOpen },
  { href: "/dashboard/project-manager", label: "Project Manager", icon: Layers },
  { href: "/dashboard/media", label: "Media Library", icon: ImageIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground hover:text-sage transition-colors"
        >
          Sage Nobel
        </Link>
        {isAdmin && (
          <span className="ml-2 text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sage/10 text-sage"
                  : "text-foreground-muted hover:bg-sage/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:bg-sage/5 hover:text-sage transition-colors w-full"
        >
          <ExternalLink size={18} />
          View Site
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground-muted hover:bg-error/5 hover:text-error transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
