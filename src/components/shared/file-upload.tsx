"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileDown, Trash2, Loader2 } from "lucide-react";

interface FileUploadProps {
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  accept?: string;
}

export function FileUpload({ bucket, value, onChange, label, accept }: FileUploadProps) {
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
        <div className="flex items-center gap-3 bg-background-alt rounded-lg px-4 py-3">
          <FileDown size={18} className="text-sage flex-shrink-0" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sage hover:text-sage-dark truncate flex-1"
          >
            {value.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 text-error/70 hover:text-error flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
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
                Upload File
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
