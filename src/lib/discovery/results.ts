import { projects } from "@/content/projects";
import { paletteCopy, qualityCopy, serviceCopy, type FacetName } from "@/content/vocabulary";
import {
  composeDirection,
  findGaps,
  mergeIntents,
  parseIntent,
  rankProjects,
  relevantMatches,
  suggestNextStep,
  suggestServices,
  termLabel,
  type DiscoveryIntent,
  type ProjectMatch,
  type VisualDirection,
} from "@/lib/discovery/engine";
import type { PhotographyProject, ProjectCategory, StudioServiceId } from "@/types/project";

/** `ai` = composed by the configured model and validated; `curated` = built from portfolio metadata alone. */
export type ResultSource = "ai" | "curated";

export interface MatchSummary {
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly location: string;
  readonly year: number;
  readonly image: { readonly src: string; readonly alt: string };
  readonly reasons: readonly string[];
  /** One sentence on why this work is relevant. */
  readonly why: string;
  readonly fit: number;
}

export interface InterpretedTerm {
  readonly facet: FacetName;
  readonly value: string;
  readonly label: string;
}

export interface ServiceRecommendation {
  readonly id: StudioServiceId;
  readonly label: string;
  readonly reason: string;
}

export interface DiscoverResult {
  readonly source: ResultSource;
  readonly query: string;
  readonly interpretation: readonly InterpretedTerm[];
  readonly avoid: readonly InterpretedTerm[];
  readonly matches: readonly MatchSummary[];
  /** Requested qualities the current archive does not show. */
  readonly gaps: readonly string[];
  readonly direction: VisualDirection;
  readonly services: readonly ServiceRecommendation[];
  readonly nextStep: string;
}

export function describeMatch(match: ProjectMatch): string {
  const { project, reasons } = match;
  if (reasons.length === 0) return project.description;
  const lowered = reasons.slice(0, 3).map((reason) => reason.toLowerCase());
  const listed = lowered.length > 1 ? `${lowered.slice(0, -1).join(", ")} and ${lowered[lowered.length - 1]}` : lowered[0];
  return `Shares the ${listed} you described.`;
}

export function summariseMatch(match: ProjectMatch, why?: string): MatchSummary {
  const { project } = match;
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location,
    year: project.year,
    image: { src: project.coverImage.src, alt: project.coverImage.alt },
    reasons: match.reasons,
    why: why ?? describeMatch(match),
    fit: Math.round(match.fit * 100) / 100,
  };
}

function interpreted(intent: DiscoveryIntent) {
  return {
    interpretation: intent.terms.map((term) => ({ ...term, label: termLabel(term) })),
    avoid: intent.avoid.map((term) => ({ ...term, label: termLabel(term) })),
  };
}

export function serviceRecommendations(intent: DiscoveryIntent, matches: readonly ProjectMatch[]): ServiceRecommendation[] {
  return suggestServices(intent, matches).map(({ id, reason }) => ({ id, label: serviceCopy[id].label, reason }));
}

/** Natural-language discovery from portfolio metadata alone. Safe to run in the browser or on the server. */
export function curateDiscovery(query: string, extra?: DiscoveryIntent): DiscoverResult {
  const intent = extra ? mergeIntents(parseIntent(query), extra) : parseIntent(query);
  const ranked = rankProjects(intent);
  const matches = relevantMatches(ranked);

  return {
    source: "curated",
    query,
    ...interpreted(intent),
    matches: matches.map((match) => summariseMatch(match)),
    gaps: findGaps(intent).map(termLabel),
    direction: composeDirection(intent, matches),
    services: serviceRecommendations(intent, matches),
    nextStep: suggestNextStep(intent),
  };
}

/* ------------------------------------------------------------------ */
/* Creative brief                                                      */
/* ------------------------------------------------------------------ */

export const briefScales = [
  { id: "moment", label: "A single day or moment" },
  { id: "series", label: "A considered series" },
  { id: "campaign", label: "A full campaign" },
  { id: "undecided", label: "Not sure yet" },
] as const;
export type BriefScale = (typeof briefScales)[number]["id"];

export interface BriefAnswers {
  readonly subject: string;
  readonly feeling: string;
  readonly audience: string;
  readonly references: string;
  readonly avoid: string;
  readonly scale: BriefScale;
}

export interface BriefShot {
  readonly title: string;
  readonly note: string;
}

export interface BriefResult {
  readonly source: ResultSource;
  readonly title: string;
  readonly overview: string;
  readonly mood: string;
  readonly visualLanguage: string;
  readonly lighting: string;
  readonly composition: string;
  readonly colour: string;
  readonly palette: readonly { label: string; swatch: string }[];
  readonly shots: readonly BriefShot[];
  readonly avoid: readonly string[];
  readonly references: readonly MatchSummary[];
  readonly service: ServiceRecommendation;
  readonly nextStep: string;
}

