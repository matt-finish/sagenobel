"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export function NewsletterForm({ variant = "default" }: { variant?: "default" | "inline" | "compact" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 ${variant === "compact" ? "" : "justify-center"}`}>
        <Check size={18} className="text-success" />
        <p className="text-sm text-success font-medium">
          You&apos;re subscribed! Check your inbox.
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-sage px-5 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-xs text-error mt-1.5">{errorMsg}</p>
        )}
      </form>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Your email"
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-sage p-2 text-white hover:bg-sage-dark transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    );
  }

  // Default — larger centered variant for homepage
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
          className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-sage px-6 py-3 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-error mt-2 text-center">{errorMsg}</p>
      )}
    </form>
  );
}
