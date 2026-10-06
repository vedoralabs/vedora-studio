"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SourceNote } from "@/components/intelligence/result-parts";
import { projects } from "@/content/projects";
import { qualityCopy } from "@/content/vocabulary";
import { parseIntent } from "@/lib/discovery/engine";
import {
  curateInquirySummary,
  inquiryCreating,
  inquiryLookingFor,
  type InquiryAnswers,
  type InquiryCreating,
  type InquiryLookingFor,
  type ResultSource,
} from "@/lib/discovery/results";
import { postJson } from "@/lib/intelligence-client";
import { useExploration } from "@/lib/personalization/session-store";
import { siteConfig } from "@/lib/site-config";
import type { ProjectCategory } from "@/types/project";

const categoryToCreating: Readonly<Record<ProjectCategory, InquiryCreating>> = {
  Weddings: "Wedding",
  Fashion: "Campaign",
  Commercial: "Campaign",
  Editorial: "Editorial",
  Architecture: "Architecture",
  Product: "Product",
};

const feelingChoices = ["cinematic", "intimate", "minimal", "warm", "editorial", "dramatic", "nostalgic", "raw"] as const;
const stepTitles = ["What are you creating?", "What are you looking for?", "What feeling should the work have?", "A little more detail", "Here's what we understand"];

type SendState = "idle" | "sending" | "sent" | "not-configured" | "error";

