import { Container, Section } from "@/components/layout/layout-primitives";
import { StudioImage } from "@/components/ui/studio-image";
import { StudioLink } from "@/components/ui/studio-link";
import { projects } from "@/content/projects";

const featuredProject = projects.find((project) => project.slug === "a-place-to-pause");

export function FeaturedProject() {
  if (!featuredProject?.coverImage) return null;

  return (
    <Section aria-labelledby="featured-project-title" className="featured-project" id="featured-project" spacing="compact">
      <Container>
        <p className="eyebrow featured-project__eyebrow" data-motion-reveal="">A study in stillness</p>
        <StudioImage
          alt={featuredProject.coverImage.alt}
          aspectRatio="2 / 1"
          className="featured-project__image"
          motion
          sizes="(max-width: 800px) 100vw, 92vw"
          src={featuredProject.coverImage.src}
        />
        <div className="featured-project__caption" data-motion-reveal="">
          <div className="featured-project__heading">
            <p className="metadata">{featuredProject.category} <span aria-hidden="true">/</span> {featuredProject.location}</p>
            <h2 className="heading-two" id="featured-project-title">{featuredProject.title}</h2>
          </div>
          <div className="featured-project__description">
            <p className="small-copy">{featuredProject.description}</p>
            <StudioLink href={`/work/${featuredProject.slug}`}>Enter the story <span aria-hidden="true">↗</span></StudioLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
