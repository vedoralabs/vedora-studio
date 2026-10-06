import { Container, Section } from "@/components/layout/layout-primitives";
import { ProjectPreview } from "@/components/ui/project-preview";
import { StudioLink } from "@/components/ui/studio-link";
import { projects } from "@/content/projects";

const selectedProjects = projects.filter((project) => project.featured);

export function SelectedWork() {
  return (
    <Section aria-labelledby="selected-work-title" className="selected-work" id="projects" spacing="default">
      <Container>
        <div className="selected-work__intro" data-motion-reveal="">
          <div>
            <p className="eyebrow">A collection of perspectives</p>
            <h2 className="heading-one selected-work__title" id="selected-work-title">
              Selected <em>work.</em>
            </h2>
          </div>
          <p className="copy selected-work__aside">
            Every story asks for its own kind of attention. These studies begin with the light, and follow where it leads.
          </p>
        </div>
        <div className="selected-work__grid">
          {selectedProjects.map((project, index) => (
            <ProjectPreview
              className={`selected-project selected-project--${index + 1}`}
              headingLevel={3}
              imageAspectRatio={index === 0 ? "4 / 5" : "5 / 6"}
              imageSizes="(max-width: 800px) 100vw, (max-width: 1200px) 54vw, 48vw"
              key={project.slug}
              project={project}
            />
          ))}
        </div>
        <div className="selected-work__endnote" data-motion-reveal="">
          <span className="metadata">Fictional portfolio studies</span>
          <span aria-hidden="true" className="selected-work__rule" />
          <span className="metadata">Weddings · Fashion · and four more</span>
          <StudioLink href="/work">View all work <span aria-hidden="true">↗</span></StudioLink>
        </div>
      </Container>
    </Section>
  );
}
