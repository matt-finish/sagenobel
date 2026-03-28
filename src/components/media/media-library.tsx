"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Loader2, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface BucketInfo {
  name: string;
  label: string;
}

interface MediaFile {
  name: string;
  url: string;
}

export function MediaLibrary({
  buckets,
  bucketFiles,
}: {
  buckets: BucketInfo[];
  bucketFiles: Record<string, MediaFile[]>;
}) {
  const [activeBucket, setActiveBucket] = useState(buckets[0].name);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const files = bucketFiles[activeBucket] || [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(fileList)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      await supabase.storage.from(activeBucket).upload(fileName, file);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(filePath: string) {
    if (!confirm(`Delete ${filePath}?`)) return;

    const supabase = createClient();
    await supabase.storage.from(activeBucket).remove([filePath]);
    router.refresh();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Media Library</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-sage px-4 py-2.5 text-white text-sm font-medium hover:bg-sage-dark transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bucket tabs */}
      <div className="flex gap-2 flex-wrap">
        {buckets.map((bucket) => (
          <button
            key={bucket.name}
            onClick={() => setActiveBucket(bucket.name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeBucket === bucket.name
                ? "bg-sage text-white"
                : "bg-background border border-border text-foreground-muted hover:text-foreground"
            }`}
          >
            {bucket.label}
            {bucketFiles[bucket.name]?.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({bucketFiles[bucket.name].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Files grid */}
      {files.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted">No files in this bucket yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="group relative bg-background rounded-lg border border-border overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground-muted truncate" title={file.name}>
                  {file.name}
                </p>
              </div>
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="p-1 bg-black/60 rounded text-white"
                  title="Copy URL"
                >
                  {copied === file.url ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="p-1 bg-black/60 rounded text-white"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
