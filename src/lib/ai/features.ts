import "server-only";
import { projects } from "@/content/projects";
import { facetNames, paletteCopy, serviceCopy, type FacetTerm } from "@/content/vocabulary";
import { cleanText } from "@/lib/ai/http";
import { list, object, oneOf, text, validate, type Schema } from "@/lib/ai/schema";
import { quoteVisitorInput, runStructured, sharedRules } from "@/lib/ai/run";
import {
  catalogueForModel,
  findGaps,
  rankProjects,
  termLabel,
  type DiscoveryIntent,
  type ProjectMatch,
} from "@/lib/discovery/engine";
import {
  briefScales,
  curateBrief,
  curateDiscovery,
  curateInquirySummary,
  curateStory,
  findProject,
  inquiryCreating,
  inquiryLookingFor,
  summariseMatch,
  type BriefAnswers,
  type BriefResult,
  type DiscoverResult,
  type InquiryAnswers,
  type StoryResult,
} from "@/lib/discovery/results";
import {
  compositionTypes,
  lightingTypes,
  locationTypes,
  moods,
  paletteTones,
  projectCategories,
  studioServiceIds,
  visualQualities,
  type PaletteTone,
  type StudioServiceId,
} from "@/types/project";

const slugs = projects.map((project) => project.slug);

const allowedValues: Readonly<Record<FacetTerm["facet"], readonly string[]>> = {
  category: projectCategories,
  quality: visualQualities,
  mood: moods,
  lighting: lightingTypes,
  palette: paletteTones,
  composition: compositionTypes,
  location: locationTypes,
};

const vocabularyForModel = JSON.stringify(allowedValues);
const catalogueJson = JSON.stringify(catalogueForModel());

