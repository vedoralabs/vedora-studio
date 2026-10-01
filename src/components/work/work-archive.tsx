"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { projectCategories, type ProjectCategory } from "@/types/project";

type CategoryFilter = "All" | ProjectCategory;
const filters: readonly CategoryFilter[] = ["All", ...projectCategories];

interface WorkArchiveProps {
  children: ReactNode;
  counts: Readonly<Record<CategoryFilter, number>>;
}

export function WorkArchive({ children, counts }: WorkArchiveProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");
  const visibleCount = counts[activeFilter];

  return (
    <section aria-label="Project archive" className="work-archive">
      <div aria-label="Filter projects by category" className="work-filters" role="group">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className="work-filter"
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter === "All" ? "All" : filter}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="work-archive__count metadata">
        {visibleCount.toString().padStart(2, "0")} {visibleCount === 1 ? "story" : "stories"}
        {activeFilter !== "All" ? ` / ${activeFilter}` : " / selected work"}
      </p>
      {visibleCount > 0 ? (
        <div className={`work-grid${visibleCount === 1 ? " work-grid--single" : ""}`} data-filter={activeFilter} id="work-projects" key={activeFilter}>
          {children}
        </div>
      ) : (
        <p className="work-archive__empty copy">There are no stories in this selection yet.</p>
      )}
      <p className="work-archive__note caption">The portfolio examples shown here are fictional studies created for demonstration.</p>
    </section>
  );
}
