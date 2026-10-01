import Link from "next/link";
import { Container } from "@/components/layout/layout-primitives";
import { ProjectGallery } from "@/components/project/project-gallery";
import { ProjectInquiry } from "@/components/project/project-inquiry";
import { ProjectMetadata } from "@/components/project/project-metadata";
import { ProjectNavigation } from "@/components/project/project-navigation";
import { ProjectMedia } from "@/components/ui/project-media";
import type { PhotographyProject } from "@/types/project";

interface ProjectDetailProps {
  project: PhotographyProject;
  previous: PhotographyProject;
  next: PhotographyProject;
}

export function ProjectDetail({ project, previous, next }: ProjectDetailProps) {
  return (
    <article className="project-page">
      <header className="project-intro">
        <Container>
          <Link className="project-back text-link" href="/work"><span aria-hidden="true">←</span> Back to work</Link>
          <p className="eyebrow">{project.category} / {String(project.year)}</p>
          <div className="project-intro__layout" data-motion-reveal="">
            <h1 className="project-intro__title">{project.title}</h1>
            <div className="project-intro__aside">
              <p className="copy">{project.description}</p>
              {project.fictional ? <p className="project-demo-label caption">Fictional portfolio study</p> : null}
            </div>
          </div>
          <ProjectMetadata className="project-intro__metadata" project={project} />
        </Container>
      </header>

      <div className="project-hero-wrap">
        <ProjectMedia
          alt={project.coverImage.alt}
          aspectRatio="2 / 1"
          className="project-hero"
          motion
          objectPosition="center"
          preload
          sizes="100vw"
          src={project.coverImage.src}
        />
        <p className="project-hero__caption caption">{project.caption ?? `${project.title} · ${project.location}`}</p>
      </div>

      <ProjectGallery projectTitle={project.title} sections={project.gallery} />

      <Container>
        <ProjectNavigation next={next} previous={previous} />
        <ProjectInquiry projectTitle={project.title} />
      </Container>
    </article>
  );
}