/** Keep only facet terms that exist in the studio vocabulary. */
function groundTerms(terms: readonly FacetTerm[]): FacetTerm[] {
  const seen = new Set<string>();
  return terms.filter((term) => {
    const key = `${term.facet}:${term.value}`;
    if (!allowedValues[term.facet]?.includes(term.value) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const termSchema = object({ facet: oneOf(facetNames), value: text(40) });

/* ------------------------------------------------------------------ */
/* Discovery and concierge                                             */
/* ------------------------------------------------------------------ */

export const discoverInputSchema: Schema = object(
  {
    query: { type: "string", minLength: 2, maxLength: 500 },
    previous: list(text(300), 3),
  },
  ["query"],
);

const discoverOutputSchema = object({
  interpretation: list(termSchema, 10),
  avoid: list(termSchema, 6),
  picks: list(object({ slug: oneOf(slugs), why: text(220) }), 4),
  direction: object({
    headline: text(90, "Three or four words, editorial, ending with a full stop."),
    summary: text(420, "Two sentences describing the visual direction."),
    lighting: text(280),
    composition: text(280),
  }),
  palette: list(oneOf(paletteTones), 4),
  services: list(object({ id: oneOf(studioServiceIds), reason: text(200) }), 3),
  nextStep: text(260),
});

interface DiscoverModelOutput {
  interpretation: FacetTerm[];
  avoid: FacetTerm[];
  picks: { slug: string; why: string }[];
  direction: { headline: string; summary: string; lighting: string; composition: string };
  palette: PaletteTone[];
  services: { id: StudioServiceId; reason: string }[];
  nextStep: string;
}

export async function discover(input: { query: string; previous?: string[] }): Promise<DiscoverResult> {
  const query = cleanText(input.query, 500);
  const previous = (input.previous ?? []).map((item) => cleanText(item, 300)).filter(Boolean).slice(-3);
  const curated = curateDiscovery([...previous, query].join(". "));

  const outcome = await runStructured<DiscoverModelOutput>({
    feature: "discover",
    system: `${sharedRules}

Task: interpret what the visitor is looking for and guide them through the studio's portfolio.
- "interpretation" and "avoid" must use only facet values from the vocabulary.
- "picks" must only reference portfolio slugs that genuinely relate to the request, best first. Return an empty list if nothing fits; never force a match.
- "why" is one sentence grounded in that project's supplied facets.
- If the visitor wants something the portfolio does not show, say so plainly in the summary and describe how the studio would approach it.`,
    user: [
      `Vocabulary: ${vocabularyForModel}`,
      `Portfolio: ${catalogueJson}`,
      previous.length > 0 ? quoteVisitorInput("earlier_messages", previous.join("\n")) : "",
      quoteVisitorInput("request", query),
    ].filter(Boolean).join("\n\n"),
    schema: discoverOutputSchema,
    maxOutputTokens: 1_500,
  });

  if (outcome.status !== "ok") return curated;
  const output = outcome.value;

  const intent: DiscoveryIntent = { terms: groundTerms(output.interpretation), avoid: groundTerms(output.avoid), keywords: [] };
  const ranking = new Map<string, ProjectMatch>(rankProjects(intent).map((match) => [match.project.slug, match]));
  const pickedSlugs = Array.from(new Set(output.picks.map((pick) => pick.slug)));
  const matches = pickedSlugs.flatMap((slug) => {
    const project = findProject(slug);
    if (!project) return [];
    const ranked = ranking.get(slug) ?? { project, score: 0, fit: 0.3, reasons: [] };
    return [summariseMatch(ranked, output.picks.find((pick) => pick.slug === slug)?.why)];
  });
  const serviceIds = Array.from(new Set(output.services.map((service) => service.id)));

  return {
    source: "ai",
    query,
    interpretation: intent.terms.map((term) => ({ ...term, label: termLabel(term) })),
    avoid: intent.avoid.map((term) => ({ ...term, label: termLabel(term) })),
    matches,
    gaps: findGaps(intent).map(termLabel),
    direction: {
      headline: output.direction.headline,
      summary: output.direction.summary,
      lighting: output.direction.lighting,
      composition: output.direction.composition,
      palette: Array.from(new Set(output.palette)).map((tone) => paletteCopy[tone]),
    },
    services: serviceIds.length > 0
      ? serviceIds.map((id) => ({ id, label: serviceCopy[id].label, reason: output.services.find((service) => service.id === id)?.reason ?? "" }))
      : curated.services,
    nextStep: output.nextStep || curated.nextStep,
  };
}

/* ------------------------------------------------------------------ */
/* Creative brief                                                      */
/* ------------------------------------------------------------------ */

export const briefInputSchema: Schema = object({
  subject: { type: "string", minLength: 2, maxLength: 240 },
  feeling: text(300),
  audience: text(240),
  references: text(300),
  avoid: text(300),
  scale: oneOf(briefScales.map((scale) => scale.id)),
});

const briefOutputSchema = object({
  title: text(80),
  overview: text(500),
  mood: text(120),
  visualLanguage: text(500),
  lighting: text(320),
  composition: text(320),
  colour: text(320),
  palette: list(oneOf(paletteTones), 5),
  shots: list(object({ title: text(60), note: text(220) }), 6),
  avoid: list(text(100), 5),
  references: list(object({ slug: oneOf(slugs), why: text(220) }), 3),
  service: oneOf(studioServiceIds),
  serviceReason: text(220),
  nextStep: text(260),
});

interface BriefModelOutput {
  title: string;
  overview: string;
  mood: string;
  visualLanguage: string;
  lighting: string;
  composition: string;
  colour: string;
  palette: PaletteTone[];
  shots: { title: string; note: string }[];
  avoid: string[];
  references: { slug: string; why: string }[];
  service: StudioServiceId;
  serviceReason: string;
  nextStep: string;
}

export async function buildBrief(rawAnswers: BriefAnswers): Promise<BriefResult> {
  const answers: BriefAnswers = {
    subject: cleanText(rawAnswers.subject, 240),
    feeling: cleanText(rawAnswers.feeling, 300),
    audience: cleanText(rawAnswers.audience, 240),
    references: cleanText(rawAnswers.references, 300),
    avoid: cleanText(rawAnswers.avoid, 300),
    scale: rawAnswers.scale,
  };
  const curated = curateBrief(answers);

  const outcome = await runStructured<BriefModelOutput>({
    feature: "brief",
    system: `${sharedRules}

Task: write a concise creative brief for a photography project, as a studio creative director would.
- Write in second person plural ("the images", "we") and keep every field tight.
- "shots" are 4 to 6 concrete shot concepts specific to the visitor's subject.
- "references" may only cite portfolio slugs that genuinely share qualities with the brief; return an empty list if none do.
- Do not promise outcomes, prices, dates, or availability.`,
    user: [
      `Portfolio: ${catalogueJson}`,
      quoteVisitorInput("subject", answers.subject),
      quoteVisitorInput("feeling", answers.feeling),
      quoteVisitorInput("audience", answers.audience),
      quoteVisitorInput("references", answers.references),
      quoteVisitorInput("avoid", answers.avoid),
      `Scale: ${briefScales.find((scale) => scale.id === answers.scale)?.label ?? "Not sure yet"}`,
    ].join("\n\n"),
    schema: briefOutputSchema,
    maxOutputTokens: 2_000,
  });

  if (outcome.status !== "ok") return curated;
  const output = outcome.value;
  const references = Array.from(new Set(output.references.map((reference) => reference.slug))).flatMap((slug) => {
    const project = findProject(slug);
    if (!project) return [];
    return [summariseMatch({ project, score: 0, fit: 0.5, reasons: [] }, output.references.find((reference) => reference.slug === slug)?.why)];
  });

  return {
    source: "ai",
    title: output.title,
    overview: output.overview,
    mood: output.mood,
    visualLanguage: output.visualLanguage,
    lighting: output.lighting,
    composition: output.composition,
    colour: output.colour,
    palette: output.palette.length > 0 ? Array.from(new Set(output.palette)).map((tone) => paletteCopy[tone]) : curated.palette,
    shots: output.shots.length >= 3 ? output.shots : curated.shots,
    avoid: output.avoid,
    references,
    service: { id: output.service, label: serviceCopy[output.service].label, reason: output.serviceReason },
    nextStep: output.nextStep,
  };
}

/* ------------------------------------------------------------------ */
/* Project storyteller                                                 */
/* ------------------------------------------------------------------ */

export const storyInputSchema: Schema = object({ slug: oneOf(slugs) });

const storyOutputSchema = object({
  interpretation: list(text(600), 3),
  notes: list(object({ label: oneOf(["Light", "Composition", "Palette", "Mood", "Sequence"]), text: text(280) }), 4),
});

const storyCache = new Map<string, StoryResult>();

export async function tellStory(slug: string): Promise<StoryResult | null> {
  const project = findProject(slug);
  if (!project) return null;
  const cached = storyCache.get(slug);
  if (cached) return cached;

  const curated = curateStory(project);
  const facts = catalogueForModel([project])[0];
  const outcome = await runStructured<{ interpretation: string[]; notes: { label: string; text: string }[] }>({
    feature: "story",
    system: `${sharedRules}

Task: offer a short interpretation of the creative intent behind one portfolio study, for a visitor viewing it.
- Interpret only what the supplied metadata describes: light, palette, composition, mood, subjects.
- This is interpretation, not fact. Never state where, when, for whom, or how it was made beyond the supplied fields.
- Two or three short paragraphs, then up to four notes.`,
    user: `Project: ${JSON.stringify(facts)}`,
    schema: storyOutputSchema,
    maxOutputTokens: 1_000,
  });

  const result: StoryResult = outcome.status === "ok" && outcome.value.interpretation.length > 0
    ? { source: "ai", slug, interpretation: outcome.value.interpretation, notes: outcome.value.notes }
    : curated;
  // Only cache model results; curated stories are instant to rebuild.
  if (result.source === "ai") storyCache.set(slug, result);
  return result;
}

/* ------------------------------------------------------------------ */
/* Smart inquiry                                                       */
/* ------------------------------------------------------------------ */

export const inquirySummaryInputSchema: Schema = object({
  creating: oneOf(inquiryCreating),
  lookingFor: oneOf(inquiryLookingFor),
  feeling: text(300),
  details: text(800),
  timing: text(120),
});

export async function summariseInquiry(rawAnswers: InquiryAnswers): Promise<{ source: "ai" | "curated"; summary: string }> {
  const answers: InquiryAnswers = {
    creating: rawAnswers.creating,
    lookingFor: rawAnswers.lookingFor,
    feeling: cleanText(rawAnswers.feeling, 300),
    details: cleanText(rawAnswers.details, 800),
    timing: cleanText(rawAnswers.timing, 120),
  };
  const curated = curateInquirySummary(answers);

  const outcome = await runStructured<{ summary: string }>({
    feature: "inquiry-summary",
    system: `${sharedRules}

Task: restate a visitor's project inquiry as a concise summary the studio will read, written to the visitor ("You're planning…").
- 2 to 4 sentences. Keep every fact they gave; add none. No pricing, availability, or promises.`,
    user: [
      `Creating: ${answers.creating}`,
      `Looking for: ${answers.lookingFor}`,
      quoteVisitorInput("feeling", answers.feeling),
      quoteVisitorInput("details", answers.details),
      quoteVisitorInput("timing", answers.timing),
    ].join("\n\n"),
    schema: object({ summary: text(900) }),
    maxOutputTokens: 600,
  });

  return outcome.status === "ok" && outcome.value.summary.trim().length > 20
    ? { source: "ai", summary: outcome.value.summary.trim() }
    : { source: "curated", summary: curated };
}

export { validate };
