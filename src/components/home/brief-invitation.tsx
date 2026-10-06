import { Container, Section } from "@/components/layout/layout-primitives";
import { StudioLink } from "@/components/ui/studio-link";

const steps = [
  { index: "01", title: "Six short questions", text: "What you're making, how it should feel, who it's for." },
  { index: "02", title: "An editorial brief", text: "Mood, light, composition, colour, and shot concepts — on one page." },
  { index: "03", title: "Ready to share", text: "Keep it, print it, or send it to the studio as the start of a conversation." },
];

export function BriefInvitation() {
  return (
    <Section aria-labelledby="brief-invitation-title" className="brief-invitation" spacing="compact">
      <Container className="brief-invitation__layout">
        <div data-motion-reveal="">
          <p className="eyebrow">Creative brief</p>
          <h2 className="heading-two" id="brief-invitation-title">Turn an idea into a <em>visual direction.</em></h2>
        </div>
        <ol className="brief-invitation__steps" data-motion-reveal="">
          {steps.map((step) => (
            <li key={step.index}>
              <span className="metadata">{step.index}</span>
              <h3>{step.title}</h3>
              <p className="small-copy">{step.text}</p>
            </li>
          ))}
        </ol>
        <StudioLink className="brief-invitation__link" data-cursor="link" data-magnetic="" href="/intelligence#brief">
          Build a brief <span aria-hidden="true">↗</span>
        </StudioLink>
      </Container>
    </Section>
  );
}
