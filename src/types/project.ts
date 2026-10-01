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

export interface PhotographyProject {
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly location: string;
  readonly year: number;
  readonly description: string;
  readonly coverImage: ProjectImage;
  readonly gallery: readonly ProjectGallerySection[];
  readonly featured?: boolean;
  readonly discipline?: string;
  readonly client?: string;
  /** Marks demo work so it is not mistaken for commissioned client work. */
  readonly fictional: boolean;
  readonly caption?: string;
}
