"use client";

import { useState, useRef } from "react";
import { createProject, updateProject } from "@/lib/actions/projects";
import { ImageUpload } from "@/components/shared/image-upload";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Upload, Loader2, GripVertical, Crosshair } from "lucide-react";
import Image from "next/image";
import { FocalPointPicker } from "@/components/shared/focal-point-picker";
import { TagsInput } from "@/components/shared/tags-input";
import { MultiFileUpload } from "@/components/shared/multi-file-upload";

interface ImageValue { url: string; focalX?: number; focalY?: number }
interface FileItem { url: string; name: string }
interface ProductLink { label: string; url: string }
interface FormField { id: string; label: string; type: string; required: boolean; options: string[] }

interface Project {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_focal: { focalX: number; focalY: number } | null;
  gallery_images: (string | ImageValue)[];
  video_urls: string[];
  product_links: ProductLink[];
  guide_ids: string[];
  show_gallery: boolean;
  show_videos: boolean;
  show_guides: boolean;
  show_products: boolean;
  show_order_form: boolean;
  show_reviews: boolean;
  order_form_fields: FormField[];
  order_form_instructions: string | null;
  linked_product_ids: string[];
  files: FileItem[];
  thumbnail_url: string | null;
  thumbnail_focal: { focalX: number; focalY: number } | null;
  is_published: boolean;
  is_promoted: boolean;
  tags: string[];
}

interface Guide {
  id: string;
  title: string;
}

interface SiteProduct {
  id: string;
  name: string;
}

function normalizeGallery(images: (string | ImageValue)[]): ImageValue[] {
  return images.map((img) =>
    typeof img === "string" ? { url: img, focalX: 50, focalY: 50 } : { url: img.url, focalX: img.focalX ?? 50, focalY: img.focalY ?? 50 }
  );
}

