import { heroSlides } from "./site";
import { projects } from "./projects";
import type { Copy, Lang, Photo, Project } from "./types";
import { localizePath } from "./types";

export function publishedProjects(): Project[] {
  return projects
    .filter((project) => project.published)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug && project.published);
}

export function photoById(project: Project, id: string): Photo | undefined {
  return project.images.find((image) => image.id === id);
}

export function coverOf(project: Project): Photo | undefined {
  return photoById(project, project.coverImage) ?? project.images[0];
}

export function projectCategories(project: Project): Copy[] {
  if (project.categories?.length) return project.categories;
  return project.category ? [project.category] : [];
}

export type WorkCategory = { key: string; label: Copy; count: number };

export function workCategories(list: Project[]): WorkCategory[] {
  const map = new Map<string, WorkCategory>();
  for (const project of list) {
    const seen = new Set<string>();
    for (const category of projectCategories(project)) {
      if (seen.has(category.en)) continue;
      seen.add(category.en);
      const current = map.get(category.en);
      if (current) current.count += 1;
      else map.set(category.en, { key: category.en, label: category, count: 1 });
    }
  }
  return [...map.values()];
}

export function neighbors(slug: string): { prev?: Project; next?: Project } {
  const list = publishedProjects();
  const index = list.findIndex((project) => project.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? list[index - 1] : list[list.length - 1],
    next: index < list.length - 1 ? list[index + 1] : list[0],
  };
}

export function interactivePhotos(project: Project): Photo[] {
  const seen = new Set<string>();
  const ordered: Photo[] = [];
  for (const section of project.layoutSections) {
    const ids =
      "imageId" in section
        ? [section.imageId]
        : "imageIds" in section
          ? section.imageIds
          : [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      const photo = photoById(project, id);
      if (photo && !photo.placeholder && photo.src) {
        seen.add(id);
        ordered.push(photo);
      }
    }
  }
  return ordered;
}

export type Slide = Photo & { projectSlug: string };

export function heroSlideshow(): Slide[] {
  const slides: Slide[] = [];
  for (const ref of heroSlides) {
    const project = projects.find((item) => item.id === ref.projectId);
    const photo = project?.images.find((image) => image.id === ref.imageId);
    if (project && photo?.src && !photo.placeholder) {
      slides.push({ ...photo, projectSlug: project.slug });
    }
  }
  return slides;
}

export function projectPath(lang: Lang, slug: string): string {
  return `/${lang}/work/${slug}`;
}

export function altPath(pathname: string, lang: Lang): string {
  return localizePath(pathname, lang === "en" ? "zh-tw" : "en");
}
