import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  interactivePhotos,
  neighbors,
  photoById,
} from "@/content/queries";
import { site } from "@/content/site";
import { t, type Lang, type LayoutSection, type Photo, type Project } from "@/content/types";
import { Frame, Lightbox } from "./media";
import { SiteFoot } from "./shell";
import { photoSizes } from "@/content/photos";

export function ProjectView({ project, lang }: { project: Project; lang: Lang }) {
  const photos = interactivePhotos(project);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const { prev, next } = neighbors(project.slug);

  const open = (photo: Photo) => {
    const index = photos.findIndex((item) => item.id === photo.id);
    if (index >= 0) setOpenAt(index);
  };

  return (
    <article>
      {project.layoutSections.map((section, index) => {
        const previous = project.layoutSections[index - 1];
        if (section.type === "intro" && previous?.type === "hero") {
          const lead = photoById(project, previous.imageId);
          if (lead && isPortrait(lead)) return null;
        }
        if (section.type === "hero") {
          const lead = photoById(project, section.imageId);
          const next = project.layoutSections[index + 1];
          if (lead && isPortrait(lead) && next?.type === "intro") {
            return (
              <PortraitLead
                key="portrait-lead"
                photo={lead}
                project={project}
                lang={lang}
                onOpen={open}
              />
            );
          }
        }
        return (
          <Section
            key={`${section.type}-${index}`}
            section={section}
            project={project}
            lang={lang}
            priority={index === 0}
            onOpen={open}
          />
        );
      })}
      <nav className="project-nav" aria-label={lang === "zh-tw" ? "其他作品" : "Other projects"}>
        {prev ? (
          <Link to="/photography/$lang/work/$slug" params={{ lang, slug: prev.slug }}>
            <span>{t(site.previous, lang)}</span>
            <strong>{t(prev.title, lang)}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="next" to="/photography/$lang/work/$slug" params={{ lang, slug: next.slug }}>
            <span>{t(site.next, lang)}</span>
            <strong>{t(next.title, lang)}</strong>
          </Link>
        ) : null}
      </nav>
      <SiteFoot lang={lang} />
      {openAt != null ? (
        <Lightbox
          photos={photos}
          index={openAt}
          lang={lang}
          onClose={() => setOpenAt(null)}
          onIndex={setOpenAt}
        />
      ) : null}
    </article>
  );
}

function ProjectMeta({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <div className="meta-row">
      {project.year ? <span>{project.year}</span> : null}
      {project.location ? <span>{t(project.location, lang)}</span> : null}
      {project.category ? <span>{t(project.category, lang)}</span> : null}
      {project.client ? <span>{t(project.client, lang)}</span> : null}
      {project.role ? <span>{t(project.role, lang)}</span> : null}
    </div>
  );
}

function PortraitLead({
  photo,
  project,
  lang,
  onOpen,
}: {
  photo: Photo;
  project: Project;
  lang: Lang;
  onOpen: (photo: Photo) => void;
}) {
  return (
    <header className="figure-split align-left with-copy">
      <Clickable photo={photo} lang={lang} priority sizes={photoSizes.split} onOpen={onOpen} />
      <div className="open-copy">
        <p className="page-kicker">{String(project.order).padStart(2, "0")}</p>
        <h1>{t(project.title, lang)}</h1>
        <p className="essay">{t(project.description, lang)}</p>
        <ProjectMeta project={project} lang={lang} />
      </div>
    </header>
  );
}

function Section({
  section,
  project,
  lang,
  priority,
  onOpen,
}: {
  section: LayoutSection;
  project: Project;
  lang: Lang;
  priority: boolean;
  onOpen: (photo: Photo) => void;
}) {
  if (section.type === "intro") {
    return (
      <header className="project-intro">
        <div>
          <p className="page-kicker">{String(project.order).padStart(2, "0")}</p>
          <h1>{t(project.title, lang)}</h1>
        </div>
        <div>
          <p className="essay">{t(project.description, lang)}</p>
          <ProjectMeta project={project} lang={lang} />
          {project.awaiting ? <p className="awaiting">{t(site.placeholderProject, lang)}</p> : null}
        </div>
      </header>
    );
  }

  if (section.type === "text") {
    return <p className="section-text essay">{t(section.body, lang)}</p>;
  }

  if (section.type === "hero" || section.type === "full" || section.type === "single") {
    const photo = photoById(project, section.imageId);
    if (!photo) return null;
    const align = section.type === "single" ? (section.align === "right" ? "right" : "left") : "left";
    return (
      <ImageFigure
        photo={photo}
        lang={lang}
        align={align}
        hero={section.type === "hero"}
        priority={priority && section.type === "hero"}
        onOpen={onOpen}
      />
    );
  }

  const [leftId, rightId] = section.imageIds;
  const left = photoById(project, leftId);
  const right = photoById(project, rightId);
  if (!left || !right) return null;
  if (section.type === "pair" && isPortrait(left) && isPortrait(right)) {
    return (
      <div className={section.offset ? `section-pair offset-${section.offset}` : "section-pair"}>
        <Clickable photo={left} lang={lang} sizes={photoSizes.split} onOpen={onOpen} />
        <Clickable photo={right} lang={lang} sizes={photoSizes.split} onOpen={onOpen} />
      </div>
    );
  }
  return (
    <>
      <ImageFigure photo={left} lang={lang} align="left" onOpen={onOpen} />
      <ImageFigure photo={right} lang={lang} align="right" onOpen={onOpen} />
    </>
  );
}

function isPortrait(photo: Photo) {
  return photo.height > photo.width;
}

function ImageFigure({
  photo,
  lang,
  align,
  hero = false,
  priority = false,
  onOpen,
}: {
  photo: Photo;
  lang: Lang;
  align: "left" | "right";
  hero?: boolean;
  priority?: boolean;
  onOpen: (photo: Photo) => void;
}) {
  if (!isPortrait(photo)) {
    return (
      <div className={hero ? "project-hero" : "section-full"}>
        <Clickable
          photo={photo}
          lang={lang}
          priority={priority}
          sizes={isPortrait(photo) ? photoSizes.split : hero ? photoSizes.bleed : photoSizes.full}
          onOpen={onOpen}
        />
      </div>
    );
  }
  return (
    <div className={`figure-split align-${align}`}>
      <Clickable
        photo={photo}
        lang={lang}
        priority={priority}
        sizes={photoSizes.split}
        onOpen={onOpen}
      />
    </div>
  );
}

function Clickable({
  photo,
  lang,
  priority,
  ratio = true,
  sizes = photoSizes.full,
  onOpen,
}: {
  photo: Photo;
  lang: Lang;
  priority?: boolean;
  ratio?: boolean;
  sizes?: string;
  onOpen: (photo: Photo) => void;
}) {
  if (photo.placeholder || !photo.src) {
    return <Frame photo={photo} lang={lang} ratio={ratio} />;
  }
  return (
    <button
      type="button"
      className="photo-btn"
      onClick={() => onOpen(photo)}
      aria-label={`${t(site.enlarge, lang)}: ${t(photo.alt, lang)}`}
    >
      <Frame photo={photo} lang={lang} priority={priority} ratio={false} sizes={sizes} />
    </button>
  );
}
