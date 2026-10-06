import type { PhotographyProject } from "@/types/project";

/**
 * Fictional sample work and generated local demo photography only.
 * Facets describe what is visible in each photograph so search and recommendations stay grounded in real content.
 */
export const projects: readonly PhotographyProject[] = [
  {
    slug: "the-quiet-vow",
    title: "The Quiet Vow",
    category: "Weddings",
    location: "Tuscany, Italy",
    year: 2025,
    description: "An intimate celebration shaped by warm light, family ritual, and unhurried moments.",
    caption: "An evening held in candlelight.",
    discipline: "Wedding reportage",
    facets: {
      subjects: ["couple", "wedding dinner", "table setting", "garden path", "villa"],
      qualities: ["cinematic", "intimate", "warm", "nostalgic"],
      moods: ["romantic", "tender", "timeless", "convivial"],
      lighting: ["dusk", "candlelight", "golden-hour"],
      palette: ["candle-gold", "ivory", "warm-earth"],
      composition: ["environmental", "detail", "layered-depth"],
      locationType: ["villa-garden", "dining-room"],
      keywords: ["wedding", "tuscany", "italy", "cypress", "candles", "reception", "olive", "linen", "celebration", "family"],
      services: ["photography"],
    },
    coverImage: {
      src: "/images/projects/the-quiet-vow.jpg",
      alt: "A couple walking a garden path beneath cypress trees toward a softly lit villa at dusk",
    },
    gallery: [
      {
        layout: "fullBleed",
        images: [{
          src: "/images/projects/quiet-vow-dinner.png",
          alt: "A couple's hands meet above a candlelit wedding table among olive branches and linen",
        }],
        caption: "An evening carried by candlelight.",
      },
      {
        layout: "split",
        images: [
          { src: "/images/projects/the-quiet-vow.jpg", alt: "A cypress-lined garden path leading to a Tuscan villa at dusk" },
          { src: "/images/projects/quiet-vow-dinner.png", alt: "Warm candlelight and flowers across a long reception table" },
        ],
      },
    ],
    featured: true,
    fictional: true,
  },
  {
    slug: "form-in-motion",
    title: "Form in Motion",
    category: "Fashion",
    location: "Copenhagen, Denmark",
    year: 2025,
    description: "A study of sculptural silhouettes, tactile fabric, and the quiet energy between frames.",
    discipline: "Fashion editorial",
    facets: {
      subjects: ["model", "gown", "silk", "stone architecture"],
      qualities: ["cinematic", "dramatic", "editorial", "warm"],
      moods: ["sensual", "timeless"],
      lighting: ["golden-hour", "hard-sun"],
      palette: ["burgundy", "warm-earth", "candle-gold"],
      composition: ["movement", "environmental", "detail", "portrait"],
      locationType: ["historic-courtyard", "terrace"],
      keywords: ["fashion", "silhouette", "fabric", "couture", "gown", "dress", "stone", "shadow", "campaign", "movement"],
      services: ["photography", "creative-direction"],
    },
    coverImage: {
      src: "/images/projects/form-in-motion-sample.jpg",
      alt: "A model in a sculptural burgundy dress crossing a stone courtyard at golden hour",
    },
    gallery: [
      {
        layout: "asymmetric",
        images: [
          { src: "/images/homepage/hero-editorial.png", alt: "A fashion portrait in a dark sculptural gown against stone at dusk" },
          { src: "/images/projects/form-in-motion-detail.png", alt: "Burgundy silk moving across weathered limestone steps" },
        ],
        caption: "Movement held for a moment.",
      },
      {
        layout: "horizontal",
        images: [
          { src: "/images/projects/form-in-motion-sample.jpg", alt: "A burgundy silhouette crossing a sunlit stone courtyard" },
          { src: "/images/projects/form-in-motion-detail.png", alt: "A close study of silk and sun-warmed stone" },
          { src: "/images/homepage/hero-editorial.png", alt: "A model in a dark gown framed by a quiet stone passage" },
        ],
        caption: "Silhouette, texture, and light.",
      },
    ],
    featured: true,
    fictional: true,
  },
  {
    slug: "objects-of-use",
    title: "Objects of Use",
    category: "Product",
    location: "Studio",
    year: 2024,
    description: "Quiet still life studies that bring everyday objects, handmade surfaces, and natural light into focus.",
    discipline: "Still life & product",
    facets: {
      subjects: ["ceramics", "vase", "cup", "linen", "olive branch"],
      qualities: ["minimal", "warm", "editorial"],
      moods: ["quiet", "serene", "contemplative"],
      lighting: ["window-light", "dappled"],
      palette: ["ivory", "celadon", "warm-earth"],
      composition: ["still-life", "negative-space", "detail"],
      locationType: ["studio"],
      keywords: ["product", "still life", "handmade", "craft", "texture", "tableware", "objects", "materials", "e-commerce", "brand"],
      services: ["photography", "creative-direction"],
    },
    coverImage: {
      src: "/images/projects/objects-of-use.png",
      alt: "A handmade celadon ceramic vase and cup resting on warm limestone in window light",
    },
    gallery: [
      {
        layout: "split",
        images: [
          { src: "/images/projects/objects-of-use.png", alt: "A sculptural ceramic vessel and cup in soft window light" },
          { src: "/images/projects/objects-of-use-detail.png", alt: "A handmade ceramic cup beside linen and an olive branch" },
        ],
        caption: "A closer look at material and touch.",
      },
    ],
    fictional: true,
  },
  {
    slug: "a-place-to-pause",
    title: "A Place to Pause",
    category: "Architecture",
    location: "Kyoto, Japan",
    year: 2024,
    description: "A quiet study of timber, filtered light, and the human scale of a contemplative interior.",
    discipline: "Architecture & interiors",
    facets: {
      subjects: ["interior", "timber", "chair", "corridor", "garden", "stone basin"],
      qualities: ["architectural", "minimal", "cinematic", "warm"],
      moods: ["contemplative", "serene", "quiet"],
      lighting: ["window-light", "dappled"],
      palette: ["walnut", "warm-earth", "ivory"],
      composition: ["layered-depth", "negative-space", "environmental"],
      locationType: ["traditional-interior"],
      keywords: ["architecture", "interiors", "japan", "japanese", "kyoto", "timber", "wood", "shoji", "moss", "garden", "space", "design"],
      services: ["photography"],
    },
    coverImage: {
      src: "/images/projects/a-place-to-pause.png",
      alt: "A quiet timber interior with a sculptural chair in patterned morning light",
    },
    gallery: [
      {
        layout: "threeUp",
        images: [
          { src: "/images/projects/a-place-to-pause.png", alt: "A sculptural wooden chair in a calm timber interior" },
          { src: "/images/projects/kyoto-corridor.png", alt: "Morning light crossing a Kyoto timber corridor and garden" },
          { src: "/images/projects/kyoto-courtyard.png", alt: "A weathered cedar threshold beside a stone water basin" },
        ],
        caption: "Material, threshold, and the garden beyond.",
      },
      {
        layout: "stacked",
        images: [
          { src: "/images/projects/kyoto-corridor.png", alt: "A quiet cedar corridor opening onto a moss garden" },
          { src: "/images/projects/kyoto-courtyard.png", alt: "Leaf shadows fall across timber and a stone basin" },
        ],
      },
    ],
    fictional: true,
  },
  {
    slug: "the-new-table",
    title: "The New Table",
    category: "Commercial",
    location: "London, United Kingdom",
    year: 2024,
    description: "A fictional hospitality study around the small rituals, shared plates, and soft pauses of a meal.",
    discipline: "Hospitality campaign",
    facets: {
      subjects: ["table setting", "food", "ceramics", "hands", "citrus", "candles"],
      qualities: ["warm", "editorial", "intimate"],
      moods: ["convivial", "quiet"],
      lighting: ["candlelight", "window-light"],
      palette: ["walnut", "candle-gold", "terracotta", "ivory"],
      composition: ["overhead", "detail", "environmental"],
      locationType: ["dining-room"],
      keywords: ["hospitality", "restaurant", "food", "dining", "supper", "meal", "campaign", "brand", "commercial", "interiors"],
      services: ["photography", "creative-direction", "visual-production"],
    },
    coverImage: {
      src: "/images/projects/the-new-table.png",
      alt: "A linen-covered supper table set with handmade ceramics and candlelight beside a London window",
    },
    gallery: [
      {
        layout: "horizontal",
        images: [
          { src: "/images/projects/the-new-table.png", alt: "A candlelit table with handmade plates and a softly lit window" },
          { src: "/images/projects/new-table-detail.png", alt: "Hands arranging handmade plates and citrus around a walnut table" },
        ],
        caption: "The table before and during the gathering.",
      },
      {
        layout: "stacked",
        images: [
          { src: "/images/projects/new-table-detail.png", alt: "Citrus, ceramic plates, and linen in natural afternoon light" },
          { src: "/images/projects/the-new-table.png", alt: "A warmly lit supper setting with a guest by the window" },
        ],
      },
    ],
    fictional: true,
  },
  {
    slug: "soft-geometry",
    title: "Soft Geometry",
    category: "Editorial",
    location: "Lisbon, Portugal",
    year: 2023,
    description: "A fictional editorial framed by open shade, weathered color, and the quiet geometry of the city.",
    discipline: "Portrait & editorial",
    facets: {
      subjects: ["portrait", "woman", "silk dress", "tailoring", "rooftops", "street"],
      qualities: ["editorial", "warm", "nostalgic", "cinematic"],
      moods: ["timeless", "serene", "contemplative"],
      lighting: ["open-shade", "golden-hour"],
      palette: ["terracotta", "ivory", "sea-blue"],
      composition: ["portrait", "environmental", "layered-depth"],
      locationType: ["city-street", "terrace"],
      keywords: ["portrait", "portraiture", "lisbon", "portugal", "city", "street", "shutters", "plaster", "travel", "magazine"],
      services: ["photography", "creative-direction"],
    },
    coverImage: {
      src: "/images/projects/soft-geometry.png",
      alt: "A woman in an ivory silk dress standing beside faded terracotta plaster and green shutters in Lisbon",
    },
    gallery: [
      {
        layout: "stacked",
        images: [
          { src: "/images/projects/soft-geometry.png", alt: "An ivory dress against terracotta plaster and green shutters" },
          { src: "/images/projects/soft-geometry-portrait.png", alt: "A portrait in charcoal tailoring overlooking the rooftops of Lisbon" },
        ],
        caption: "Two studies in color and open shade.",
      },
    ],
    fictional: true,
  },
];

export function getProjectBySlug(slug: string): PhotographyProject | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  previous: PhotographyProject | undefined;
  next: PhotographyProject | undefined;
} {
  const index = projects.findIndex((project) => project.slug === slug);

  if (index < 0) return { previous: undefined, next: undefined };

  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}
