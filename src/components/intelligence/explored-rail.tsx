"use client";

import { useMemo } from "react";
import { MatchList } from "@/components/intelligence/result-parts";
import { projects } from "@/content/projects";
import { rankProjects, type DiscoveryIntent } from "@/lib/discovery/engine";
import { summariseMatch } from "@/lib/discovery/results";
import { exploration, useExploration } from "@/lib/personalization/session-store";

/**
 * "Based on what you've explored…" — built from this tab's session only.
 * Appears once a visitor has opened a story or chosen qualities, and can be cleared at any time.
 */
export function ExploredRail({ exclude }: { exclude?: string }) {
  const { viewed, qualities, categories } = useExploration();

  const suggestions = useMemo(() => {
    if (viewed.length === 0 && qualities.length === 0) return [];
    const seen = projects.filter((project) => viewed.includes(project.slug));
    const intent: DiscoveryIntent = {
      terms: [
        ...qualities.map((value) => ({ facet: "quality" as const, value })),
        ...seen.flatMap((project) => project.facets.qualities.slice(0, 2).map((value) => ({ facet: "quality" as const, value }))),
        ...seen.flatMap((project) => project.facets.moods.slice(0, 1).map((value) => ({ facet: "mood" as const, value }))),
        ...categories.slice(0, 2).map((value) => ({ facet: "category" as const, value })),
      ],
      avoid: [],
      keywords: [],
    };
    return rankProjects(intent)
      .filter((match) => !viewed.includes(match.project.slug) && match.project.slug !== exclude)
      .slice(0, 3)
      .map((match) => summariseMatch(match, `Shares the ${match.reasons.slice(0, 2).join(" and ").toLowerCase() || "feeling"} of what you've explored.`));
  }, [viewed, qualities, categories, exclude]);

  if (suggestions.length === 0) return null;

  return (
    <aside aria-labelledby="explored-rail-title" className="explored-rail">
      <div className="explored-rail__header">
        <h2 className="heading-three" id="explored-rail-title">Based on what you&apos;ve explored…</h2>
        <button className="studio-button studio-button--quiet" onClick={() => exploration.forget()} type="button">
          Forget this session
        </button>
      </div>
      <MatchList compact matches={suggestions} />
      <p className="caption">Remembered only in this browser tab. Nothing is tracked or stored on our side.</p>
    </aside>
  );
}
