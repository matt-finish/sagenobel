"use client";

import { useState } from "react";
import { createGuide, updateGuide } from "@/lib/actions/guides";
import { TiptapEditor } from "@/components/blog/tiptap-editor";
import { ImageUpload } from "@/components/shared/image-upload";
import { FileUpload } from "@/components/shared/file-upload";

interface ImageValue {
  url: string;
  focalX?: number;
  focalY?: number;
}

interface Guide {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  cover_image_focal: { focalX: number; focalY: number } | null;
  guide_type: string;
  file_url: string | null;
  content: unknown;
  is_published: boolean;
}

export function GuideEditorForm({ guide }: { guide?: Guide }) {
  const [guideType, setGuideType] = useState(guide?.guide_type || "download");
  const [coverImage, setCoverImage] = useState<ImageValue | null>(
    guide?.cover_image_url
      ? { url: guide.cover_image_url, focalX: guide?.cover_image_focal?.focalX ?? 50, focalY: guide?.cover_image_focal?.focalY ?? 50 }
      : null
  );
  const [fileUrl, setFileUrl] = useState<string | null>(guide?.file_url || null);
  const [content, setContent] = useState(
    guide?.content ? JSON.stringify(guide.content) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    formData.set("guide_type", guideType);
    formData.set("cover_image_url", coverImage?.url || "");
    formData.set("cover_image_focal", coverImage ? JSON.stringify({ focalX: coverImage.focalX, focalY: coverImage.focalY }) : "");
    formData.set("file_url", fileUrl || "");
    if (guideType === "article") {
      formData.set("content", content);
    }

    const result = guide
      ? await updateGuide(guide.id, formData)
      : await createGuide(formData);

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

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
        <input id="title" name="title" type="text" required defaultValue={guide?.title}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          placeholder="Guide title" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea id="description" name="description" rows={2} defaultValue={guide?.description || ""}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
          placeholder="Brief description..." />
      </div>

      <ImageUpload bucket="guide-covers" value={coverImage} onChange={setCoverImage} label="Cover Image" />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Guide Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={guideType === "download"} onChange={() => setGuideType("download")} className="text-sage focus:ring-sage" />
            <span className="text-sm text-foreground">Downloadable File</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={guideType === "article"} onChange={() => setGuideType("article")} className="text-sage focus:ring-sage" />
            <span className="text-sm text-foreground">Written Article</span>
          </label>
        </div>
      </div>

      {guideType === "download" && (
        <FileUpload bucket="guide-files" value={fileUrl} onChange={setFileUrl} label="Downloadable File"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg" />
      )}

      {guideType === "article" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Content</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="is_published" value="true" defaultChecked={guide?.is_published}
          className="rounded border-border text-sage focus:ring-sage" />
        <span className="text-sm text-foreground">Published</span>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50">
          {saving ? "Saving..." : guide ? "Update Guide" : "Create Guide"}
        </button>
        <a href="/dashboard/guide-manager"
          className="rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
