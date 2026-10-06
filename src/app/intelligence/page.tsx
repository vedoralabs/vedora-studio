import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/layout-primitives";
import { BriefBuilder } from "@/components/intelligence/brief-builder";
import { Concierge } from "@/components/intelligence/concierge";
import { StyleExplorer } from "@/components/intelligence/style-explorer";
import { siteConfig } from "@/lib/site-config";

const canonical = new URL("/intelligence", siteConfig.url).toString();

export const metadata: Metadata = {
  title: "Intelligence",
  description: "A quiet creative assistant that reads the Vedora portfolio: describe a feeling, explore visual qualities, and turn an idea into a creative brief.",
  alternates: { canonical },
  openGraph: {
    title: `Vedora Intelligence — ${siteConfig.name}`,
    description: "Describe a feeling, explore visual qualities, and turn an idea into a creative brief.",
    url: canonical,
    images: [{ url: "/images/projects/a-place-to-pause.png", alt: "A quiet timber interior in patterned morning light" }],
  },
};

const principles = [
  { title: "It reads the portfolio, not the internet.", text: "Every suggestion is grounded in the studio's own work and the notes that describe it." },
  { title: "It never invents.", text: "No clients, awards, results, or credits that aren't real. When the work doesn't exist yet, it says so." },
  { title: "It forgets when you leave.", text: "What you explore is remembered only in this browser tab. There is no tracking and no account." },
];

export default function IntelligencePage() {
  return (
    <div className="intelligence-page">
      <header className="intelligence-intro">
        <Container>
          <p className="eyebrow">Vedora Intelligence</p>
          <div className="intelligence-intro__layout" data-motion-reveal="">
            <h1 className="intelligence-intro__title">An idea, <em>given direction.</em></h1>
            <div className="intelligence-intro__aside">
              <p className="copy">A quiet creative assistant for the moment before a commission: when you know the feeling, but not yet the words.</p>
              <nav aria-label="On this page" className="intelligence-intro__nav">
                <a className="text-link" href="#concierge">Concierge</a>
                <a className="text-link" href="#explorer">Style explorer</a>
                <a className="text-link" href="#brief">Creative brief</a>
              </nav>
            </div>
          </div>
        </Container>
      </header>

      <Section aria-labelledby="concierge-title" className="intelligence-section" id="concierge" spacing="compact">
        <Container className="intelligence-section__layout">
          <div className="intelligence-section__heading">
            <p className="metadata">01 · Concierge</p>
            <h2 className="heading-two" id="concierge-title">Tell us what <em>you&apos;re looking for.</em></h2>
            <p className="small-copy">You&apos;ll receive a short note: a direction, the work to look at, and how we would approach it.</p>
          </div>
          <Concierge />
        </Container>
      </Section>

      <Section aria-labelledby="explorer-title" className="intelligence-section intelligence-section--surface" id="explorer" spacing="compact">
        <Container>
          <div className="intelligence-section__heading intelligence-section__heading--wide">
            <p className="metadata">02 · Style explorer</p>
            <h2 className="heading-two" id="explorer-title">Choose a feeling. <em>Watch the work answer.</em></h2>
          </div>
          <StyleExplorer />
        </Container>
      </Section>

      <Section aria-labelledby="brief-title" className="intelligence-section" id="brief" spacing="compact">
        <Container className="intelligence-section__layout">
          <div className="intelligence-section__heading">
            <p className="metadata">03 · Creative brief</p>
            <h2 className="heading-two" id="brief-title">Turn an idea into a <em>visual direction.</em></h2>
            <p className="small-copy">Six short questions. One page you can keep, print, or send to the studio.</p>
          </div>
          <BriefBuilder />
        </Container>
      </Section>

      <Section aria-labelledby="principles-title" className="intelligence-principles" spacing="compact">
        <Container>
          <h2 className="eyebrow" id="principles-title">How it works</h2>
          <ul className="intelligence-principles__list">
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="heading-three">{principle.title}</h3>
                <p className="small-copy">{principle.text}</p>
              </li>
            ))}
          </ul>
          <p className="caption intelligence-principles__note">
            The portfolio shown on this site is a set of fictional studies created for demonstration. Interpretations are clearly labelled and are not statements of fact.
          </p>
        </Container>
      </Section>
    </div>
  );
}
