import Image from "next/image";

export interface ImageWithFocus {
  url: string;
  focalX?: number;
  focalY?: number;
}

export function FocusImage({
  image,
  alt,
  fill = true,
  className = "object-cover",
  priority,
}: {
  image: ImageWithFocus | string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const src = typeof image === "string" ? image : image.url;
  const focalX = typeof image === "string" ? 50 : (image.focalX ?? 50);
  const focalY = typeof image === "string" ? 50 : (image.focalY ?? 50);

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={{ objectPosition: `${focalX}% ${focalY}%` }}
      priority={priority}
    />
  );
}

/** Helper to extract url string from an ImageWithFocus or string */
export function getImageUrl(image: ImageWithFocus | string): string {
  return typeof image === "string" ? image : image.url;
}
