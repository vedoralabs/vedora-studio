import type { ProjectCategory } from "@/types/project";

interface ServiceDiscipline {
  readonly category: ProjectCategory;
  readonly description: string;
}

/** Editorial descriptions of the studio's six photography disciplines. */
export const serviceDisciplines = [
  { category: "Weddings", description: "Intimate days, held with ease." },
  { category: "Fashion", description: "Form, movement, and material." },
  { category: "Commercial", description: "Images with a clear point of view." },
  { category: "Editorial", description: "A story told in thoughtful frames." },
  { category: "Architecture", description: "Light, space, and human scale." },
  { category: "Product", description: "Objects seen with fresh attention." },
] satisfies readonly ServiceDiscipline[];
