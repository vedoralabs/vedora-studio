import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/work"), changeFrequency: "monthly", priority: 0.9 },
    ...projects.map((project) => ({
      url: url(`/work/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: [url(project.coverImage.src)],
    })),
    { url: url("/intelligence"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];
}
