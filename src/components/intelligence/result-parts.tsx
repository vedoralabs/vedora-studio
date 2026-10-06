import Image from "next/image";
import Link from "next/link";
import type { VisualDirection } from "@/lib/discovery/engine";
import type { InterpretedTerm, MatchSummary, ResultSource } from "@/lib/discovery/results";

/** Always tell visitors how a result was made. */
export function SourceNote({ source, interpretive = false }: { source: ResultSource; interpretive?: boolean }) {
  return (
    <p className="source-note caption">
      <span aria-hidden="true" className="source-note__mark" data-source={source} />
      {source === "ai"
        ? `Composed by Vedora Intelligence from portfolio notes${interpretive ? " · an interpretation, not a statement of fact" : ""}`
        : `Read against the studio's portfolio notes${interpretive ? " · an interpretation, not a statement of fact" : ""}`}
    </p>
  );
}

export function InterpretationLine({ terms, avoid }: { terms: readonly InterpretedTerm[]; avoid: readonly InterpretedTerm[] }) {
  if (terms.length === 0 && avoid.length === 0) return null;
  return (
    <div className="interpretation">
      {terms.length > 0 ? (
        <p className="interpretation__line">
          <span className="metadata">Reading</span>
          <span className="interpretation__terms">
            {terms.map((term) => (
              <span className="interpretation__term" key={`${term.facet}-${term.value}`}>{term.label}</span>
            ))}
          </span>
        </p>
      ) : null}
      {avoid.length > 0 ? (
        <p className="interpretation__line interpretation__line--avoid">
          <span className="metadata">Avoiding</span>
          <span className="interpretation__terms">
            {avoid.map((term) => (
              <span className="interpretation__term" key={`${term.facet}-${term.value}`}>{term.label}</span>
            ))}
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function GapNote({ gaps }: { gaps: readonly string[] }) {
  if (gaps.length === 0) return null;
  const lowered = gaps.map((gap) => gap.toLowerCase());
  const listed = lowered.length > 1 ? `${lowered.slice(0, -1).join(", ")} or ${lowered[lowered.length - 1]}` : lowered[0];
  return (
    <p className="gap-note small-copy">
      Nothing in the current portfolio is {listed} yet. That is a direction we would shape with you rather than show you.
    </p>
  );
}

interface MatchListProps {
  matches: readonly MatchSummary[];
  headingLevel?: 3 | 4;
  compact?: boolean;
}

export function MatchList({ matches, headingLevel = 3, compact = false }: MatchListProps) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <ol className={`match-list${compact ? " match-list--compact" : ""}`}>
      {matches.map((match, index) => (
        <li className="match-list__item" key={match.slug} style={{ animationDelay: `${index * 70}ms` }}>
          <Link className="match-list__link" data-cursor="view" href={`/work/${match.slug}`}>
            <span aria-hidden="true" className="metadata match-list__index">{String(index + 1).padStart(2, "0")}</span>
            <span className="match-list__media">
              <Image alt="" fill sizes={compact ? "6rem" : "(max-width: 600px) 30vw, 12rem"} src={match.image.src} />
            </span>
            <span className="match-list__copy">
              <Heading className="match-list__title">{match.title}</Heading>
              <span className="match-list__why">{match.why}</span>
              <span className="metadata match-list__meta">
                {match.category} · {match.location}
                {match.fit < 0.3 ? " · closest available" : ""}
              </span>
            </span>
            <span aria-hidden="true" className="match-list__arrow">↗</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function PaletteSwatches({ palette }: { palette: VisualDirection["palette"] }) {
  if (palette.length === 0) return null;
  return (
    <ul aria-label="Palette" className="palette">
      {palette.map((tone) => (
        <li className="palette__tone" key={tone.label}>
          <span aria-hidden="true" className="palette__chip" style={{ background: tone.swatch }} />
          <span className="caption">{tone.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function DirectionNotes({ direction }: { direction: VisualDirection }) {
  return (
    <dl className="direction-notes">
      <div>
        <dt className="metadata">Light</dt>
        <dd>{direction.lighting}</dd>
      </div>
      <div>
        <dt className="metadata">Composition</dt>
        <dd>{direction.composition}</dd>
      </div>
      <div>
        <dt className="metadata">Palette</dt>
        <dd><PaletteSwatches palette={direction.palette} /></dd>
      </div>
    </dl>
  );
}
