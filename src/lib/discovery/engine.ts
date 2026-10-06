import { projects } from "@/content/projects";
import {
  categoryCopy,
  compositionCopy,
  lexicon,
  lightingCopy,
  locationCopy,
  moodCopy,
  negationWords,
  paletteCopy,
  qualityCopy,
  stopWords,
  type FacetName,
  type FacetTerm,
} from "@/content/vocabulary";
import type { PhotographyProject, StudioServiceId } from "@/types/project";

/** A structured reading of what a visitor described. */
export interface DiscoveryIntent {
  readonly terms: readonly FacetTerm[];
  readonly avoid: readonly FacetTerm[];
  /** Free words that may match project subjects, keywords, titles, or places. */
  readonly keywords: readonly string[];
}

export interface ProjectMatch {
  readonly project: PhotographyProject;
  readonly score: number;
  /** Share of the visitor's direction this project reflects, 0–1. */
  readonly fit: number;
  readonly reasons: readonly string[];
}

export interface VisualDirection {
  readonly headline: string;
  readonly summary: string;
  readonly lighting: string;
  readonly palette: readonly { label: string; swatch: string }[];
  readonly composition: string;
}

export interface ServiceSuggestion {
  readonly id: StudioServiceId;
  readonly reason: string;
}

const facetWeight: Readonly<Record<FacetName, number>> = {
  category: 5,
  quality: 3,
  mood: 2,
  lighting: 2.5,
  palette: 1.5,
  composition: 1.5,
  location: 2,
};
const keywordWeight = 1.5;
const avoidPenalty = 4;
const maxQueryLength = 600;

const lexiconPhraseLengths = [3, 2, 1] as const;

export const emptyIntent: DiscoveryIntent = { terms: [], avoid: [], keywords: [] };

function termKey(term: FacetTerm) {
  return `${term.facet}:${term.value}`;
}

function uniqueTerms(terms: readonly FacetTerm[]): FacetTerm[] {
  const seen = new Set<string>();
  return terms.filter((term) => {
    const key = termKey(term);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .slice(0, maxQueryLength)
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9&'\-\s.,;:!?]/g, " ")
    .replace(/([.,;:!?])/g, " $1 ")
    .split(/\s+/)
    .filter(Boolean)
    // "japanese-inspired" → "japanese inspired" unless the hyphenated form is itself a known phrase.
    .flatMap((token) => (token.includes("-") && !lexicon[token] ? token.split("-") : [token]))
    .filter(Boolean);
}

const clauseBreaks = new Set([".", ",", ";", ":", "!", "?", "but", "and", "though", "while"]);

/**
 * Translate natural language into structured facets without any model.
 * Longest phrases win, and negations ("no", "without", "rather than") apply until the clause ends.
 */
export function parseIntent(text: string): DiscoveryIntent {
  const tokens = tokenize(text);
  const terms: FacetTerm[] = [];
  const avoid: FacetTerm[] = [];
  const keywords: string[] = [];
  let negated = false;

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index];

    if (clauseBreaks.has(token)) {
      // "and"/"or" continue a negated list ("no flash and no posing"), punctuation and "but" end it.
      if (token !== "and") negated = false;
      index += 1;
      continue;
    }
    if (negationWords.has(token) || (token === "than" && tokens[index - 1] === "rather")) {
      negated = true;
      index += 1;
      continue;
    }

    let matched = false;
    for (const length of lexiconPhraseLengths) {
      if (index + length > tokens.length) continue;
      const phrase = tokens.slice(index, index + length).join(" ");
      const mapped = lexicon[phrase];
      if (!mapped) continue;
      (negated ? avoid : terms).push(...mapped);
      index += length;
      matched = true;
      break;
    }
    if (matched) continue;

    const word = token.replace(/^[-']+|[-']+$/g, "");
    if (word.length >= 3 && !stopWords.has(word) && !/^\d+$/.test(word) && word !== "rather") {
      if (!negated) keywords.push(word);
    }
    index += 1;
  }

  const avoidKeys = new Set(avoid.map(termKey));
  return {
    terms: uniqueTerms(terms).filter((term) => !avoidKeys.has(termKey(term))),
    avoid: uniqueTerms(avoid),
    keywords: Array.from(new Set(keywords)).slice(0, 12),
  };
}

/** Combine several intents (for example a typed query plus selected qualities). */
export function mergeIntents(...intents: readonly DiscoveryIntent[]): DiscoveryIntent {
  const avoid = uniqueTerms(intents.flatMap((intent) => intent.avoid));
  const avoidKeys = new Set(avoid.map(termKey));
  return {
    terms: uniqueTerms(intents.flatMap((intent) => intent.terms)).filter((term) => !avoidKeys.has(termKey(term))),
    avoid,
    keywords: Array.from(new Set(intents.flatMap((intent) => intent.keywords))).slice(0, 12),
  };
}

