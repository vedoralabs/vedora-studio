"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { GapNote, PaletteSwatches } from "@/components/intelligence/result-parts";
import { projects } from "@/content/projects";
import { qualityCopy } from "@/content/vocabulary";
import { composeDirection, findGaps, rankProjects, termLabel, type DiscoveryIntent } from "@/lib/discovery/engine";
import { exploration, useExploration } from "@/lib/personalization/session-store";
import { visualQualities, type ProjectImage, type VisualQuality } from "@/types/project";

const maxSelected = 3;

const qualityCounts = Object.fromEntries(
  visualQualities.map((quality) => [quality, projects.filter((project) => project.facets.qualities.includes(quality)).length]),
) as Record<VisualQuality, number>;

interface BoardFrame {
  readonly image: ProjectImage;
  readonly slug: string;
  readonly title: string;
}

function boardFor(slugs: readonly string[]): BoardFrame[] {
  const seen = new Set<string>();
  const frames: BoardFrame[] = [];
  for (const slug of slugs) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) continue;
    const images = [project.coverImage, ...project.gallery.flatMap((section) => section.images)];
    for (const image of images) {
      if (seen.has(image.src)) continue;
      seen.add(image.src);
      frames.push({ image, slug: project.slug, title: project.title });
      if (frames.filter((frame) => frame.slug === slug).length >= 2) break;
    }
  }
  return frames.slice(0, 5);
}

const defaultBoard = boardFor(projects.filter((project) => project.featured).map((project) => project.slug).concat("a-place-to-pause"));

export function StyleExplorer() {
  const { qualities: selected } = useExploration();

  const outcome = useMemo(() => {
    if (selected.length === 0) return null;
    const intent: DiscoveryIntent = { terms: selected.map((value) => ({ facet: "quality", value })), avoid: [], keywords: [] };
    const matches = rankProjects(intent).filter((match) => match.fit >= 0.3).slice(0, 4);
    return {
      matches,
      direction: composeDirection(intent, matches),
      gaps: findGaps(intent).map(termLabel),
      board: boardFor(matches.map((match) => match.project.slug)),
    };
  }, [selected]);

  const toggle = (quality: VisualQuality) => {
    if (selected.includes(quality)) {
      exploration.setQualities(selected.filter((item) => item !== quality));
    } else {
      // Keep the most recent choices so the direction stays focused.
      exploration.setQualities([...selected, quality].slice(-maxSelected));
    }
  };

  const board = outcome ? outcome.board : defaultBoard;
  const workQuery = selected.join(" ");

  return (
    <div className="style-explorer">
      <div className="style-explorer__choices">
        <p className="metadata" id="style-explorer-hint">Choose up to three · {selected.length} selected</p>
        <div aria-describedby="style-explorer-hint" aria-label="Visual qualities" className="quality-specimen" role="group">
          {visualQualities.map((quality) => (
            <button
              aria-label={`${qualityCopy[quality].label}, ${qualityCounts[quality]} ${qualityCounts[quality] === 1 ? "story" : "stories"}`}
              aria-pressed={selected.includes(quality)}
              className="quality-specimen__word"
              data-cursor="link"
              key={quality}
              onClick={() => toggle(quality)}
              type="button"
            >
              {qualityCopy[quality].label}
              <sup aria-hidden="true" className="quality-specimen__count">
                {qualityCounts[quality]}
              </sup>
            </button>
          ))}
        </div>
        {selected.length > 0 ? (
          <button className="studio-button studio-button--quiet style-explorer__clear" onClick={() => exploration.setQualities([])} type="button">
            Clear selection
          </button>
        ) : null}
      </div>

      <div className="style-explorer__board-wrap">
        <div aria-hidden="true" className="mood-board" data-count={board.length} key={board.map((frame) => frame.image.src).join("|")}>
          {board.map((frame, index) => (
            <span className={`mood-board__frame mood-board__frame--${index + 1}`} key={frame.image.src}>
              <Image alt="" fill sizes="(max-width: 800px) 45vw, 22vw" src={frame.image.src} />
            </span>
          ))}
          {board.length === 0 ? <span className="mood-board__empty caption">No study in the archive carries this combination yet.</span> : null}
        </div>

        <div aria-live="polite" className="style-explorer__direction">
          {outcome ? (
            <>
              <p className="style-explorer__headline">{outcome.direction.headline}</p>
              <p className="small-copy">{outcome.direction.summary}</p>
              <p className="small-copy"><span className="metadata">Light</span> {outcome.direction.lighting}</p>
              <PaletteSwatches palette={outcome.direction.palette} />
              <GapNote gaps={outcome.gaps} />
              <div className="style-explorer__links">
                {outcome.matches.length > 0 ? (
                  <Link className="text-link" href={`/work?q=${encodeURIComponent(workQuery)}`}>
                    See {outcome.matches.length} {outcome.matches.length === 1 ? "story" : "stories"} <span aria-hidden="true">↗</span>
                  </Link>
                ) : null}
                <Link className="text-link" href="/intelligence#brief">Build a brief from this <span aria-hidden="true">↗</span></Link>
              </div>
            </>
          ) : (
            <p className="small-copy style-explorer__prompt">
              Select the qualities you are drawn to. The board, the light, and the palette will answer from the work itself.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
