"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 20
      : 250;
    scrollRef.current.scrollBy({ left: cardWidth * 2 * direction, behavior: "smooth" });
  }

  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md text-foreground-muted hover:text-foreground opacity-0 group-hover/scroll:opacity-100 transition-opacity -translate-x-1/2"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/90 border border-border shadow-md text-foreground-muted hover:text-foreground opacity-0 group-hover/scroll:opacity-100 transition-opacity translate-x-1/2"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
