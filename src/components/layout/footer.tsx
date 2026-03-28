import Link from "next/link";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function Footer() {
  return (
    <footer className="bg-foreground text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <h3 className="font-serif text-2xl font-medium text-white mb-4">
              Sage Nobel
            </h3>
            <p className="text-sm leading-relaxed text-white/50">
              Curating experiences and environments for intentional living.
              Travel, hosting, home decor, and everyday inspiration.
            </p>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/blog", label: "Blog" },
                { href: "/projects", label: "Projects" },
                { href: "/products", label: "Shop" },
                { href: "/guides", label: "Guides" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-4">
              Account
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/signup", label: "Create Account" },
                { href: "/dashboard", label: "My Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em] mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-white/50 mb-4">
              Tips, guides, and new drops in your inbox.
            </p>
            <NewsletterForm variant="compact" />
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Sage Nobel. All rights reserved.
          </p>
          <p className="text-xs text-white/30 italic">
            Curated with intention
          </p>
        </div>
      </div>
    </footer>
  );
}
