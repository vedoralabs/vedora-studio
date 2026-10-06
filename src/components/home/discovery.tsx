import { Container, Section } from "@/components/layout/layout-primitives";
import { DiscoverySearch, type ContactSheetItem } from "@/components/intelligence/discovery-search";
import { projects } from "@/content/projects";

const sheet: ContactSheetItem[] = projects.map((project) => ({
  slug: project.slug,
  title: project.title,
  category: project.category,
  image: { src: project.coverImage.src, alt: project.coverImage.alt },
}));

const prompts = ["dark cinematic wedding work", "minimal, expensive product", "warm Japanese architecture"];

export function Discovery() {
  return (
    <Section aria-labelledby="discovery-title" className="discovery-section" id="discover" spacing="compact">
      <Container>
        <div className="discovery-section__intro" data-motion-reveal="">
          <p className="eyebrow">Discovery</p>
          <h2 className="heading-one" id="discovery-title">What are you <em>looking for?</em></h2>
          <p className="copy">Describe it the way you would to a friend. The portfolio answers.</p>
        </div>
        <DiscoverySearch prompts={prompts} sheet={sheet} />
      </Container>
    </Section>
  );
}
