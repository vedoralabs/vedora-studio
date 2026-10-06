import Link from "next/link";
import { ProjectMedia } from "@/components/ui/project-media";
import type { PhotographyProject } from "@/types/project";

interface ProjectPreviewProps {
  project: PhotographyProject;
  href?: string;
  headingLevel?: 2 | 3;
  preloadImage?: boolean;
  imageAspectRatio?: string;
  imageSizes?: string;
  className?: string;
}

export function ProjectPreview({
  project,
  href = `/work/${project.slug}`,
  headingLevel = 2,
  preloadImage = false,
  imageAspectRatio = "4 / 5",
  imageSizes = "(max-width: 800px) 100vw, 48vw",
  className,
}: ProjectPreviewProps) {
  const headingId = `project-${project.slug}`;
  const articleClassName = ["project-preview", className].filter(Boolean).join(" ");
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article aria-labelledby={headingId} className={articleClassName} data-project-category={project.category} data-project-slug={project.slug}>
      <Link aria-labelledby={headingId} className="project-preview__link" data-cursor="view" href={href}>
        <ProjectMedia
          alt={project.coverImage.alt}
          aspectRatio={imageAspectRatio}
          className="project-preview__image"
          motion
          preload={preloadImage}
          sizes={imageSizes}
          src={project.coverImage.src}
        />
        <div className="project-preview__copy" data-motion-reveal="">
          <div className="project-preview__heading">
            <Heading className="project-preview__title" id={headingId}>{project.title}</Heading>
            <span className="metadata">{project.category}</span>
          </div>
          <p className="project-preview__metadata">
            <span>{project.location}</span><span aria-hidden="true">·</span><span>{project.year}</span>
          </p>
        </div>
        <span aria-hidden="true" className="project-preview__arrow">↗</span>
      </Link>
    </article>
  );
}
