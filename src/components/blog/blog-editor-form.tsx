"use client";

import { useState } from "react";
import { createBlogPost, updateBlogPost } from "@/lib/actions/blog";
import { TiptapEditor } from "./tiptap-editor";
import { ImageUpload } from "@/components/shared/image-upload";

interface BlogPost {
  id: string;
  title: string;
  content: unknown;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export function BlogEditorForm({ post }: { post?: BlogPost }) {
  const [content, setContent] = useState(
    post?.content ? JSON.stringify(post.content) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(post?.cover_image_url || null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);

    formData.set("content", content);
    formData.set("cover_image_url", coverImageUrl || "");

    const result = post
      ? await updateBlogPost(post.id, formData)
      : await createBlogPost(formData);

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

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={post?.title}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          placeholder="Post title"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt || ""}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
          placeholder="Brief description for listings..."
        />
      </div>

      <ImageUpload
        bucket="blog-images"
        value={coverImageUrl}
        onChange={setCoverImageUrl}
        label="Cover Image"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Content
        </label>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            value="true"
            defaultChecked={post?.is_published}
            className="rounded border-border text-sage focus:ring-sage"
          />
          <span className="text-sm text-foreground">Published</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            value="true"
            defaultChecked={post?.is_featured}
            className="rounded border-border text-sage focus:ring-sage"
          />
          <span className="text-sm text-foreground">Featured</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
        </button>
        <a
          href="/dashboard/blog-manager"
          className="rounded-lg border border-border px-6 py-2.5 text-foreground font-medium hover:bg-background-alt transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
