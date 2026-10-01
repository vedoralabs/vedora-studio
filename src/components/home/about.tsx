import { Container, Section } from "@/components/layout/layout-primitives";

export function About() {
  return (
    <Section aria-labelledby="about-title" className="about" id="about" spacing="compact">
      <Container className="about__layout">
        <p className="eyebrow">About Vedora</p>
        <div className="about__copy" data-motion-reveal="">
          <h2 className="heading-two" id="about-title">Attention is its own kind of artistry.</h2>
          <p className="copy">
            Vedora is a photography and visual storytelling studio drawn to atmosphere, honest gesture, and the character of a place. We make considered images that feel at home in their own world.
          </p>
        </div>
        <span aria-hidden="true" className="about__index metadata">A practice of looking closer</span>
      </Container>
    </Section>
  );
}
