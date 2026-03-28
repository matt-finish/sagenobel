"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/products", label: "Shop" },
  { href: "/guides", label: "Guides" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-medium tracking-tight text-foreground hover:text-sage transition-colors duration-300"
          >
            Sage Nobel
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-300 link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-sage text-white text-[9px] font-bold flex items-center justify-center rounded-full min-w-[16px] min-h-[16px]">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="p-2.5 text-foreground-muted hover:text-foreground transition-colors duration-300"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50 md:hidden animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-foreground hover:text-sage rounded-lg transition-colors duration-300 font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-3" />
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-foreground hover:text-sage rounded-lg transition-colors duration-300 font-medium"
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
