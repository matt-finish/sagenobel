"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -ml-2 text-foreground hover:text-sage transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-tight text-foreground hover:text-sage transition-colors"
          >
            Sage Nobel
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-sage transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sage text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] min-h-[18px]">
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
          </div>
        </div>
      </div>

      {/* Hamburger menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Hamburger menu panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-background z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold text-foreground">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-foreground hover:text-sage transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: "/", label: "Home" },
            { href: "/blog", label: "Blog" },
            { href: "/products", label: "Products" },
            { href: "/guides", label: "Free Guides" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-foreground hover:bg-sage/10 hover:text-sage rounded-lg transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border my-4" />
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2.5 text-foreground hover:bg-sage/10 hover:text-sage rounded-lg transition-colors font-medium"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
