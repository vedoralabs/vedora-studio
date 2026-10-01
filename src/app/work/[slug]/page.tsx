import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project/project-detail";
import { getAdjacentProjects, getProjectBySlug, projects } from "@/content/projects";
import { siteConfig } from "@/lib/site-config";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const canonicalUrl = new URL(`/work/${project.slug}`, siteConfig.url).toString();
  const title = `${project.title} — ${project.category}`;

  return {
    title,
    description: project.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: `${title} — ${siteConfig.name}`,
      description: project.description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [{ url: project.coverImage.src, alt: project.coverImage.alt }],
    },
    twitter: { card: "summary_large_image", title, description: project.description, images: [project.coverImage.src] },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { previous, next } = getAdjacentProjects(project.slug);
  if (!previous || !next) notFound();

  return <ProjectDetail next={next} previous={previous} project={project} />;
}
