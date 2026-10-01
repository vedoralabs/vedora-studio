import Link from "next/link";
import { ProjectMedia } from "@/components/ui/project-media";
import type { PhotographyProject } from "@/types/project";

interface ProjectNavigationProps {
  previous: PhotographyProject;
  next: PhotographyProject;
}

function ProjectDirection({ project, direction }: { project: PhotographyProject; direction: "Previous" | "Next" }) {
  return (
    <Link className={`project-direction project-direction--${direction.toLowerCase()}`} data-cursor="view" href={`/work/${project.slug}`}>
      <span className="metadata project-direction__label">{direction} project <span aria-hidden="true">{direction === "Previous" ? "←" : "→"}</span></span>
      <ProjectMedia
        alt={project.coverImage.alt}
        aspectRatio="5 / 3"
        className="project-direction__image"
        motion
        sizes="(max-width: 700px) 85vw, 40vw"
        src={project.coverImage.src}
      />
      <span className="project-direction__title">{project.title}</span>
      <span className="caption">{project.category} · {project.year}</span>
    </Link>
  );
}

export function ProjectNavigation({ previous, next }: ProjectNavigationProps) {
  return (
    <nav aria-label="More projects" className="project-navigation" data-motion-reveal="">
      <ProjectDirection direction="Previous" project={previous} />
      <ProjectDirection direction="Next" project={next} />
    </nav>
  );
}