export function isEmptyIntent(intent: DiscoveryIntent) {
  return intent.terms.length === 0 && intent.avoid.length === 0 && intent.keywords.length === 0;
}

function projectHasTerm(project: PhotographyProject, term: FacetTerm): boolean {
  const { facets } = project;
  switch (term.facet) {
    case "category":
      return project.category === term.value;
    case "quality":
      return (facets.qualities as readonly string[]).includes(term.value);
    case "mood":
      return (facets.moods as readonly string[]).includes(term.value);
    case "lighting":
      return (facets.lighting as readonly string[]).includes(term.value);
    case "palette":
      return (facets.palette as readonly string[]).includes(term.value);
    case "composition":
      return (facets.composition as readonly string[]).includes(term.value);
    case "location":
      return (facets.locationType as readonly string[]).includes(term.value);
  }
}

function projectHaystack(project: PhotographyProject): string {
  return [
    project.title,
    project.location,
    project.discipline ?? "",
    project.description,
    ...project.facets.subjects,
    ...project.facets.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

function keywordMatches(project: PhotographyProject, keyword: string) {
  const haystack = projectHaystack(project);
  if (haystack.includes(keyword)) return true;
  // Light stemming so "dresses" finds "dress" and "tables" finds "table".
  const stem = keyword.replace(/(es|s)$/, "");
  return stem.length >= 4 && haystack.includes(stem);
}

export function termLabel(term: FacetTerm): string {
  switch (term.facet) {
    case "category":
      return categoryCopy[term.value as keyof typeof categoryCopy] ?? term.value;
    case "quality":
      return qualityCopy[term.value as keyof typeof qualityCopy]?.label ?? term.value;
    case "mood":
      return moodCopy[term.value as keyof typeof moodCopy] ?? term.value;
    case "lighting":
      return lightingCopy[term.value as keyof typeof lightingCopy]?.label ?? term.value;
    case "palette":
      return paletteCopy[term.value as keyof typeof paletteCopy]?.label ?? term.value;
    case "composition":
      return compositionCopy[term.value as keyof typeof compositionCopy]?.label ?? term.value;
    case "location":
      return locationCopy[term.value as keyof typeof locationCopy] ?? term.value;
  }
}

/** Rank the portfolio against an intent. Only projects with a genuine overlap are returned. */
export function rankProjects(intent: DiscoveryIntent, catalogue: readonly PhotographyProject[] = projects): ProjectMatch[] {
  if (isEmptyIntent(intent)) return [];

  const wanted = intent.terms;
  const wantsCategory = wanted.some((term) => term.facet === "category");
  const possible = wanted.reduce((sum, term) => sum + facetWeight[term.facet], 0) + intent.keywords.length * keywordWeight;

  return catalogue
    .map((project) => {
      const reasons: string[] = [];
      let score = 0;

      for (const term of wanted) {
        if (!projectHasTerm(project, term)) continue;
        score += facetWeight[term.facet];
        reasons.push(termLabel(term));
      }
      for (const keyword of intent.keywords) {
        if (!keywordMatches(project, keyword)) continue;
        score += keywordWeight;
      }
      for (const term of intent.avoid) {
        if (projectHasTerm(project, term)) score -= avoidPenalty;
      }
      if (wantsCategory && !wanted.some((term) => term.facet === "category" && projectHasTerm(project, term))) {
        score *= 0.35;
      }

      const fit = possible > 0 ? Math.max(0, Math.min(1, score / possible)) : 0;
      return { project, score, fit, reasons: Array.from(new Set(reasons)).slice(0, 4) };
    })
    .filter((match) => match.score > 0.5)
    .sort((a, b) => b.score - a.score || Number(Boolean(b.project.featured)) - Number(Boolean(a.project.featured)));
}

/**
 * Keep the work that genuinely answers the request. When nothing is strong,
 * return the closest two so the visitor still has somewhere to look, flagged by a low fit.
 */
export function relevantMatches(matches: readonly ProjectMatch[], limit = 4): ProjectMatch[] {
  const strong = matches.filter((match) => match.fit >= 0.3);
  return (strong.length > 0 ? strong : matches.slice(0, 2)).slice(0, limit);
}

/** Requested terms that nothing in the current archive reflects, so the interface can say so honestly. */
export function findGaps(intent: DiscoveryIntent, catalogue: readonly PhotographyProject[] = projects): FacetTerm[] {
  return intent.terms.filter((term) => !catalogue.some((project) => projectHasTerm(project, term)));
}

function joinNatural(words: readonly string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mostCommon<T extends string>(values: readonly T[]): T[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
}

/**
 * Compose an editorial visual direction from the visitor's words and the work that matched.
 * Requested values lead; matched portfolio facets fill in what the visitor left open.
 */
export function composeDirection(intent: DiscoveryIntent, matches: readonly ProjectMatch[]): VisualDirection {
  const top = matches.slice(0, 3).map((match) => match.project);
  const requested = (facet: FacetName) => intent.terms.filter((term) => term.facet === facet).map((term) => term.value);

  const qualities = Array.from(new Set([...requested("quality"), ...mostCommon(top.flatMap((project) => project.facets.qualities))]))
    .filter((value): value is keyof typeof qualityCopy => value in qualityCopy)
    .slice(0, 3);
  const moodsWanted = Array.from(new Set([...requested("mood"), ...mostCommon(top.flatMap((project) => project.facets.moods))]))
    .filter((value): value is keyof typeof moodCopy => value in moodCopy)
    .slice(0, 2);
  const lighting = Array.from(new Set([...requested("lighting"), ...mostCommon(top.flatMap((project) => project.facets.lighting))]))
    .filter((value): value is keyof typeof lightingCopy => value in lightingCopy)
    .slice(0, 2);
  const palette = Array.from(new Set([...requested("palette"), ...mostCommon(top.flatMap((project) => project.facets.palette))]))
    .filter((value): value is keyof typeof paletteCopy => value in paletteCopy)
    .slice(0, 4);
  const composition = Array.from(new Set([...requested("composition"), ...mostCommon(top.flatMap((project) => project.facets.composition))]))
    .filter((value): value is keyof typeof compositionCopy => value in compositionCopy)
    .slice(0, 2);

  const requestedWords = intent.terms
    .filter((term) => term.facet === "mood" || term.facet === "quality")
    .map(termLabel);
  const headlineWords = Array.from(new Set([...requestedWords, ...moodsWanted.map((mood) => moodCopy[mood]), ...qualities.map((quality) => qualityCopy[quality].label)]))
    .slice(0, 3)
    .map((word) => word.toLowerCase());
  const headline = headlineWords.length > 0 ? `${capitalize(joinNatural(headlineWords))}.` : "A direction still taking shape.";

  const qualitySentence = qualities.length > 0
    ? `${capitalize(qualityCopy[qualities[0]].phrase)}${qualities[1] ? ` — balanced by ${qualityCopy[qualities[1]].phrase}` : ""}.`
    : "Start from the feeling you want people to remember, then let light and place follow.";
  const avoidLabels = intent.avoid.map(termLabel).map((label) => label.toLowerCase());
  const avoidSentence = avoidLabels.length > 0 ? ` Steer clear of ${joinNatural(avoidLabels)}.` : "";

  return {
    headline,
    summary: `${qualitySentence}${avoidSentence}`,
    lighting: lighting.length > 0
      ? capitalize(joinNatural(lighting.map((value) => lightingCopy[value].phrase))) + "."
      : "Natural light first, shaped on location rather than added.",
    palette: palette.map((value) => paletteCopy[value]),
    composition: composition.length > 0
      ? capitalize(joinNatural(composition.map((value) => compositionCopy[value].phrase))) + "."
      : "A sequence that moves between wide context and close detail.",
  };
}

export function suggestServices(intent: DiscoveryIntent, matches: readonly ProjectMatch[]): ServiceSuggestion[] {
  const categories = intent.terms.filter((term) => term.facet === "category").map((term) => term.value);
  const fromWork = mostCommon(matches.slice(0, 3).flatMap((match) => match.project.facets.services));
  const ids = new Set<StudioServiceId>(["photography", ...fromWork]);
  if (categories.includes("Commercial") || categories.includes("Fashion") || intent.keywords.includes("campaign")) {
    ids.add("creative-direction");
  }

  return Array.from(ids).slice(0, 3).map((id) => ({
    id,
    reason:
      id === "photography"
        ? "The heart of every commission: a considered set of photographs."
        : id === "creative-direction"
          ? "Useful when the images need to share one point of view across a campaign or story."
          : "For work that needs locations, styling, crew, and delivery handled end to end.",
  }));
}

export function suggestNextStep(intent: DiscoveryIntent): string {
  const category = intent.terms.find((term) => term.facet === "category")?.value;
  switch (category) {
    case "Weddings":
      return "Share your date, the place, and how you want the day to feel. We'll reply with a considered approach.";
    case "Fashion":
    case "Commercial":
      return "Send a short brief with timing, deliverables, and references, and we'll propose a direction and production plan.";
    case "Product":
      return "Tell us how many products, where the images will live, and the feeling of the brand.";
    case "Architecture":
      return "Share the space, its best light of day, and how the images will be used.";
    default:
      return "Tell us what you are making and when. We'll reply with how we'd approach it.";
  }
}

/** A compact, factual catalogue for grounding a language model. Never includes invented details. */
export function catalogueForModel(catalogue: readonly PhotographyProject[] = projects) {
  return catalogue.map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    discipline: project.discipline,
    description: project.description,
    fictionalDemo: project.fictional,
    facets: project.facets,
  }));
}
