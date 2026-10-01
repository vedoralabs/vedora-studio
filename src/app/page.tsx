import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { EditorialStatement } from "@/components/home/editorial-statement";
import { FeaturedProject } from "@/components/home/featured-project";
import { FinalCta } from "@/components/home/final-cta";
import { HomeHero } from "@/components/home/home-hero";
import { SelectedWork } from "@/components/home/selected-work";
import { Services } from "@/components/home/services";
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

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <SelectedWork />
      <EditorialStatement />
      <FeaturedProject />
      <Services />
      <About />
      <FinalCta />
    </>
  );
}
