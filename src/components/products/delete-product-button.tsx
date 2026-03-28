"use client";

import { deleteProduct } from "@/lib/actions/products";
import { useState } from "react";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <button
          onClick={async () => {
            await deleteProduct(id);
          }}
          className="text-error hover:text-error/80 font-medium"
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-foreground-muted hover:text-foreground font-medium"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-error/70 hover:text-error font-medium"
      title={`Delete "${name}"`}
    >
      Delete
    </button>
  );
}
