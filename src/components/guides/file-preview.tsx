"use client";

import { useState } from "react";
import { Eye, Download, X } from "lucide-react";

interface FileItem {
  url: string;
  name: string;
}

export function GuideFileList({ files }: { files: FileItem[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

  return (
    <>
      <div className="space-y-2">
        {files.map((file, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-sage/10 px-4 py-3">
            <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
            <div className="flex gap-1.5 flex-shrink-0">
              {isPdf(file.name) && (
                <button
                  onClick={() => setPreviewUrl(file.url)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground hover:border-sage transition-colors"
                >
                  <Eye size={13} />
                  Preview
                </button>
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark transition-colors"
              >
                <Download size={13} />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-background rounded-2xl overflow-hidden w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium text-foreground">Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark transition-colors"
                >
                  <Download size={13} />
                  Download
                </a>
                <button onClick={() => setPreviewUrl(null)} className="p-1.5 text-foreground-muted hover:text-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 w-full"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </>
  );
}