const shotLibrary: Readonly<Record<ProjectCategory | "General", readonly BriefShot[]>> = {
  Weddings: [
    { title: "The approach", note: "A wide, quiet frame of the place before anyone arrives, setting the light and the tone." },
    { title: "Hands and heirlooms", note: "Close details of rings, letters, fabric, and the small objects that carry the day." },
    { title: "The walk", note: "The couple moving through the landscape, photographed from a distance so the moment stays theirs." },
    { title: "The long table", note: "Faces lit from the table itself as the evening settles in." },
    { title: "In between", note: "Unposed glances and pauses between the planned moments." },
  ],
  Fashion: [
    { title: "Silhouette", note: "A full-length frame where the garment's shape reads clearly against the setting." },
    { title: "Material in motion", note: "Fabric caught mid-movement, with a fast enough shutter to hold texture." },
    { title: "The detail", note: "Close studies of construction, seams, and surface." },
    { title: "Place as partner", note: "Wider frames where the location echoes the collection's line and colour." },
    { title: "The quiet portrait", note: "A still, direct portrait to anchor the sequence." },
  ],
  Commercial: [
    { title: "The hero image", note: "One frame that holds the whole idea and works at every size." },
    { title: "Ritual and gesture", note: "Hands and people in use, showing how the product or place is lived with." },
    { title: "The setting", note: "Environmental frames that establish atmosphere and context." },
    { title: "Texture and material", note: "Detail images designed to sit beside copy and product information." },
    { title: "Crop-ready variants", note: "Versions composed for vertical, square, and wide placements from the start." },
  ],
  Editorial: [
    { title: "The opening spread", note: "A wide, atmospheric frame that sets the story before the subject appears." },
    { title: "The portrait", note: "A composed, direct portrait in natural light." },
    { title: "Place and colour", note: "Frames where the city or setting carries the palette." },
    { title: "Pause", note: "A quieter image to give the sequence breathing room." },
    { title: "The closing frame", note: "An image that resolves the story rather than repeating it." },
  ],
  Architecture: [
    { title: "Threshold", note: "A frame from one space into the next, using doors and openings to create depth." },
    { title: "Best light", note: "The space at its strongest hour, photographed as the light moves." },
    { title: "Material study", note: "Close frames of timber, stone, plaster, and joinery." },
    { title: "Human scale", note: "A single figure or object to show how the space is used." },
    { title: "The plan view", note: "A clear, corrected elevation for practical and press use." },
  ],
  Product: [
    { title: "The hero still life", note: "A single object given space, light, and a considered surface." },
    { title: "In the hand", note: "The product in use, showing scale and touch." },
    { title: "Material close-up", note: "Glaze, grain, weave, or finish photographed with raking light." },
    { title: "The set", note: "A collection arranged as a family, with rhythm and spacing." },
    { title: "Clean catalogue", note: "Consistent, neutral frames ready for e-commerce." },
  ],
  General: [
    { title: "The establishing frame", note: "A wide image that sets the place, the light, and the feeling." },
    { title: "The close study", note: "Details that reward a slower look." },
    { title: "The human moment", note: "A gesture or exchange that makes the story personal." },
    { title: "The quiet frame", note: "Negative space and stillness to pace the sequence." },
    { title: "The closing image", note: "A final frame that leaves room for the viewer." },
  ],
};