export function ProjectEditorForm({ project, guides, siteProducts }: { project?: Project; guides: Guide[]; siteProducts: SiteProduct[] }) {
  const [coverImage, setCoverImage] = useState<ImageValue | null>(
    project?.cover_image_url
      ? { url: project.cover_image_url, focalX: project?.cover_image_focal?.focalX ?? 50, focalY: project?.cover_image_focal?.focalY ?? 50 }
      : null
  );
  const [thumbnail, setThumbnail] = useState<ImageValue | null>(
    project?.thumbnail_url
      ? { url: project.thumbnail_url, focalX: project?.thumbnail_focal?.focalX ?? 50, focalY: project?.thumbnail_focal?.focalY ?? 50 }
      : null
  );
  const [galleryImages, setGalleryImages] = useState<ImageValue[]>(normalizeGallery(project?.gallery_images || []));
  const [editingGalleryFocal, setEditingGalleryFocal] = useState<number | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>(project?.video_urls || []);
  const [productLinks, setProductLinks] = useState<ProductLink[]>(project?.product_links || []);
  const [selectedGuides, setSelectedGuides] = useState<string[]>(project?.guide_ids || []);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(project?.linked_product_ids || []);
  const [projectFiles, setProjectFiles] = useState<FileItem[]>(project?.files || []);
  const [orderFormFields, setOrderFormFields] = useState<FormField[]>(project?.order_form_fields || []);

  const [showGallery, setShowGallery] = useState(project?.show_gallery ?? true);
  const [showVideos, setShowVideos] = useState(project?.show_videos ?? true);
  const [showGuides, setShowGuides] = useState(project?.show_guides ?? true);
  const [showProducts, setShowProducts] = useState(project?.show_products ?? true);
  const [showOrderForm, setShowOrderForm] = useState(project?.show_order_form ?? false);
  const [showReviews, setShowReviews] = useState(project?.show_reviews ?? true);

  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const supabase = createClient();
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `projects/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
        setGalleryImages(prev => [...prev, { url: data.publicUrl, focalX: 50, focalY: 50 }]);
      }
    }
    setUploading(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      cover_image_url: coverImage?.url || null,
      cover_image_focal: coverImage ? { focalX: coverImage.focalX ?? 50, focalY: coverImage.focalY ?? 50 } : null,
      thumbnail_url: thumbnail?.url || null,
      thumbnail_focal: thumbnail ? { focalX: thumbnail.focalX ?? 50, focalY: thumbnail.focalY ?? 50 } : null,
      gallery_images: galleryImages,
      video_urls: videoUrls,
      product_links: productLinks,
      guide_ids: selectedGuides,
      linked_product_ids: linkedProductIds,
      files: projectFiles,
      show_gallery: showGallery,
      show_videos: showVideos,
      show_guides: showGuides,
      show_products: showProducts,
      show_order_form: showOrderForm,
      show_reviews: showReviews,
      order_form_fields: orderFormFields,
      order_form_instructions: formData.get("order_form_instructions") as string,
      tags,
      is_published: formData.get("is_published") === "true",
      is_promoted: formData.get("is_promoted") === "true",
    };

    const result = project
      ? await updateProject(project.id, payload)
      : await createProject(payload);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  function SectionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded border-border text-sage focus:ring-sage" />
        <span className="text-sm text-foreground">{label}</span>
      </label>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Basic Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Basic Info</h3>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
          <input id="title" name="title" type="text" required defaultValue={project?.title}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            placeholder="Project title" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={project?.description || ""}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
            placeholder="Project description..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload bucket="site-assets" value={thumbnail} onChange={setThumbnail} label="Thumbnail Image (gallery card)" />
          <ImageUpload bucket="site-assets" value={coverImage} onChange={setCoverImage} label="Banner Image (project page header)" />
        </div>
      </section>

      {/* Section Visibility */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Visible Sections</h3>
        <p className="text-sm text-foreground-muted">Toggle which sections appear on this project page.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SectionToggle label="Image Gallery" checked={showGallery} onChange={setShowGallery} />
          <SectionToggle label="Videos" checked={showVideos} onChange={setShowVideos} />
          <SectionToggle label="Free Guides" checked={showGuides} onChange={setShowGuides} />
          <SectionToggle label="Product Links" checked={showProducts} onChange={setShowProducts} />
          <SectionToggle label="Order Form" checked={showOrderForm} onChange={setShowOrderForm} />
          <SectionToggle label="Reviews" checked={showReviews} onChange={setShowReviews} />
        </div>
      </section>

      {/* Gallery */}
      {showGallery && (
        <section className="space-y-3">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Image Gallery</h3>
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                  <Image src={img.url} alt={`Gallery ${i + 1}`} fill className="object-cover"
                    style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }} />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => setEditingGalleryFocal(editingGalleryFocal === i ? null : i)}
                      className="p-1 bg-black/60 rounded-full text-white" title="Set focal point">
                      <Crosshair size={12} />
                    </button>
                    <button type="button" onClick={() => { setGalleryImages(galleryImages.filter((_, j) => j !== i)); if (editingGalleryFocal === i) setEditingGalleryFocal(null); }}
                      className="p-1 bg-black/60 rounded-full text-white">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {editingGalleryFocal !== null && galleryImages[editingGalleryFocal] && (
            <div className="border border-sage/30 rounded-xl p-4 bg-sage/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Set Focal Point — Image {editingGalleryFocal + 1}</p>
                <button type="button" onClick={() => setEditingGalleryFocal(null)} className="text-xs text-foreground-muted hover:text-foreground">Done</button>
              </div>
              <FocalPointPicker
                src={galleryImages[editingGalleryFocal].url}
                focalX={galleryImages[editingGalleryFocal].focalX ?? 50}
                focalY={galleryImages[editingGalleryFocal].focalY ?? 50}
                onChange={(x, y) => {
                  const updated = [...galleryImages];
                  updated[editingGalleryFocal] = { ...updated[editingGalleryFocal], focalX: x, focalY: y };
                  setGalleryImages(updated);
                }}
              />
            </div>
          )}
          <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
          <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-foreground-muted hover:border-sage hover:text-sage transition-colors disabled:opacity-50">
            {uploading ? <><Loader2 size={16} className="animate-spin" />Uploading...</> : <><Upload size={16} />Upload Images</>}
          </button>
        </section>
      )}

      {/* Videos */}
      {showVideos && (
        <section className="space-y-3">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Videos</h3>
          <p className="text-xs text-foreground-muted">Paste YouTube or Vimeo URLs.</p>
          {videoUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={url} readOnly className="flex-1 rounded-lg border border-border bg-background-alt px-3 py-2 text-sm text-foreground-muted" />
              <button type="button" onClick={() => setVideoUrls(videoUrls.filter((_, j) => j !== i))} className="p-2 text-error/70 hover:text-error"><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="url" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
            <button type="button" onClick={() => { if (newVideoUrl.trim()) { setVideoUrls([...videoUrls, newVideoUrl.trim()]); setNewVideoUrl(""); } }}
              className="rounded-lg bg-sage/10 px-3 py-2 text-sage text-sm font-medium hover:bg-sage/20 transition-colors">Add</button>
          </div>
        </section>
      )}

      {/* Guides */}
      {showGuides && (
        <section className="space-y-3">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Linked Guides</h3>
          {guides.length === 0 ? (
            <p className="text-sm text-foreground-muted">No published guides available.</p>
          ) : (
            <div className="space-y-1">
              {guides.map(g => (
                <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedGuides.includes(g.id)}
                    onChange={e => setSelectedGuides(e.target.checked ? [...selectedGuides, g.id] : selectedGuides.filter(id => id !== g.id))}
                    className="rounded border-border text-sage focus:ring-sage" />
                  <span className="text-sm text-foreground">{g.title}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Product Links */}
      {showProducts && (
        <section className="space-y-3">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Product Links</h3>
          <p className="text-xs text-foreground-muted">Link to Amazon Storefront, Etsy, or any external product.</p>
          {productLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={link.label} onChange={e => { const u = [...productLinks]; u[i] = { ...u[i], label: e.target.value }; setProductLinks(u); }}
                placeholder="Label" className="w-1/3 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
              <input type="url" value={link.url} onChange={e => { const u = [...productLinks]; u[i] = { ...u[i], url: e.target.value }; setProductLinks(u); }}
                placeholder="https://..." className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
              <button type="button" onClick={() => setProductLinks(productLinks.filter((_, j) => j !== i))} className="p-2 text-error/70 hover:text-error"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setProductLinks([...productLinks, { label: "", url: "" }])}
            className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium"><Plus size={14} />Add Link</button>
        </section>
      )}

      {/* Downloadable Files */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Downloadable Files</h3>
        <p className="text-xs text-foreground-muted">Upload PDFs, templates, or other files visitors can download from this project page.</p>
        <MultiFileUpload
          bucket="guide-files"
          value={projectFiles}
          onChange={setProjectFiles}
          label="Project Files"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
        />
      </section>

      {/* Linked Site Products */}
      <section className="space-y-3">
        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Products Used in This Project</h3>
        <p className="text-xs text-foreground-muted">Select products from your shop to feature at the bottom of this project page.</p>
        {linkedProductIds.length > 0 && (
          <div className="space-y-2">
            {linkedProductIds.map((id) => {
              const prod = siteProducts.find((p) => p.id === id);
              if (!prod) return null;
              return (
                <div key={id} className="flex items-center justify-between px-3 py-2 bg-background-alt rounded-lg">
                  <span className="text-sm text-foreground">{prod.name}</span>
                  <button type="button" onClick={() => setLinkedProductIds(linkedProductIds.filter((pid) => pid !== id))}
                    className="text-xs text-error/70 hover:text-error font-medium">Remove</button>
                </div>
              );
            })}
          </div>
        )}
        {siteProducts.filter((p) => !linkedProductIds.includes(p.id)).length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setLinkedProductIds([...linkedProductIds, e.target.value]);
                e.target.value = "";
              }
            }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          >
            <option value="">Add a product...</option>
            {siteProducts
              .filter((p) => !linkedProductIds.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        )}
      </section>

      {/* Order Form */}
      {showOrderForm && (
        <section className="space-y-3">
          <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Order Form</h3>
          <div>
            <label htmlFor="order_form_instructions" className="block text-sm font-medium text-foreground mb-1">Instructions</label>
            <textarea id="order_form_instructions" name="order_form_instructions" rows={2} defaultValue={project?.order_form_instructions || ""}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
              placeholder="Instructions for customers filling out this form..." />
          </div>
          {orderFormFields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2 border border-border rounded-lg p-3 bg-background-alt/50">
              <GripVertical size={14} className="text-foreground-muted mt-2 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" value={field.label} onChange={e => { const u = [...orderFormFields]; u[i] = { ...u[i], label: e.target.value }; setOrderFormFields(u); }}
                  placeholder="Field label" className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
                <select value={field.type} onChange={e => { const u = [...orderFormFields]; u[i] = { ...u[i], type: e.target.value }; setOrderFormFields(u); }}
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage">
                  <option value="text">Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={field.required} onChange={e => { const u = [...orderFormFields]; u[i] = { ...u[i], required: e.target.checked }; setOrderFormFields(u); }}
                    className="rounded border-border text-sage focus:ring-sage" />
                  <span className="text-sm">Required</span>
                </label>
              </div>
              <button type="button" onClick={() => setOrderFormFields(orderFormFields.filter((_, j) => j !== i))} className="p-1.5 text-error/70 hover:text-error"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setOrderFormFields([...orderFormFields, { id: crypto.randomUUID(), label: "", type: "text", required: false, options: [] }])}
            className="inline-flex items-center gap-1 text-xs text-sage hover:text-sage-dark font-medium"><Plus size={14} />Add Field</button>
        </section>
      )}

      <TagsInput value={tags} onChange={setTags} label="Tags" />

      {/* Publish */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_published" value="true" defaultChecked={project?.is_published} className="rounded border-border text-sage focus:ring-sage" />
          <span className="text-sm text-foreground">Published</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_promoted" value="true" defaultChecked={project?.is_promoted} className="rounded border-border text-accent focus:ring-accent" />
          <span className="text-sm text-foreground">Promoted on Homepage</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50">
          {saving ? "Saving..." : project ? "Update Project" : "Create Project"}
        </button>
        <a href="/dashboard/project-manager" className="rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors">Cancel</a>
      </div>
    </form>
  );
}
