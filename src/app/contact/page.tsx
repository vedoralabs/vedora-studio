import type { Metadata } from "next";
import { Container } from "@/components/layout/layout-primitives";
import { SmartInquiry } from "@/components/intelligence/smart-inquiry";
import { siteConfig } from "@/lib/site-config";

const canonical = new URL("/contact", siteConfig.url).toString();

export const metadata: Metadata = {
  title: "Contact",
  description: "Begin a project with Vedora Studio. A few considered questions, then a summary you can edit before it reaches the studio.",
  alternates: { canonical },
  openGraph: { title: `Contact — ${siteConfig.name}`, url: canonical, description: "Begin a project with Vedora Studio." },
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <Container className="contact-page__layout">
        <header className="contact-page__intro" data-motion-reveal="">
          <p className="eyebrow">Begin a project</p>
          <h1 className="contact-page__title">Let the next story <em>take shape.</em></h1>
          <p className="copy">A few considered questions instead of a blank form. You&apos;ll see what we understood, and can change it, before anything is sent.</p>
          {siteConfig.contactEmail ? (
            <p className="small-copy">
              Prefer to write freely? <a className="text-link" href={`mailto:${siteConfig.contactEmail}`}>Email the studio <span aria-hidden="true">↗</span></a>
            </p>
          ) : null}
        </header>
        <SmartInquiry />
      </Container>
    </div>
  );
}
