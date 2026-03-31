"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileDown, Trash2, Loader2 } from "lucide-react";

interface FileItem {
  url: string;
  name: string;
}

interface MultiFileUploadProps {
  bucket: string;
  value: FileItem[];
  onChange: (files: FileItem[]) => void;
  label: string;
  accept?: string;
}

export function MultiFileUpload({ bucket, value, onChange, label, accept }: MultiFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const newFiles: FileItem[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage.from(bucket).upload(fileName, file);

      if (error) {
        alert(`Upload failed for ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      newFiles.push({ url: data.publicUrl, name: file.name });
    }

    onChange([...value, ...newFiles]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {value.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {value.map((file, i) => (
            <div key={i} className="flex items-center gap-3 bg-background-alt rounded-lg px-4 py-2.5">
              <FileDown size={16} className="text-sage flex-shrink-0" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sage hover:text-sage-dark truncate flex-1"
              >
                {file.name}
              </a>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="p-1 text-error/70 hover:text-error flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
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
            Upload Files
          </>
        )}
      </button>
    </div>
  );
}
