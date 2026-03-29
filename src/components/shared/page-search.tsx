"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function PageSearch({ basePath, placeholder }: { basePath: string; placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
      />
    </form>
  );
}
