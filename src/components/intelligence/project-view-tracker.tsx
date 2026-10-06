"use client";

import { useEffect } from "react";
import { exploration } from "@/lib/personalization/session-store";
import type { ProjectCategory } from "@/types/project";

/** Remembers, for this tab only, which stories a visitor has opened. Renders nothing. */
export function ProjectViewTracker({ slug, category }: { slug: string; category: ProjectCategory }) {
  useEffect(() => {
    exploration.recordView(slug, category);
  }, [slug, category]);
  return null;
}
