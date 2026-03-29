"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useRouter } from "next/navigation";

interface NavbarProps {
  sections?: {
    blog: boolean;
    projects: boolean;
    products: boolean;
    guides: boolean;
  };
}

export function Navbar({ sections }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const router = useRouter();

  const s = sections || { blog: true, projects: true, products: true, guides: true };

  const navLinks = [
    ...(s.blog ? [{ href: "/blog", label: "Blog" }] : []),
    ...(s.projects ? [{ href: "/projects", label: "Projects" }] : []),
    ...(s.products ? [{ href: "/products", label: "Shop" }] : []),
    ...(s.guides ? [{ href: "/guides", label: "Guides" }] : []),
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <Link href="/" className="font-serif text-2xl font-medium tracking-tight text-foreground hover:text-sage transition-colors duration-300">
            Sage Nobel
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300 link-underline">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {s.products && (
              <Link href="/cart" className="relative p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300" aria-label="Shopping cart">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-sage text-white text-[9px] font-bold flex items-center justify-center rounded-full min-w-[16px] min-h-[16px]">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            <Link href="/login" className="p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300" aria-label="Account">
              <User size={20} />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border bg-background animate-fade-in">
          <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                autoFocus
                className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <nav className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-foreground hover:text-sage rounded-lg transition-colors duration-300 font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-3" />
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-foreground hover:text-sage rounded-lg transition-colors duration-300 font-medium">
                Sign In
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
