"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}

export function ImageUpload({ bucket, value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    onChange(data.publicUrl);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {value ? (
        <div className="relative inline-block group">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-border">
            <Image src={value} alt={label} fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-foreground-muted hover:border-sage hover:text-sage transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Image
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
