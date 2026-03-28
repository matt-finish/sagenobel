import Link from "next/link";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function Footer() {
  return (
    <footer className="bg-background-alt border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Sage Nobel
            </h3>
            <p className="text-sm text-foreground-muted leading-relaxed">
              Curating experiences and environments for intentional living.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/products", label: "Products" },
                { href: "/guides", label: "Free Guides" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-sage transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Account
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/signup", label: "Create Account" },
                { href: "/dashboard", label: "My Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-sage transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Newsletter
            </h4>
            <p className="text-sm text-foreground-muted mb-3">
              Tips, guides, and new drops in your inbox.
            </p>
            <NewsletterForm variant="compact" />
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-foreground-muted">
            &copy; {new Date().getFullYear()} Sage Nobel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
