"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Plus, Trash2 } from "lucide-react";

interface CustomField {
  id: string;
  label: string;
  type: "dropdown" | "text";
  required: boolean;
  options: string[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  images: string[];
  custom_fields: CustomField[];
  is_active: boolean;
}

export function ProductEditorForm({ product }: { product?: Product }) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    product?.custom_fields || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addImage() {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  function addCustomField() {
    setCustomFields([
      ...customFields,
      {
        id: crypto.randomUUID(),
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  }

  function updateField(index: number, updates: Partial<CustomField>) {
    const updated = [...customFields];
    updated[index] = { ...updated[index], ...updates };
    setCustomFields(updated);
  }

  function removeField(index: number) {
    setCustomFields(customFields.filter((_, i) => i !== index));
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    formData.set("images", JSON.stringify(images));
    formData.set("custom_fields", JSON.stringify(customFields));

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product?.name}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            placeholder="Product name"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
            Price ($)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description || ""}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
          placeholder="Product description..."
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Images
        </label>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 rounded-lg border border-border bg-background-alt px-3 py-2 text-sm text-foreground-muted"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="p-2 text-error/70 hover:text-error"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Image URL..."
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded-lg bg-sage/10 px-3 py-2 text-sage text-sm font-medium hover:bg-sage/20 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Custom Fields
          </label>
          <button
            type="button"
            onClick={addCustomField}
            className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium"
          >
            <Plus size={14} />
            Add Field
          </button>
        </div>
        {customFields.length === 0 && (
          <p className="text-sm text-foreground-muted">
            No custom fields. Add fields like &quot;Size&quot;, &quot;Color&quot;, etc.
          </p>
        )}
        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div
              key={field.id}
              className="border border-border rounded-lg p-4 bg-background-alt/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Field label"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(i, { type: e.target.value as "dropdown" | "text" })
                    }
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  >
                    <option value="text">Text Input</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(i, { required: e.target.checked })
                      }
                      className="rounded border-border text-sage focus:ring-sage"
                    />
                    <span className="text-sm text-foreground">Required</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="p-1.5 text-error/70 hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {field.type === "dropdown" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={field.options.join(", ")}
                    onChange={(e) =>
                      updateField(i, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Options (comma separated): Small, Medium, Large"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="is_active"
          value="true"
          defaultChecked={product?.is_active ?? true}
          className="rounded border-border text-sage focus:ring-sage"
        />
        <span className="text-sm text-foreground">Active (visible to customers)</span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <a
          href="/dashboard/product-manager"
          className="rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
