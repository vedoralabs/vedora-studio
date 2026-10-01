import { Container, Section } from "@/components/layout/layout-primitives";

export function EditorialStatement() {
  return (
    <Section aria-labelledby="statement-title" className="editorial-statement" spacing="compact">
      <Container>
        <p className="eyebrow editorial-statement__label" data-motion-reveal="">A way of seeing</p>
        <h2 className="editorial-statement__title" data-motion-lines="" id="statement-title">
          <span>Less about what</span>
          <span>happened.</span>
          <em>More about how it felt.</em>
        </h2>
        <p className="small-copy editorial-statement__note" data-motion-reveal="">
          The most lasting images leave room for the viewer to enter.
        </p>
      </Container>
    </Section>
  );
}
