import { Container, Section } from "@/components/layout/layout-primitives";
import { StyleExplorer } from "@/components/intelligence/style-explorer";

export function VisualIntelligence() {
  return (
    <Section aria-labelledby="visual-intelligence-title" className="visual-intelligence" id="style" spacing="default">
      <Container>
        <div className="visual-intelligence__intro" data-motion-reveal="">
          <p className="eyebrow">Visual intelligence</p>
          <h2 className="heading-two" id="visual-intelligence-title">Choose a feeling. <em>Watch the work answer.</em></h2>
        </div>
        <StyleExplorer />
      </Container>
    </Section>
  );
}
