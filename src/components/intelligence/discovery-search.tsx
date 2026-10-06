"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { GapNote, InterpretationLine, MatchList, SourceNote } from "@/components/intelligence/result-parts";
import type { DiscoverResult } from "@/lib/discovery/results";
import { postJson } from "@/lib/intelligence-client";

export interface ContactSheetItem {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly image: { readonly src: string; readonly alt: string };
}

interface DiscoverySearchProps {
  sheet: readonly ContactSheetItem[];
  prompts: readonly string[];
}

type Status = "idle" | "loading" | "done" | "error";

export function DiscoverySearch({ sheet, prompts }: DiscoverySearchProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const search = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setError("Describe what you're looking for in a few words.");
      setStatus("error");
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");
    setError("");

    const response = await postJson<DiscoverResult>("/api/intelligence/discover", { query: trimmed }, controller.signal);
    if (!response.ok) {
      if (response.aborted) return;
      setError(response.message);
      setStatus("error");
      return;
    }
    setResult(response.data);
    setStatus("done");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void search(query);
  };

  const matched = new Set(result?.matches.map((match) => match.slug) ?? []);
  const sheetState = status === "done" && result ? (matched.size > 0 ? "filtered" : "empty") : status === "loading" ? "searching" : "idle";

  return (
    <div className="discovery">
      <form className="discovery__form" onSubmit={onSubmit} role="search">
        <label className="visually-hidden" htmlFor={inputId}>Describe the photography you are looking for</label>
        <input
          autoComplete="off"
          className="discovery__input"
          enterKeyHint="search"
          id={inputId}
          maxLength={500}
          name="query"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="A feeling, a place, a kind of light…"
          type="text"
          value={query}
        />
        <button className="discovery__submit" data-cursor="link" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Looking" : "Search"} <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="discovery__prompts">
        <span className="metadata">Try</span>
        {prompts.map((prompt) => (
          <button
            className="discovery__prompt"
            key={prompt}
            onClick={() => {
              setQuery(prompt);
              void search(prompt);
            }}
            type="button"
          >
            “{prompt}”
          </button>
        ))}
      </p>

      <ul aria-label="The portfolio at a glance" className="contact-sheet" data-state={sheetState}>
        {sheet.map((item, index) => (
          <li className="contact-sheet__frame" data-match={matched.has(item.slug) ? "true" : "false"} key={item.slug}>
            <Link aria-label={`${item.title}, ${item.category}`} className="contact-sheet__link" data-cursor="view" href={`/work/${item.slug}`}>
              <span className="contact-sheet__image">
                <Image alt="" fill sizes="(max-width: 700px) 30vw, 15vw" src={item.image.src} />
              </span>
              <span aria-hidden="true" className="contact-sheet__label">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div aria-busy={status === "loading"} aria-live="polite" className="discovery__results">
        {status === "loading" ? <p className="discovery__status caption">Looking through the archive…</p> : null}
        {status === "error" ? <p className="discovery__status discovery__status--error small-copy" role="alert">{error}</p> : null}
        {status === "done" && result ? (
          <div className="discovery__answer" key={result.query}>
            <InterpretationLine avoid={result.avoid} terms={result.interpretation} />
            {result.matches.length > 0 ? (
              <>
                <h3 className="visually-hidden">Matching work</h3>
                <MatchList headingLevel={4} matches={result.matches} />
              </>
            ) : (
              <p className="small-copy discovery__empty">
                Nothing in the portfolio answers that closely yet. Try describing the light, the place, or the feeling.
              </p>
            )}
            <GapNote gaps={result.gaps} />
            <div className="discovery__direction">
              <p className="discovery__headline">{result.direction.headline}</p>
              <Link className="text-link" href={`/intelligence?q=${encodeURIComponent(result.query)}#concierge`}>
                Develop this direction <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <SourceNote source={result.source} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
