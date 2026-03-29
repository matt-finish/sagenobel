"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagsInput({ value, onChange, label }: { value: string[]; onChange: (tags: string[]) => void; label: string }) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-border bg-white min-h-[42px] focus-within:border-sage focus-within:ring-1 focus-within:ring-sage">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-sage/10 text-sage text-xs font-medium px-2.5 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-sage-dark">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={value.length === 0 ? "Type a tag and press Enter..." : ""}
          className="flex-1 min-w-[120px] outline-none text-sm text-foreground placeholder:text-foreground-muted/50 bg-transparent"
        />
      </div>
      <p className="text-[11px] text-foreground-muted mt-1">Press Enter or comma to add a tag</p>
    </div>
  );
}
