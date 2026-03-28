"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/products", label: "Products" },
  { href: "/guides", label: "Free Guides" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground hover:text-sage transition-colors"
          >
            Sage Nobel
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground-muted hover:text-sage transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-sage transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sage text-white text-[10px] font-bold flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="p-2 text-foreground hover:text-sage transition-colors"
              aria-label="Account"
            >
              <User size={22} />
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-foreground hover:text-sage transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-foreground hover:bg-sage/10 hover:text-sage rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-foreground hover:bg-sage/10 hover:text-sage rounded-lg transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
