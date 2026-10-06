"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { GapNote, InterpretationLine } from "@/components/intelligence/result-parts";
import { curateDiscovery, type DiscoverResult } from "@/lib/discovery/results";
import { projectCategories, type ProjectCategory } from "@/types/project";

type CategoryFilter = "All" | ProjectCategory;
const filters: readonly CategoryFilter[] = ["All", ...projectCategories];

interface WorkArchiveProps {
  children: ReactNode;
  counts: Readonly<Record<CategoryFilter, number>>;
}

export function WorkArchive({ children, counts }: WorkArchiveProps) {
  const searchId = useId();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<DiscoverResult | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const matchedSlugs = search ? search.matches.map((match) => match.slug) : null;
  const visibleCount = matchedSlugs ? matchedSlugs.length : counts[activeFilter];

  const runSearch = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSearch(null);
      return;
    }
    setActiveFilter("All");
    setSearch(curateDiscovery(trimmed));
  };

  // Arriving with ?q=… (from the style explorer) applies the search immediately.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q")?.slice(0, 300);
    if (!initial) return;
    const frame = window.requestAnimationFrame(() => {
      setQuery(initial);
      runSearch(initial);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Search results reorder and hide server-rendered stories without re-rendering them.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const article of grid.querySelectorAll<HTMLElement>("[data-project-slug]")) {
      const slug = article.dataset.projectSlug ?? "";
      if (!matchedSlugs) {
        article.hidden = false;
        article.style.order = "";
        continue;
      }
      const position = matchedSlugs.indexOf(slug);
      article.hidden = position < 0;
      article.style.order = position < 0 ? "" : String(position);
    }
  }, [matchedSlugs]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setSearch(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("q")) {
      url.searchParams.delete("q");
      window.history.replaceState(window.history.state, "", url);
    }
  };

  return (
    <section aria-label="Project archive" className="work-archive">
      <form className="work-search" onSubmit={onSubmit} role="search">
        <label className="metadata" htmlFor={searchId}>Describe what you&apos;re looking for</label>
        <div className="work-search__row">
          <input
            autoComplete="off"
            className="work-search__input"
            enterKeyHint="search"
            id={searchId}
            maxLength={300}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Warm, quiet, candlelit…"
            type="search"
            value={query}
          />
          <button className="work-search__submit" type="submit">Search <span aria-hidden="true">→</span></button>
          {search ? <button className="studio-button studio-button--quiet" onClick={clearSearch} type="button">Clear</button> : null}
        </div>
        {search ? <InterpretationLine avoid={search.avoid} terms={search.interpretation} /> : null}
        {search ? <GapNote gaps={search.gaps} /> : null}
      </form>

      <div aria-label="Filter projects by category" className="work-filters" role="group">
        {filters.map((filter) => (
          <button
            aria-pressed={!search && activeFilter === filter}
            className="work-filter"
            key={filter}
            onClick={() => {
              setSearch(null);
              setQuery("");
              setActiveFilter(filter);
            }}
            type="button"
          >
            {filter === "All" ? "All" : filter}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="work-archive__count metadata">
        {visibleCount.toString().padStart(2, "0")} {visibleCount === 1 ? "story" : "stories"}
        {search ? " / matching your words" : activeFilter !== "All" ? ` / ${activeFilter}` : " / selected work"}
      </p>
      {visibleCount > 0 ? (
        <div
          className={`work-grid${visibleCount === 1 ? " work-grid--single" : ""}${search ? " work-grid--search" : ""}`}
          data-filter={search ? "All" : activeFilter}
          id="work-projects"
          key={search ? `search-${search.query}` : activeFilter}
          ref={gridRef}
        >
          {children}
        </div>
      ) : (
        <p className="work-archive__empty copy">
          {search ? "Nothing in the archive answers that closely yet. Try describing the light, the place, or the feeling." : "There are no stories in this selection yet."}
        </p>
      )}
      <p className="work-archive__note caption">The portfolio examples shown here are fictional studies created for demonstration.</p>
    </section>
  );
}
