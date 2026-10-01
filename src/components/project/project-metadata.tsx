import type { PhotographyProject } from "@/types/project";

interface ProjectMetadataProps {
  project: PhotographyProject;
  className?: string;
}

export function ProjectMetadata({ project, className }: ProjectMetadataProps) {
  const metadata = [
    { label: "Discipline", value: project.discipline },
    { label: "Category", value: project.category },
    { label: "Location", value: project.location },
    { label: "Year", value: String(project.year) },
    { label: "Client", value: project.fictional ? undefined : project.client },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <dl className={["project-metadata", className].filter(Boolean).join(" ")} data-motion-reveal="">
      {metadata.map(({ label, value }) => (
        <div className="project-metadata__item" key={label}>
          <dt className="metadata">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
