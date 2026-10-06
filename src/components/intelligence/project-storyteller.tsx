"use client";

import { useRef, useState } from "react";
import { SourceNote } from "@/components/intelligence/result-parts";
import type { StoryResult } from "@/lib/discovery/results";
import { postJson } from "@/lib/intelligence-client";

export function ProjectStoryteller({ slug, title }: { slug: string; title: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [story, setStory] = useState<StoryResult | null>(null);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const explore = async () => {
    if (story) {
      setStatus(status === "done" ? "idle" : "done");
      return;
    }
    setStatus("loading");
    const response = await postJson<StoryResult>("/api/intelligence/story", { slug });
    if (!response.ok) {
      setStatus("error");
      setError(response.message);
      return;
    }
    setStory(response.data);
    setStatus("done");
    window.requestAnimationFrame(() => panelRef.current?.focus());
  };

  const panelId = `story-${slug}`;

  return (
    <section aria-labelledby={`${panelId}-title`} className="storyteller" data-motion-reveal="">
      <div className="storyteller__intro">
        <p className="eyebrow">Interpretation</p>
        <h2 className="heading-three" id={`${panelId}-title`}>Explore this story</h2>
        <p className="small-copy">A reading of the light, composition, and intent behind {title}, drawn only from this study&apos;s notes.</p>
        <button
          aria-controls={panelId}
          aria-expanded={status === "done"}
          className="studio-button studio-button--outline"
          disabled={status === "loading"}
          onClick={() => void explore()}
          type="button"
        >
          {status === "loading" ? "Reading…" : status === "done" ? "Close the reading" : "Explore this story"}
        </button>
      </div>
      <div aria-live="polite" className="storyteller__panel" id={panelId} ref={panelRef} tabIndex={-1}>
        {status === "error" ? <p className="small-copy" role="alert">{error}</p> : null}
        {status === "done" && story ? (
          <div className="storyteller__reading">
            {story.interpretation.map((paragraph) => <p className="copy" key={paragraph}>{paragraph}</p>)}
            <dl className="direction-notes">
              {story.notes.map((note) => (
                <div key={note.label}>
                  <dt className="metadata">{note.label}</dt>
                  <dd>{note.text}</dd>
                </div>
              ))}
            </dl>
            <SourceNote interpretive source={story.source} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
