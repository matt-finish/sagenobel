"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Loader2, Crosshair } from "lucide-react";
import Image from "next/image";
import { FocalPointPicker } from "@/components/shared/focal-point-picker";

interface ImageUploadValue {
  url: string;
  focalX?: number;
  focalY?: number;
}

interface ImageUploadProps {
  bucket: string;
  value: string | ImageUploadValue | null;
  onChange: (value: ImageUploadValue | null) => void;
  label: string;
}

function normalize(value: string | ImageUploadValue | null): ImageUploadValue | null {
  if (!value) return null;
  if (typeof value === "string") return { url: value, focalX: 50, focalY: 50 };
  return { url: value.url, focalX: value.focalX ?? 50, focalY: value.focalY ?? 50 };
}

export function ImageUpload({ bucket, value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showFocal, setShowFocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalized = normalize(value);

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
    onChange({ url: data.publicUrl, focalX: 50, focalY: 50 });
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {normalized ? (
        <div className="space-y-3">
          <div className="relative inline-block group">
            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-border">
              <Image
                src={normalized.url}
                alt={label}
                fill
                className="object-cover"
                style={{ objectPosition: `${normalized.focalX}% ${normalized.focalY}%` }}
              />
            </div>
            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setShowFocal(!showFocal)}
                className="p-1 bg-black/60 rounded-full text-white"
                title="Set focal point"
              >
                <Crosshair size={14} />
              </button>
              <button
                type="button"
                onClick={() => { onChange(null); setShowFocal(false); }}
                className="p-1 bg-black/60 rounded-full text-white"
                title="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {showFocal && (
            <div className="border border-sage/30 rounded-xl p-4 bg-sage/5 max-w-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Set Focal Point</p>
                <button
                  type="button"
                  onClick={() => setShowFocal(false)}
                  className="text-xs text-foreground-muted hover:text-foreground"
                >
                  Done
                </button>
              </div>
              <FocalPointPicker
                src={normalized.url}
                focalX={normalized.focalX!}
                focalY={normalized.focalY!}
                onChange={(x, y) => onChange({ ...normalized, focalX: x, focalY: y })}
              />
            </div>
          )}
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
