import { Container, Section } from "@/components/layout/layout-primitives";
import { StudioLink } from "@/components/ui/studio-link";

export function FinalCta() {
  return (
    <Section aria-labelledby="final-cta-title" className="final-cta" id="contact" spacing="compact">
      <Container className="final-cta__inner">
        <p className="eyebrow" data-motion-reveal="">For the stories still unfolding</p>
        <h2 className="final-cta__title" data-motion-reveal="" id="final-cta-title">
          Let the next
          <br />
          story <em>take shape.</em>
        </h2>
        <div className="final-cta__links" data-motion-reveal="">
          <StudioLink className="final-cta__link" data-cursor="link" data-magnetic="" href="/contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </StudioLink>
          <p className="final-cta__aside small-copy">
            Have an idea, but not the words yet?{" "}
            <StudioLink href="/intelligence#concierge">Tell us, and we&apos;ll help shape it <span aria-hidden="true">↗</span></StudioLink>
          </p>
        </div>
        <span aria-hidden="true" className="metadata final-cta__index">VEDORA / STUDIO</span>
      </Container>
    </Section>
  );
}
