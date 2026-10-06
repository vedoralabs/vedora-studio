"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { DirectionNotes, GapNote, InterpretationLine, MatchList, SourceNote } from "@/components/intelligence/result-parts";
import type { DiscoverResult } from "@/lib/discovery/results";
import { postJson } from "@/lib/intelligence-client";
import { exploration, useExploration } from "@/lib/personalization/session-store";

const examples = [
  "Cinematic wedding photography with a quiet editorial feeling.",
  "Work that feels architectural and minimal.",
  "A fashion campaign with strong shadows.",
  "Something intimate, warm and imperfect.",
];

type Status = "idle" | "loading" | "done" | "error";

export function Concierge() {
  const fieldId = useId();
  const { conversation } = useExploration();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const ask = async (text: string, refine: boolean) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setError("Tell us a little about what you have in mind.");
      setStatus("error");
      fieldRef.current?.focus();
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");
    setError("");

    const previous = refine ? conversation : [];
    const response = await postJson<DiscoverResult>("/api/intelligence/discover", { query: trimmed, previous }, controller.signal);
    if (!response.ok) {
      if (response.aborted) return;
      setError(response.message);
      setStatus("error");
      return;
    }
    if (!refine) exploration.clearConversation();
    exploration.rememberMessage(trimmed);
    setResult(response.data);
    setStatus("done");
    setMessage("");
    window.requestAnimationFrame(() => responseRef.current?.focus({ preventScroll: false }));
  };

  // Arriving from homepage discovery (?q=…) starts the conversation with the visitor's words.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q")?.slice(0, 500);
    if (!initial) return;
    const frame = window.requestAnimationFrame(() => {
      setMessage(initial);
      void ask(initial, false);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on arrival
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(message, status === "done" && result !== null);
  };

  const refining = status === "done" && result !== null;
  const contactHref = result ? `/contact?direction=${encodeURIComponent(result.direction.headline)}` : "/contact";

  return (
    <div className="concierge">
      <form className="concierge__form" onSubmit={onSubmit}>
        <label className="concierge__label" htmlFor={fieldId}>
          {refining ? "Add a detail or change course." : "Tell us what you're looking for."}
        </label>
        <textarea
          className="concierge__field"
          id={fieldId}
          maxLength={500}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) event.currentTarget.form?.requestSubmit();
          }}
          placeholder={refining ? "More candlelight, less formal…" : "A wedding in late summer that feels quiet and cinematic…"}
          ref={fieldRef}
          rows={refining ? 2 : 3}
          value={message}
        />
        <div className="concierge__actions">
          <button className="studio-button studio-button--solid" disabled={status === "loading"} type="submit">
            {status === "loading" ? "Considering…" : refining ? "Refine" : "Ask the studio"}
          </button>
          {refining ? (
            <button
              className="studio-button studio-button--quiet"
              onClick={() => {
                exploration.clearConversation();
                setResult(null);
                setStatus("idle");
                fieldRef.current?.focus();
              }}
              type="button"
            >
              Start over
            </button>
          ) : null}
        </div>
        {!refining ? (
          <div className="concierge__examples">
            <span className="metadata">For example</span>
            <ul>
              {examples.map((example) => (
                <li key={example}>
                  <button className="concierge__example" onClick={() => setMessage(example)} type="button">{example}</button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>

      <div aria-busy={status === "loading"} aria-live="polite">
        {status === "loading" ? <p className="concierge__status caption">Reading the portfolio for you…</p> : null}
        {status === "error" ? <p className="concierge__status concierge__status--error small-copy" role="alert">{error}</p> : null}
      </div>

      {result && status !== "loading" ? (
        <article aria-labelledby="concierge-response-title" className="concierge-note" key={result.query} ref={responseRef} tabIndex={-1}>
          <header className="concierge-note__header">
            <p className="eyebrow">A note from the studio</p>
            {conversation.length > 0 ? (
              <ol className="concierge-note__thread" aria-label="Your words so far">
                {conversation.map((line, index) => (
                  <li key={`${index}-${line}`}><q>{line}</q></li>
                ))}
              </ol>
            ) : null}
            <h3 className="concierge-note__headline" id="concierge-response-title">{result.direction.headline}</h3>
            <p className="copy">{result.direction.summary}</p>
            <InterpretationLine avoid={result.avoid} terms={result.interpretation} />
          </header>

          <section aria-labelledby="concierge-direction" className="concierge-note__section">
            <h4 className="metadata concierge-note__label" id="concierge-direction">Direction</h4>
            <DirectionNotes direction={result.direction} />
          </section>

          <section aria-labelledby="concierge-work" className="concierge-note__section">
            <h4 className="metadata concierge-note__label" id="concierge-work">Work to look at</h4>
            {result.matches.length > 0 ? <MatchList headingLevel={4} matches={result.matches} /> : (
              <p className="small-copy">Nothing in the portfolio is a close match yet.</p>
            )}
            <GapNote gaps={result.gaps} />
          </section>

          <section aria-labelledby="concierge-services" className="concierge-note__section">
            <h4 className="metadata concierge-note__label" id="concierge-services">How we would approach it</h4>
            <ul className="service-recommendations">
              {result.services.map((service) => (
                <li key={service.id}>
                  <span className="service-recommendations__name">{service.label}</span>
                  <span className="small-copy">{service.reason}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="concierge-note__footer">
            <p className="copy">{result.nextStep}</p>
            <div className="concierge-note__links">
              <Link className="studio-link--button studio-link--solid" href={contactHref}>Start an inquiry</Link>
              <Link className="text-link" href="#brief">Or build a full brief <span aria-hidden="true">↓</span></Link>
            </div>
            <SourceNote source={result.source} />
          </footer>
        </article>
      ) : null}
    </div>
  );
}