function firstSentence(text: string, fallback: string) {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function briefIntent(answers: BriefAnswers) {
  const wanted = parseIntent(`${answers.subject}. ${answers.feeling}. ${answers.references}.`);
  const unwanted = parseIntent(answers.avoid);
  return mergeIntents(wanted, { terms: [], avoid: [...unwanted.terms, ...unwanted.avoid], keywords: [] });
}

export function curateBrief(answers: BriefAnswers): BriefResult {
  const intent = briefIntent(answers);
  const matches = relevantMatches(rankProjects(intent), 3);
  const direction = composeDirection(intent, matches);
  const category = (intent.terms.find((term) => term.facet === "category")?.value ?? matches[0]?.project.category) as ProjectCategory | undefined;
  const services = serviceRecommendations(intent, matches);
  const scaleService: StudioServiceId = answers.scale === "campaign" ? "visual-production" : answers.scale === "series" ? "creative-direction" : "photography";
  const service = services.find((item) => item.id === scaleService) ?? {
    id: scaleService,
    label: serviceCopy[scaleService].label,
    reason: serviceCopy[scaleService].description,
  };
  const qualities = intent.terms.filter((term) => term.facet === "quality").map((term) => qualityCopy[term.value as keyof typeof qualityCopy]);
  const subject = firstSentence(answers.subject, "A new body of work");
  const avoidList = [
    ...intent.avoid.map(termLabel),
    ...answers.avoid.split(/[,;\n]/).map((item) => item.trim()).filter((item) => item.length > 2 && item.length < 80),
  ];

  return {
    source: "curated",
    title: subject.length > 70 ? `${subject.slice(0, 67)}…` : subject,
    overview: `${subject}, photographed for ${firstSentence(answers.audience, "the people it is made for").toLowerCase()}. The images should feel ${firstSentence(answers.feeling, "considered and true to the subject").toLowerCase().replace(/\.$/, "")}.`,
    mood: direction.headline,
    visualLanguage: qualities.length > 0
      ? qualities.map((quality) => quality.phrase.charAt(0).toUpperCase() + quality.phrase.slice(1)).slice(0, 2).join(". ") + "."
      : direction.summary,
    lighting: direction.lighting,
    composition: direction.composition,
    colour: direction.palette.length > 0
      ? `A restrained palette led by ${direction.palette.slice(0, 3).map((tone) => tone.label.toLowerCase()).join(", ")}, kept consistent across the sequence.`
      : "A restrained, natural palette kept consistent across the sequence.",
    palette: direction.palette.length > 0 ? direction.palette : [paletteCopy["warm-earth"], paletteCopy.ivory],
    shots: shotLibrary[category ?? "General"].slice(0, answers.scale === "moment" ? 4 : 5),
    avoid: Array.from(new Set(avoidList)).slice(0, 5),
    references: matches.map((match) => summariseMatch(match)),
    service,
    nextStep: suggestNextStep(intent),
  };
}

/* ------------------------------------------------------------------ */
/* Project storyteller                                                 */
/* ------------------------------------------------------------------ */

export interface StoryResult {
  readonly source: ResultSource;
  readonly slug: string;
  readonly interpretation: readonly string[];
  readonly notes: readonly { label: string; text: string }[];
}

export function curateStory(project: PhotographyProject): StoryResult {
  const intent: DiscoveryIntent = {
    terms: [
      ...project.facets.qualities.map((value) => ({ facet: "quality" as const, value })),
      ...project.facets.lighting.map((value) => ({ facet: "lighting" as const, value })),
      ...project.facets.palette.map((value) => ({ facet: "palette" as const, value })),
      ...project.facets.composition.map((value) => ({ facet: "composition" as const, value })),
    ],
    avoid: [],
    keywords: [],
  };
  const direction = composeDirection(intent, []);
  const moods = project.facets.moods.slice(0, 2).join(" and ");

  return {
    source: "curated",
    slug: project.slug,
    interpretation: [
      `${project.title} reads as a ${moods} study. ${direction.summary}`,
      `The sequence moves between ${project.facets.composition.slice(0, 2).map((value) => value.replace("-", " ")).join(" and ")} frames, letting ${project.facets.subjects.slice(0, 2).join(" and ")} carry the story rather than explain it.`,
    ],
    notes: [
      { label: "Light", text: direction.lighting },
      { label: "Composition", text: direction.composition },
      { label: "Palette", text: direction.palette.map((tone) => tone.label).join(", ") + "." },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Smart inquiry                                                       */
/* ------------------------------------------------------------------ */

export const inquiryCreating = ["Wedding", "Campaign", "Product", "Editorial", "Architecture", "Other"] as const;
export const inquiryLookingFor = ["Photography", "Creative direction", "Full visual production", "Other"] as const;
export type InquiryCreating = (typeof inquiryCreating)[number];
export type InquiryLookingFor = (typeof inquiryLookingFor)[number];

export interface InquiryAnswers {
  readonly creating: InquiryCreating;
  readonly lookingFor: InquiryLookingFor;
  readonly feeling: string;
  readonly details: string;
  readonly timing: string;
}

const creatingPhrase: Readonly<Record<InquiryCreating, string>> = {
  Wedding: "a wedding",
  Campaign: "a campaign",
  Product: "product photography",
  Editorial: "an editorial story",
  Architecture: "architecture or interiors photography",
  Other: "a new project",
};

export function curateInquirySummary(answers: InquiryAnswers): string {
  const looking = answers.lookingFor === "Other" ? "support from the studio" : answers.lookingFor.toLowerCase();
  const lines = [
    `You're planning ${creatingPhrase[answers.creating]} and are looking for ${looking}.`,
    answers.feeling.trim() ? `The work should feel ${answers.feeling.trim().replace(/\.$/, "").toLowerCase()}.` : "",
    answers.details.trim() ? answers.details.trim().replace(/([^.!?])$/, "$1.") : "",
    answers.timing.trim() ? `Timing: ${answers.timing.trim().replace(/\.$/, "")}.` : "",
  ];
  return lines.filter(Boolean).join(" ");
}

export function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
