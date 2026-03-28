"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Upload, Loader2, Check } from "lucide-react";

export function ProjectReviewForm({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const supabase = createClient();
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `reviews/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
        setImages(prev => [...prev, data.publicUrl]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("project_reviews").insert({
      project_id: projectId,
      reviewer_name: name,
      reviewer_email: email,
      rating,
      comment: comment || null,
      images,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-success">
        <Check size={18} />
        <p className="text-sm font-medium">Thank you! Your review will appear after approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" placeholder="your@email.com" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star size={24} className={n <= rating ? "text-accent fill-accent" : "text-border"} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Comment</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none"
          placeholder="Share your experience..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Photos (optional)</label>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-foreground-muted hover:border-sage hover:text-sage transition-colors disabled:opacity-50">
          {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading...</> : <><Upload size={14} />Upload Photos</>}
        </button>
        {images.length > 0 && <p className="text-xs text-foreground-muted mt-1">{images.length} photo(s) attached</p>}
      </div>

      <button type="submit" disabled={submitting}
        className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50">
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
