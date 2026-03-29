"use client";

import { useState, useRef } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Plus, Trash2, Upload, Loader2, Crosshair } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { FocalPointPicker } from "@/components/shared/focal-point-picker";
import { TagsInput } from "@/components/shared/tags-input";
import type { ImageWithFocus } from "@/components/shared/focus-image";

interface PricingOption {
  label: string;
  price_cents: number;
}

interface CustomField {
  id: string;
  label: string;
  type: "dropdown" | "text" | "pricing_dropdown";
  required: boolean;
  options: string[];
  pricing_options?: PricingOption[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  images: (string | ImageWithFocus)[];
  custom_fields: CustomField[];
  is_active: boolean;
  product_type: "custom" | "affiliate";
  affiliate_url: string | null;
  tags: string[];
}

function normalizeImages(images: (string | ImageWithFocus)[]): ImageWithFocus[] {
  return images.map((img) =>
    typeof img === "string" ? { url: img, focalX: 50, focalY: 50 } : img
  );
}

export function ProductEditorForm({ product }: { product?: Product }) {
  const [productType, setProductType] = useState<"custom" | "affiliate">(product?.product_type || "custom");
  const [images, setImages] = useState<ImageWithFocus[]>(
    normalizeImages(product?.images || [])
  );
  const [editingFocal, setEditingFocal] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    product?.custom_fields || []
  );
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setImages((prev) => [...prev, { url: data.publicUrl, focalX: 50, focalY: 50 }]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        pricing_options: [],
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

  function addPricingOption(fieldIndex: number) {
    const updated = [...customFields];
    const field = updated[fieldIndex];
    updated[fieldIndex] = {
      ...field,
      pricing_options: [...(field.pricing_options || []), { label: "", price_cents: 0 }],
    };
    setCustomFields(updated);
  }

  function updatePricingOption(fieldIndex: number, optIndex: number, updates: Partial<PricingOption>) {
    const updated = [...customFields];
    const options = [...(updated[fieldIndex].pricing_options || [])];
    options[optIndex] = { ...options[optIndex], ...updates };
    updated[fieldIndex] = { ...updated[fieldIndex], pricing_options: options };
    setCustomFields(updated);
  }

  function removePricingOption(fieldIndex: number, optIndex: number) {
    const updated = [...customFields];
    updated[fieldIndex] = {
      ...updated[fieldIndex],
      pricing_options: (updated[fieldIndex].pricing_options || []).filter((_, i) => i !== optIndex),
    };
    setCustomFields(updated);
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    formData.set("images", JSON.stringify(images));
    formData.set("custom_fields", JSON.stringify(customFields));
    formData.set("product_type", productType);
    formData.set("tags", JSON.stringify(tags));

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
        <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Product Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Product Type</label>
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${productType === "custom" ? "border-sage/30 bg-sage/5" : "border-border"}`}>
            <input type="radio" checked={productType === "custom"} onChange={() => setProductType("custom")} className="text-sage focus:ring-sage" />
            <div>
              <p className="text-sm font-medium text-foreground">Custom Product</p>
              <p className="text-xs text-foreground-muted">Sold through your store via Stripe checkout</p>
            </div>
          </label>
          <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${productType === "affiliate" ? "border-accent/30 bg-accent/5" : "border-border"}`}>
            <input type="radio" checked={productType === "affiliate"} onChange={() => setProductType("affiliate")} className="text-accent focus:ring-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">Affiliate Link</p>
              <p className="text-xs text-foreground-muted">Links to Amazon or external store</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Product Name</label>
          <input id="name" name="name" type="text" required defaultValue={product?.name}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            placeholder="Product name" />
        </div>
        {productType === "custom" ? (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
              Base Price ($)
              {customFields.some(f => f.type === "pricing_dropdown") && (
                <span className="text-foreground-muted font-normal ml-1">(used when no size selected)</span>
              )}
            </label>
            <input id="price" name="price" type="number" step="0.01" min="0" required
              defaultValue={product?.price_cents ? (product.price_cents / 100).toFixed(2) : ""}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="0.00" />
          </div>
        ) : (
          <div>
            <label htmlFor="affiliate_url" className="block text-sm font-medium text-foreground mb-1">Affiliate URL</label>
            <input id="affiliate_url" name="affiliate_url" type="url" required
              defaultValue={product?.affiliate_url || ""}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              placeholder="https://www.amazon.com/..." />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description || ""}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
          placeholder="Product description..." />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Images</label>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                <Image src={img.url} alt={`Product image ${i + 1}`} fill className="object-cover"
                  style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }} />
                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => setEditingFocal(editingFocal === i ? null : i)}
                    className="p-1 bg-black/60 rounded-full text-white" title="Set focal point">
                    <Crosshair size={14} />
                  </button>
                  <button type="button" onClick={() => { setImages(images.filter((_, j) => j !== i)); if (editingFocal === i) setEditingFocal(null); }}
                    className="p-1 bg-black/60 rounded-full text-white">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editingFocal !== null && images[editingFocal] && (
          <div className="border border-sage/30 rounded-xl p-4 bg-sage/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Set Focal Point — Image {editingFocal + 1}</p>
              <button type="button" onClick={() => setEditingFocal(null)} className="text-xs text-foreground-muted hover:text-foreground">Done</button>
            </div>
            <FocalPointPicker
              src={images[editingFocal].url}
              focalX={images[editingFocal].focalX ?? 50}
              focalY={images[editingFocal].focalY ?? 50}
              onChange={(x, y) => {
                const updated = [...images];
                updated[editingFocal] = { ...updated[editingFocal], focalX: x, focalY: y };
                setImages(updated);
              }}
            />
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-foreground-muted hover:border-sage hover:text-sage transition-colors disabled:opacity-50">
          {uploading ? <><Loader2 size={16} className="animate-spin" />Uploading...</> : <><Upload size={16} />Upload Images</>}
        </button>
      </div>

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">Custom Fields</label>
          <button type="button" onClick={addCustomField}
            className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium">
            <Plus size={14} />Add Field
          </button>
        </div>
        {customFields.length === 0 && (
          <p className="text-sm text-foreground-muted">No custom fields. Add fields like &quot;Size&quot;, &quot;Color&quot;, etc.</p>
        )}
        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div key={field.id} className="border border-border rounded-lg p-4 bg-background-alt/50">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Field label (e.g. Size)"
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
                  <select value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as CustomField["type"] })}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage">
                    <option value="text">Text Input</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="pricing_dropdown">Dropdown with Pricing</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={field.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                      className="rounded border-border text-sage focus:ring-sage" />
                    <span className="text-sm text-foreground">Required</span>
                  </label>
                </div>
                <button type="button" onClick={() => removeField(i)} className="p-1.5 text-error/70 hover:text-error">
                  <Trash2 size={14} />
                </button>
              </div>

              {field.type === "dropdown" && (
                <div className="mt-3">
                  <input type="text" value={field.options.join(", ")}
                    onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    placeholder="Options (comma separated): Small, Medium, Large"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
                </div>
              )}

              {field.type === "pricing_dropdown" && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-foreground-muted">Each option has its own price. This overrides the base price when selected.</p>
                  {(field.pricing_options || []).map((opt, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <input type="text" value={opt.label}
                        onChange={(e) => updatePricingOption(i, j, { label: e.target.value })}
                        placeholder='Option label (e.g. 3" x 3")'
                        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-foreground-muted">$</span>
                        <input type="number" step="0.01" min="0"
                          value={opt.price_cents ? (opt.price_cents / 100).toFixed(2) : ""}
                          onChange={(e) => updatePricingOption(i, j, { price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                          placeholder="0.00"
                          className="w-24 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
                      </div>
                      <button type="button" onClick={() => removePricingOption(i, j)} className="p-1 text-error/70 hover:text-error">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addPricingOption(i)}
                    className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium">
                    <Plus size={14} />Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <TagsInput value={tags} onChange={setTags} label="Tags" />

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="is_active" value="true" defaultChecked={product?.is_active ?? true}
          className="rounded border-border text-sage focus:ring-sage" />
        <span className="text-sm text-foreground">Active (visible to customers)</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50">
          {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <a href="/dashboard/product-manager"
          className="rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
