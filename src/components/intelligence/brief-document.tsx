"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { MatchList, PaletteSwatches, SourceNote } from "@/components/intelligence/result-parts";
import type { BriefResult } from "@/lib/discovery/results";

function briefAsText(brief: BriefResult) {
  return [
    `CREATIVE BRIEF — ${brief.title}`,
    "",
    `Overview\n${brief.overview}`,
    `Mood\n${brief.mood}`,
    `Visual language\n${brief.visualLanguage}`,
    `Light\n${brief.lighting}`,
    `Composition\n${brief.composition}`,
    `Colour\n${brief.colour} (${brief.palette.map((tone) => tone.label).join(", ")})`,
    `Shot concepts\n${brief.shots.map((shot, index) => `${index + 1}. ${shot.title} — ${shot.note}`).join("\n")}`,
    brief.avoid.length > 0 ? `Avoid\n${brief.avoid.map((item) => `– ${item}`).join("\n")}` : "",
    brief.references.length > 0 ? `Portfolio references\n${brief.references.map((reference) => `– ${reference.title}: ${reference.why}`).join("\n")}` : "",
    `Recommended service\n${brief.service.label} — ${brief.service.reason}`,
    `Next step\n${brief.nextStep}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function BriefDocument({ brief }: { brief: BriefResult }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(briefAsText(brief));
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  };

  const sections: { label: string; body: ReactNode }[] = [
    { label: "Overview", body: <p>{brief.overview}</p> },
    { label: "Mood", body: <p className="brief-document__mood">{brief.mood}</p> },
    { label: "Visual language", body: <p>{brief.visualLanguage}</p> },
    { label: "Light", body: <p>{brief.lighting}</p> },
    { label: "Composition", body: <p>{brief.composition}</p> },
    { label: "Colour", body: <><p>{brief.colour}</p><PaletteSwatches palette={brief.palette} /></> },
    {
      label: "Shot concepts",
      body: (
        <ol className="brief-document__shots">
          {brief.shots.map((shot) => (
            <li key={shot.title}><strong>{shot.title}</strong><span>{shot.note}</span></li>
          ))}
        </ol>
      ),
    },
  ];
  if (brief.avoid.length > 0) {
    sections.push({ label: "Avoid", body: <ul className="brief-document__avoid">{brief.avoid.map((item) => <li key={item}>{item}</li>)}</ul> });
  }
  if (brief.references.length > 0) {
    sections.push({ label: "From the portfolio", body: <MatchList compact headingLevel={4} matches={brief.references} /> });
  }
  sections.push({
    label: "Recommended service",
    body: <p><span className="brief-document__service">{brief.service.label}.</span> {brief.service.reason}</p>,
  });

  return (
    <article aria-labelledby="brief-document-title" className="brief-document">
      <header className="brief-document__header">
        <p className="metadata">Creative brief · Vedora Studio</p>
        <h3 className="brief-document__title" id="brief-document-title">{brief.title}</h3>
      </header>
      <div className="brief-document__body">
        {sections.map((section, index) => (
          <section className="brief-document__section" key={section.label}>
            <h4 className="brief-document__label">
              <span className="metadata">{String(index + 1).padStart(2, "0")}</span> {section.label}
            </h4>
            <div className="brief-document__content">{section.body}</div>
          </section>
        ))}
      </div>
      <footer className="brief-document__footer">
        <p className="copy">{brief.nextStep}</p>
        <div className="brief-document__actions">
          <Link className="studio-link--button studio-link--solid" href="/contact?from=brief">Send this brief to the studio</Link>
          <button className="studio-button studio-button--outline" onClick={() => void copy()} type="button">
            {copied === "copied" ? "Copied" : "Copy as text"}
          </button>
          <button className="studio-button studio-button--quiet" onClick={() => window.print()} type="button">Print</button>
        </div>
        <p aria-live="polite" className="caption">
          {copied === "failed" ? "Copying isn't available in this browser — select the text instead." : ""}
        </p>
        <SourceNote source={brief.source} />
      </footer>
    </article>
  );
}
