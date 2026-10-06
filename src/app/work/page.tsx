import type { Metadata } from "next";
import { Container } from "@/components/layout/layout-primitives";
import { ProjectPreview } from "@/components/ui/project-preview";
import { ExploredRail } from "@/components/intelligence/explored-rail";
import { WorkArchive } from "@/components/work/work-archive";
import { projects } from "@/content/projects";
import { siteConfig } from "@/lib/site-config";
import type { ProjectCategory } from "@/types/project";

const projectCounts: Readonly<Record<"All" | ProjectCategory, number>> = {
  All: projects.length,
  Weddings: projects.filter((project) => project.category === "Weddings").length,
  Fashion: projects.filter((project) => project.category === "Fashion").length,
  Commercial: projects.filter((project) => project.category === "Commercial").length,
  Editorial: projects.filter((project) => project.category === "Editorial").length,
  Architecture: projects.filter((project) => project.category === "Architecture").length,
  Product: projects.filter((project) => project.category === "Product").length,
};

export const metadata: Metadata = {
  title: "Selected Work",
  description: "A curated portfolio of fictional photography studies across weddings, fashion, commercial, editorial, architecture, and product.",
  alternates: { canonical: new URL("/work", siteConfig.url).toString() },
  openGraph: {
    title: `Selected Work — ${siteConfig.name}`,
    description: "A considered collection of photographic stories and visual studies.",
    url: new URL("/work", siteConfig.url).toString(),
    images: [{ url: "/images/projects/the-quiet-vow.jpg", alt: "A couple walking a garden path beneath cypress trees" }],
  },
};

export default function WorkPage() {
  return (
    <div className="work-page">
      <header className="work-intro">
        <Container>
          <p className="eyebrow">Portfolio / 01</p>
          <div className="work-intro__layout" data-motion-reveal="">
            <h1 className="work-intro__title">Stories in <em>light.</em></h1>
            <div className="work-intro__aside">
              <p className="copy">A collection of visual studies shaped by place, feeling, and a patient eye.</p>
              <span className="metadata">Six stories · six perspectives</span>
            </div>
          </div>
        </Container>
      </header>
      <Container>
        <WorkArchive counts={projectCounts}>
          {projects.map((project, index) => (
            <ProjectPreview
              className={`archive-project archive-project--${(index % 6) + 1}`}
              imageAspectRatio={index % 3 === 2 ? "5 / 4" : index % 2 === 0 ? "4 / 5" : "3 / 4"}
              imageSizes="(max-width: 700px) 90vw, (max-width: 1000px) 60vw, 46vw"
              key={project.slug}
              preloadImage={index === 0}
              project={project}
            />
          ))}
        </WorkArchive>
        <ExploredRail />
      </Container>
    </div>
  );
}
