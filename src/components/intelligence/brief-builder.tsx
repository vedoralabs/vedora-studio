"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BriefDocument } from "@/components/intelligence/brief-document";
import { qualityCopy } from "@/content/vocabulary";
import { briefScales, type BriefAnswers, type BriefResult, type BriefScale } from "@/lib/discovery/results";
import { postJson } from "@/lib/intelligence-client";
import { exploration, useExploration } from "@/lib/personalization/session-store";
import { visualQualities } from "@/types/project";

type TextField = Exclude<keyof BriefAnswers, "scale">;

interface Step {
  readonly field: keyof BriefAnswers;
  readonly question: string;
  readonly hint: string;
  readonly placeholder?: string;
  readonly suggestions?: readonly string[];
  readonly required?: boolean;
}

const steps: readonly Step[] = [
  {
    field: "subject",
    question: "What are you shooting?",
    hint: "A day, a collection, a space, a product, a person.",
    placeholder: "A small wedding in a hillside garden…",
    suggestions: ["A wedding", "A fashion collection", "A product launch", "A restaurant or hotel", "A portrait series"],
    required: true,
  },
  {
    field: "feeling",
    question: "What feeling should the images create?",
    hint: "Choose a few qualities, or describe it in your own words.",
    placeholder: "Calm, warm, a little nostalgic…",
    suggestions: visualQualities.filter((quality) => quality !== "experimental").map((quality) => qualityCopy[quality].label),
  },
  {
    field: "audience",
    question: "Who is the audience?",
    hint: "Who will see these images, and where?",
    placeholder: "Guests and family; a printed album…",
  },
  {
    field: "references",
    question: "What visual references do you like?",
    hint: "Films, painters, places, photographers — or a study from this portfolio.",
    placeholder: "Italian cinema, late afternoon light, Kyoto interiors…",
  },
  {
    field: "avoid",
    question: "What should the work avoid?",
    hint: "Anything that would feel wrong.",
    placeholder: "Posed group shots, heavy filters, flash…",
  },
  {
    field: "scale",
    question: "What is the project scale?",
    hint: "An honest sense of size is enough for now.",
  },
];

const emptyAnswers: BriefAnswers = { subject: "", feeling: "", audience: "", references: "", avoid: "", scale: "undecided" };

export function BriefBuilder() {
  const baseId = useId();
  const { brief: savedBrief } = useExploration();
  const [answers, setAnswers] = useState<BriefAnswers>(emptyAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<"editing" | "loading" | "error">("editing");
  const [error, setError] = useState("");
  const [showSaved, setShowSaved] = useState(true);
  const legendRef = useRef<HTMLLegendElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Move focus to each new question so keyboard and screen-reader users follow the flow.
  useEffect(() => {
    if (movedRef.current) legendRef.current?.focus();
  }, [stepIndex]);

  const setField = (field: TextField, value: string) => setAnswers((current) => ({ ...current, [field]: value }));

  const addSuggestion = (field: TextField, suggestion: string) => {
    const current = answers[field].trim();
    if (current.toLowerCase().includes(suggestion.toLowerCase())) return;
    setField(field, current ? `${current}, ${suggestion.toLowerCase()}` : suggestion);
  };

  const goTo = (index: number) => {
    movedRef.current = true;
    setError("");
    setStepIndex(index);
  };

  const compose = async () => {
    setStatus("loading");
    setError("");
    const response = await postJson<BriefResult>("/api/intelligence/brief", answers);
    if (!response.ok) {
      setStatus("error");
      setError(response.message);
      return;
    }
    exploration.saveBrief(response.data);
    setShowSaved(true);
    setStatus("editing");
    setStepIndex(0);
    window.requestAnimationFrame(() => documentRef.current?.focus());
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step.required && step.field !== "scale" && answers[step.field as TextField].trim().length < 2) {
      setError("A few words here will shape everything else.");
      return;
    }
    if (isLast) void compose();
    else goTo(stepIndex + 1);
  };

  if (savedBrief && showSaved) {
    return (
      <div className="brief-result" ref={documentRef} tabIndex={-1}>
        <BriefDocument brief={savedBrief} />
        <div className="brief-result__actions">
          <button
            className="studio-button studio-button--outline"
            onClick={() => {
              setShowSaved(false);
              setAnswers(emptyAnswers);
              goTo(0);
            }}
            type="button"
          >
            Start a new brief
          </button>
        </div>
      </div>
    );
  }

  const fieldId = `${baseId}-${step.field}`;
  const hintId = `${fieldId}-hint`;

  return (
    <form className="brief-builder" noValidate onSubmit={onSubmit}>
      <div className="brief-builder__progress" aria-hidden="true">
        {steps.map((item, index) => (
          <span data-state={index < stepIndex ? "done" : index === stepIndex ? "current" : "next"} key={item.field} />
        ))}
      </div>
      <fieldset className="brief-builder__step" disabled={status === "loading"} key={step.field}>
        <legend className="brief-builder__question" ref={legendRef} tabIndex={-1}>
          <span className="metadata">Question {stepIndex + 1} of {steps.length}</span>
          <span className="brief-builder__question-text">{step.question}</span>
        </legend>
        <p className="small-copy" id={hintId}>{step.hint}</p>

        {step.field === "scale" ? (
          <div className="choice-list" role="radiogroup" aria-describedby={hintId}>
            {briefScales.map((scale) => (
              <label className="choice" key={scale.id}>
                <input
                  checked={answers.scale === scale.id}
                  name="scale"
                  onChange={() => setAnswers((current) => ({ ...current, scale: scale.id as BriefScale }))}
                  type="radio"
                  value={scale.id}
                />
                <span>{scale.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <>
            <label className="visually-hidden" htmlFor={fieldId}>{step.question}</label>
            <textarea
              aria-describedby={hintId}
              aria-invalid={Boolean(error) || undefined}
              aria-required={step.required || undefined}
              className="brief-builder__field"
              id={fieldId}
              maxLength={step.field === "subject" || step.field === "audience" ? 240 : 300}
              onChange={(event) => setField(step.field as TextField, event.target.value)}
              placeholder={step.placeholder}
              rows={2}
              value={answers[step.field as TextField]}
            />
            {step.suggestions ? (
              <ul aria-label="Suggestions" className="suggestion-list">
                {step.suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button className="suggestion" onClick={() => addSuggestion(step.field as TextField, suggestion)} type="button">
                      + {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </fieldset>

      <div aria-live="polite" className="brief-builder__feedback">
        {error ? <p className="small-copy brief-builder__error" role="alert">{error}</p> : null}
        {status === "loading" ? <p className="caption">Composing your brief…</p> : null}
      </div>

      <div className="brief-builder__nav">
        {stepIndex > 0 ? (
          <button className="studio-button studio-button--quiet" onClick={() => goTo(stepIndex - 1)} type="button">← Back</button>
        ) : <span />}
        <div className="brief-builder__nav-end">
          {!step.required && !isLast ? (
            <button className="studio-button studio-button--quiet" onClick={() => goTo(stepIndex + 1)} type="button">Skip</button>
          ) : null}
          <button className="studio-button studio-button--solid" disabled={status === "loading"} type="submit">
            {isLast ? (status === "loading" ? "Composing…" : "Compose the brief") : "Next →"}
          </button>
        </div>
      </div>
    </form>
  );
}
