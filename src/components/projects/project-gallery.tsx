"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageValue {
  url: string;
  focalX?: number;
  focalY?: number;
}

function getUrl(img: string | ImageValue): string {
  return typeof img === "string" ? img : img.url;
}

function getFocal(img: string | ImageValue): { x: number; y: number } {
  if (typeof img === "string") return { x: 50, y: 50 };
  return { x: img.focalX ?? 50, y: img.focalY ?? 50 };
}

export function ProjectGallery({ images }: { images: (string | ImageValue)[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => {
          const url = getUrl(img);
          const focal = getFocal(img);
          return (
            <button key={i} onClick={() => setLightboxIndex(i)}
              className="relative aspect-square rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity cursor-pointer">
              <Image src={url} alt={`Gallery image ${i + 1}`} fill className="object-cover"
                style={{ objectPosition: `${focal.x}% ${focal.y}%` }} />
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={28} /></button>

          {lightboxIndex > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 text-white/80 hover:text-white"><ChevronLeft size={32} /></button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 text-white/80 hover:text-white"><ChevronRight size={32} /></button>
          )}

          <div className="relative max-w-4xl max-h-[80vh] w-full h-full m-8" onClick={e => e.stopPropagation()}>
            <Image src={getUrl(images[lightboxIndex])} alt={`Gallery image ${lightboxIndex + 1}`} fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
