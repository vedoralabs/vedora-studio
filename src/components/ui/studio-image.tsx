import Image from "next/image";
import type { CSSProperties } from "react";

interface StudioImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  objectPosition?: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
  motion?: boolean;
}

export function StudioImage({
  src,
  alt,
  aspectRatio = "4 / 5",
  objectPosition = "center",
  sizes = "(max-width: 800px) 100vw, 60vw",
  preload = false,
  className,
  motion = false,
}: StudioImageProps) {
  const style: CSSProperties & { "--image-position": string } = { aspectRatio, "--image-position": objectPosition };
  return (
    <figure className={className ? `studio-image ${className}` : "studio-image"} data-motion-image={motion ? "" : undefined} style={style}>
      <Image alt={alt} className="studio-image__media" fill loading={preload ? "eager" : "lazy"} preload={preload} sizes={sizes} src={src} />
    </figure>
  );
}