export function SmartInquiry() {
  const baseId = useId();
  const { brief } = useExploration();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<InquiryAnswers>({ creating: "Other", lookingFor: "Photography", feeling: "", details: "", timing: "" });
  const [chosen, setChosen] = useState({ creating: false, lookingFor: false });
  const [project, setProject] = useState("");
  const [summary, setSummary] = useState("");
  const [summarySource, setSummarySource] = useState<ResultSource>("curated");
  const [summaryState, setSummaryState] = useState<"idle" | "loading" | "ready">("idle");
  const [contact, setContact] = useState({ name: "", email: "", website: "" });
  const [sendState, setSendState] = useState<SendState>("idle");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedRef = useRef(false);
  const prefilledRef = useRef(false);

  // Carry context forward from a project page, the concierge, or a saved brief.
  useEffect(() => {
    if (prefilledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const projectSlug = params.get("project");
    const direction = params.get("direction")?.slice(0, 200);
    const fromBrief = params.get("from") === "brief" && brief;
    if (!projectSlug && !direction && !fromBrief) return;

    const frame = window.requestAnimationFrame(() => {
      // Marked inside the frame so a cancelled first pass (e.g. Strict Mode remount) can still prefill.
      prefilledRef.current = true;
      const related = projects.find((item) => item.slug === projectSlug);
      if (related) {
        setProject(related.slug);
        setAnswers((current) => ({ ...current, creating: categoryToCreating[related.category], details: `I'm drawn to “${related.title}”.` }));
        setChosen((current) => ({ ...current, creating: true }));
      }
      if (direction) setAnswers((current) => ({ ...current, feeling: direction.replace(/\.$/, "") }));
      if (fromBrief && brief) {
        const category = parseIntent(brief.title + " " + brief.overview).terms.find((term) => term.facet === "category")?.value as ProjectCategory | undefined;
        setAnswers((current) => ({
          ...current,
          creating: category ? categoryToCreating[category] : current.creating,
          lookingFor: brief.service.id === "visual-production" ? "Full visual production" : brief.service.id === "creative-direction" ? "Creative direction" : "Photography",
          feeling: brief.mood.replace(/\.$/, ""),
          details: `From my creative brief, “${brief.title}”.`,
        }));
        setChosen({ creating: Boolean(category), lookingFor: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [brief]);

  useEffect(() => {
    if (movedRef.current) headingRef.current?.focus();
  }, [step]);

  const goTo = (next: number) => {
    movedRef.current = true;
    setError("");
    setStep(next);
  };

  const prepareSummary = async () => {
    goTo(4);
    setSummaryState("loading");
    const response = await postJson<{ source: ResultSource; summary: string }>("/api/intelligence/inquiry-summary", answers);
    if (response.ok) {
      setSummary(response.data.summary);
      setSummarySource(response.data.source);
    } else {
      // The summary is a convenience; compose it locally if the service is unreachable.
      setSummary(curateInquirySummary(answers));
      setSummarySource("curated");
    }
    setSummaryState("ready");
  };

  const next = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 0 && !chosen.creating) return setError("Choose the option closest to your project.");
    if (step === 1 && !chosen.lookingFor) return setError("Choose what kind of support you need.");
    if (step === 3) return void prepareSummary();
    if (step === 4) return void send();
    goTo(step + 1);
  };

  const send = async () => {
    if (!contact.name.trim()) return setError("Please add your name.");
    if (!/^\S+@\S+\.\S{2,}$/.test(contact.email.trim())) return setError("Please add an email address we can reply to.");
    if (summary.trim().length < 10) return setError("Add a sentence or two so we understand the project.");

    setSendState("sending");
    setError("");
    const response = await postJson<{ status: "sent" | "not-configured" }>("/api/inquiry", {
      name: contact.name.trim(),
      email: contact.email.trim(),
      creating: answers.creating,
      lookingFor: answers.lookingFor,
      summary: summary.trim(),
      timing: answers.timing.trim(),
      project,
      website: contact.website,
    });
    if (!response.ok) {
      setSendState("error");
      setError(response.message);
      return;
    }
    setSendState(response.data.status);
    movedRef.current = true;
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const toggleFeeling = (quality: (typeof feelingChoices)[number]) => {
    const label = qualityCopy[quality].label.toLowerCase();
    const parts = answers.feeling.split(",").map((part) => part.trim()).filter(Boolean);
    const exists = parts.some((part) => part.toLowerCase() === label);
    const nextParts = exists ? parts.filter((part) => part.toLowerCase() !== label) : [...parts, label];
    setAnswers((current) => ({ ...current, feeling: nextParts.join(", ") }));
  };

  const mailto = siteConfig.contactEmail
    ? `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Project inquiry — ${answers.creating}`)}&body=${encodeURIComponent(`${summary}\n\n${contact.name}`)}`
    : null;

  if (sendState === "sent" || sendState === "not-configured") {
    return (
      <div className="smart-inquiry smart-inquiry--complete">
        <h2 className="heading-two" ref={headingRef} tabIndex={-1}>
          {sendState === "sent" ? <>Thank you. <em>It&apos;s with the studio.</em></> : <>Your inquiry is <em>ready.</em></>}
        </h2>
        {sendState === "sent" ? (
          <p className="copy">We read every inquiry personally and will reply to {contact.email.trim()}.</p>
        ) : (
          <>
            <p className="copy">
              Online sending isn&apos;t connected on this demonstration site yet, so nothing has been sent.
              {mailto ? " You can send the summary below by email in one step." : " Copy the summary below to keep it."}
            </p>
            <blockquote className="smart-inquiry__summary-quote">{summary}</blockquote>
            <div className="smart-inquiry__actions">
              {mailto ? <a className="studio-link--button studio-link--solid" href={mailto}>Email this to the studio</a> : null}
              <button className="studio-button studio-button--outline" onClick={() => void navigator.clipboard?.writeText(summary)} type="button">Copy summary</button>
            </div>
          </>
        )}
      </div>
    );
  }

  const radioName = `${baseId}-choice`;

  return (
    <form className="smart-inquiry" noValidate onSubmit={next}>
      <div aria-hidden="true" className="brief-builder__progress">
        {stepTitles.map((title, index) => (
          <span data-state={index < step ? "done" : index === step ? "current" : "next"} key={title} />
        ))}
      </div>
      <p className="metadata">Step {step + 1} of {stepTitles.length}</p>
      <h2 className="smart-inquiry__question" ref={headingRef} tabIndex={-1}>{stepTitles[step]}</h2>

      {step === 0 || step === 1 ? (
        <div aria-label={stepTitles[step]} className="choice-grid" role="radiogroup">
          {(step === 0 ? inquiryCreating : inquiryLookingFor).map((option) => {
            const field = step === 0 ? "creating" : "lookingFor";
            const checked = chosen[field] && answers[field] === option;
            return (
              <label className="choice choice--large" key={option}>
                <input
                  checked={checked}
                  name={`${radioName}-${field}`}
                  onChange={() => {
                    setAnswers((current) => ({ ...current, [field]: option as InquiryCreating & InquiryLookingFor }));
                    setChosen((current) => ({ ...current, [field]: true }));
                    setError("");
                  }}
                  type="radio"
                  value={option}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="smart-inquiry__feeling">
          <ul aria-label="Qualities" className="suggestion-list">
            {feelingChoices.map((quality) => {
              const pressed = answers.feeling.toLowerCase().split(",").map((part) => part.trim()).includes(quality);
              return (
                <li key={quality}>
                  <button aria-pressed={pressed} className="suggestion" onClick={() => toggleFeeling(quality)} type="button">
                    {qualityCopy[quality].label}
                  </button>
                </li>
              );
            })}
          </ul>
          <label className="field-label" htmlFor={`${baseId}-feeling`}>In your own words <span className="caption">(optional)</span></label>
          <textarea
            className="brief-builder__field"
            id={`${baseId}-feeling`}
            maxLength={300}
            onChange={(event) => setAnswers((current) => ({ ...current, feeling: event.target.value }))}
            placeholder="Quiet, warm, a little nostalgic…"
            rows={2}
            value={answers.feeling}
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="smart-inquiry__fields">
          <label className="field-label" htmlFor={`${baseId}-details`}>Place, scale, anything we should know <span className="caption">(optional)</span></label>
          <textarea
            className="brief-builder__field"
            id={`${baseId}-details`}
            maxLength={800}
            onChange={(event) => setAnswers((current) => ({ ...current, details: event.target.value }))}
            placeholder="Around sixty guests in a garden outside Florence…"
            rows={3}
            value={answers.details}
          />
          <label className="field-label" htmlFor={`${baseId}-timing`}>Timing <span className="caption">(optional)</span></label>
          <input
            className="text-field"
            id={`${baseId}-timing`}
            maxLength={120}
            onChange={(event) => setAnswers((current) => ({ ...current, timing: event.target.value }))}
            placeholder="Late September next year"
            type="text"
            value={answers.timing}
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="smart-inquiry__review" aria-busy={summaryState === "loading"}>
          {summaryState === "loading" ? <p className="caption" aria-live="polite">Putting your words together…</p> : (
            <>
              <label className="field-label" htmlFor={`${baseId}-summary`}>Edit anything that isn&apos;t quite right.</label>
              <textarea
                className="brief-builder__field smart-inquiry__summary"
                id={`${baseId}-summary`}
                maxLength={2000}
                onChange={(event) => setSummary(event.target.value)}
                rows={5}
                value={summary}
              />
              <SourceNote source={summarySource} />
              <div className="smart-inquiry__contact">
                <div>
                  <label className="field-label" htmlFor={`${baseId}-name`}>Your name</label>
                  <input autoComplete="name" className="text-field" id={`${baseId}-name`} maxLength={120} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} required type="text" value={contact.name} />
                </div>
                <div>
                  <label className="field-label" htmlFor={`${baseId}-email`}>Email</label>
                  <input autoComplete="email" className="text-field" id={`${baseId}-email`} inputMode="email" maxLength={200} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} required type="email" value={contact.email} />
                </div>
                <div aria-hidden="true" className="smart-inquiry__trap">
                  <label htmlFor={`${baseId}-website`}>Leave this empty</label>
                  <input autoComplete="off" id={`${baseId}-website`} onChange={(event) => setContact((current) => ({ ...current, website: event.target.value }))} tabIndex={-1} type="text" value={contact.website} />
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      <div aria-live="polite" className="brief-builder__feedback">
        {error ? <p className="small-copy brief-builder__error" role="alert">{error}</p> : null}
      </div>

      <div className="brief-builder__nav">
        {step > 0 ? <button className="studio-button studio-button--quiet" onClick={() => goTo(step - 1)} type="button">← Back</button> : <span />}
        <button className="studio-button studio-button--solid" disabled={sendState === "sending" || summaryState === "loading"} type="submit">
          {step === 4 ? (sendState === "sending" ? "Sending…" : "Send inquiry") : step === 3 ? "Review" : "Next →"}
        </button>
      </div>
    </form>
  );
}
