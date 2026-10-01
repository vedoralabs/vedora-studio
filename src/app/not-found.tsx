import { Container, Section, Stack } from "@/components/layout/layout-primitives";
import { StudioLink } from "@/components/ui/studio-link";

export default function NotFound() {
  return (
    <Section aria-labelledby="not-found-title" className="not-found" spacing="compact">
      <Container size="copy">
        <Stack density="loose">
          <p className="eyebrow">404 · Page not found</p>
          <h1 className="heading-one" id="not-found-title">A quiet detour.</h1>
          <p className="copy">The page you are looking for may have moved or is no longer available.</p>
          <StudioLink href="/" variant="outline">Return to the studio</StudioLink>
        </Stack>
      </Container>
    </Section>
  );
}
