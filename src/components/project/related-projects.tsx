import { MatchList } from "@/components/intelligence/result-parts";
import { rankProjects, type DiscoveryIntent } from "@/lib/discovery/engine";
import { summariseMatch } from "@/lib/discovery/results";
import type { PhotographyProject } from "@/types/project";

/** Studies that share this project's visual qualities, light, and mood, computed from metadata at build time. */
export function RelatedProjects({ project }: { project: PhotographyProject }) {
  const intent: DiscoveryIntent = {
    terms: [
      ...project.facets.qualities.map((value) => ({ facet: "quality" as const, value })),
      ...project.facets.moods.map((value) => ({ facet: "mood" as const, value })),
      ...project.facets.lighting.map((value) => ({ facet: "lighting" as const, value })),
    ],
    avoid: [],
    keywords: [],
  };
  const related = rankProjects(intent)
    .filter((match) => match.project.slug !== project.slug)
    .slice(0, 2)
    .map((match) =>
      summariseMatch(match, `Also ${match.reasons.slice(0, 2).join(" and ").toLowerCase()}.`),
    );

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="related-projects" data-motion-reveal="">
      <h2 className="eyebrow" id="related-title">Related by feeling</h2>
      <MatchList compact headingLevel={3} matches={related} />
    </section>
  );
}
