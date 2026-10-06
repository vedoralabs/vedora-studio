import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { BriefInvitation } from "@/components/home/brief-invitation";
import { Discovery } from "@/components/home/discovery";
import { EditorialStatement } from "@/components/home/editorial-statement";
import { FeaturedProject } from "@/components/home/featured-project";
import { FinalCta } from "@/components/home/final-cta";
import { HomeHero } from "@/components/home/home-hero";
import { SelectedWork } from "@/components/home/selected-work";
import { Services } from "@/components/home/services";
import { VisualIntelligence } from "@/components/home/visual-intelligence";
import { Container } from "@/components/layout/layout-primitives";
import { ExploredRail } from "@/components/intelligence/explored-rail";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Vedora Studio — Photography & Visual Storytelling" },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: "Vedora Studio — Photography & Visual Storytelling",
    description: siteConfig.description,
    images: [{ url: "/images/homepage/hero-editorial.png", alt: "A fashion portrait in a stone courtyard at dusk" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedora Studio — Photography & Visual Storytelling",
    description: siteConfig.description,
    images: ["/images/homepage/hero-editorial.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${siteConfig.url}/#studio`, name: siteConfig.name, url: siteConfig.url, description: siteConfig.description },
    { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, publisher: { "@id": `${siteConfig.url}/#studio` } },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HomeHero />
      <Discovery />
      <SelectedWork />
      <EditorialStatement />
      <VisualIntelligence />
      <FeaturedProject />
      <BriefInvitation />
      <About />
      <Services />
      <Container>
        <ExploredRail />
      </Container>
      <FinalCta />
    </>
  );
}
