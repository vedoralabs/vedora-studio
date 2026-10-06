export const projectCategories = [
  "Weddings",
  "Fashion",
  "Commercial",
  "Editorial",
  "Architecture",
  "Product",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export interface ProjectImage {
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  readonly aspectRatio?: string;
  readonly objectPosition?: string;
}

export const galleryLayouts = [
  "fullBleed",
  "split",
  "asymmetric",
  "stacked",
  "threeUp",
  "horizontal",
] as const;

export type GalleryLayout = (typeof galleryLayouts)[number];

export interface ProjectGallerySection {
  readonly layout: GalleryLayout;
  readonly images: readonly ProjectImage[];
  readonly caption?: string;
}

/** Visual qualities a visitor can choose in the style explorer. */
export const visualQualities = [
  "cinematic",
  "raw",
  "intimate",
  "minimal",
  "dramatic",
  "warm",
  "monochrome",
  "architectural",
  "editorial",
  "nostalgic",
  "experimental",
] as const;

export type VisualQuality = (typeof visualQualities)[number];

export const moods = ["quiet", "tender", "romantic", "contemplative", "sensual", "convivial", "timeless", "serene"] as const;
export type Mood = (typeof moods)[number];

export const lightingTypes = ["golden-hour", "dusk", "candlelight", "window-light", "open-shade", "dappled", "hard-sun"] as const;
export type Lighting = (typeof lightingTypes)[number];

export const paletteTones = ["warm-earth", "ivory", "burgundy", "terracotta", "celadon", "candle-gold", "walnut", "sea-blue"] as const;
export type PaletteTone = (typeof paletteTones)[number];

export const compositionTypes = ["environmental", "detail", "portrait", "still-life", "layered-depth", "negative-space", "movement", "overhead"] as const;
export type Composition = (typeof compositionTypes)[number];

export const locationTypes = ["villa-garden", "historic-courtyard", "city-street", "terrace", "traditional-interior", "dining-room", "studio"] as const;
export type LocationType = (typeof locationTypes)[number];

export const studioServiceIds = ["photography", "creative-direction", "visual-production"] as const;
export type StudioServiceId = (typeof studioServiceIds)[number];

/**
 * Descriptive metadata that powers search, recommendations, and the style explorer.
 * Every value describes what is visible in the supplied photography; none of it is a claim about clients or results.
 */
export interface ProjectFacets {
  readonly subjects: readonly string[];
  readonly qualities: readonly VisualQuality[];
  readonly moods: readonly Mood[];
  readonly lighting: readonly Lighting[];
  readonly palette: readonly PaletteTone[];
  readonly composition: readonly Composition[];
  readonly locationType: readonly LocationType[];
  readonly keywords: readonly string[];
  readonly services: readonly StudioServiceId[];
}

export interface PhotographyProject {
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly location: string;
  readonly year: number;
  readonly description: string;
  readonly coverImage: ProjectImage;
  readonly gallery: readonly ProjectGallerySection[];
  readonly facets: ProjectFacets;
  readonly featured?: boolean;
  readonly discipline?: string;
  readonly client?: string;
  /** Marks demo work so it is not mistaken for commissioned client work. */
  readonly fictional: boolean;
  readonly caption?: string;
}
