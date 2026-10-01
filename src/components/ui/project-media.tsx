"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

interface ProjectMediaProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  objectPosition?: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
  motion?: boolean;
}

export function ProjectMedia({
  src,
  alt,
  aspectRatio = "4 / 5",
  objectPosition = "center",
  sizes = "(max-width: 800px) 100vw, 60vw",
  preload = false,
  className,
  motion = false,
}: ProjectMediaProps) {
  const [failed, setFailed] = useState(false);
  const style: CSSProperties & { "--image-position": string } = { aspectRatio, "--image-position": objectPosition };

  return (
    <figure className={className ? `studio-image ${className}` : "studio-image"} data-motion-image={motion ? "" : undefined} style={style}>
      {failed ? (
        <span aria-label={`Image unavailable: ${alt}`} className="project-media__fallback" role="img">Image unavailable</span>
      ) : (
        <Image
          alt={alt}
          className="studio-image__media"
          fill
          loading={preload ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          preload={preload}
          sizes={sizes}
          src={src}
        />
      )}
    </figure>
  );
}
