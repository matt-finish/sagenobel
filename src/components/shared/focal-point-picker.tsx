"use client";

import { useState } from "react";
import Image from "next/image";

interface FocalPointPickerProps {
  src: string;
  focalX: number;
  focalY: number;
  onChange: (x: number, y: number) => void;
}

export function FocalPointPicker({ src, focalX, focalY, onChange }: FocalPointPickerProps) {
  const [dragging, setDragging] = useState(false);

  function handleInteraction(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground-muted">
        Click on the most important part of the image. Thumbnails and crops will center on this point.
      </p>

      {/* Focal point selector */}
      <div
        className="relative cursor-crosshair rounded-lg overflow-hidden border border-border select-none"
        onMouseDown={(e) => { setDragging(true); handleInteraction(e); }}
        onMouseMove={(e) => { if (dragging) handleInteraction(e); }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
      >
        <div className="relative aspect-[16/10]">
          <Image src={src} alt="Set focal point" fill className="object-cover" />
        </div>
        {/* Crosshair */}
        <div
          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-white shadow-md" />
          <div className="absolute inset-[6px] rounded-full bg-sage border border-white" />
        </div>
        {/* Crosshair lines */}
        <div
          className="absolute w-px h-full bg-white/30 pointer-events-none"
          style={{ left: `${focalX}%` }}
        />
        <div
          className="absolute w-full h-px bg-white/30 pointer-events-none"
          style={{ top: `${focalY}%` }}
        />
      </div>

      {/* Crop previews */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5 text-center">Square</p>
          <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
            <Image
              src={src}
              alt="Square preview"
              fill
              className="object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5 text-center">Card (3:4)</p>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border">
            <Image
              src={src}
              alt="Card preview"
              fill
              className="object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-foreground-muted uppercase tracking-wider mb-1.5 text-center">Wide (16:9)</p>
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
            <Image
              src={src}
              alt="Wide preview"
              fill
              className="object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
