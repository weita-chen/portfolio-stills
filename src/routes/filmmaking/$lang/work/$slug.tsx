import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { FilmLink } from "@/features/filmmaking/components/FilmLink";
import { FilmPlayer } from "@/features/filmmaking/components/FilmPlayer";
import { ClipPreview } from "@/features/filmmaking/components/ClipPreview";
import { getAdjacentProjects, getProject, type ProjectCopy } from "@/features/filmmaking/lib/content";
import { getDictionary, isFilmLang, type FilmLang } from "@/features/filmmaking/lib/i18n";
import { formatClock, useReducedMotion, videoFrameVars } from "@/features/filmmaking/lib/motion";
import { heroLcpSizes, playerThumb, thumbSet } from "@/features/filmmaking/lib/mux";
import { displayName, pageTitle } from "@/features/filmmaking/lib/name";
import { filmHead, muxOgImage, videoObject } from "@/features/filmmaking/lib/seo";

export const Route = createFileRoute("/filmmaking/$lang/work/$slug")({
  loader: ({ params }) => {
    if (!isFilmLang(params.lang)) throw notFound();
    const project = getProject(params.slug, params.lang);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params }) => {
    const lang = isFilmLang(params.lang) ? params.lang : "en";
    const project = isFilmLang(params.lang) ? getProject(params.slug, lang) : undefined;
    const title = project ? pageTitle(project.title, lang) : displayName(lang);
    const description = project?.description || project?.summary || "";
    const path = `/filmmaking/${lang}/work/${params.slug}`;
    const head = filmHead({
      title,
      description,
      path,
      lang,
      image: project ? muxOgImage(project.playbackId, project.posterTime) : undefined,
      imageAlt: project?.title,
      jsonLd: project
        ? videoObject({
            title: project.title,
            description,
            playbackId: project.playbackId,
            posterTime: project.posterTime,
            durationSec: project.durationSec,
            maxResolution: project.maxResolution,
            year: project.year,
            path,
            lang,
          })
        : undefined,
    });
    if (!project) return head;
    const poster = playerThumb(
      project.playbackId,
      project.posterTime,
      heroLcpSizes(videoFrameVars(project.aspectRatio).ar),
      project.posterWidth,
    );
    return {
      ...head,
      links: [
        ...head.links,
        {
          rel: "preload",
          as: "image",
          href: poster.src,
          imageSrcSet: poster.srcSet,
          imageSizes: poster.sizes,
          fetchPriority: "high",
        },
      ],
    };
  },
  component: ProjectPage,
});

function FilmTitle({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  let word = 0;
  return (
    <h1 className="film-project-title">
      {parts.map((part, index) => {
        if (!part.trim()) return <span key={index}>{"\u00A0"}</span>;
        const delay = Math.min(word, 12) * 0.045;
        word += 1;
        return (
          <span key={index} className="film-project-word" style={{ animationDelay: `${delay}s` }}>
            {part}
          </span>
        );
      })}
    </h1>
  );
}

function stillColumns(ratio: string): 1 | 2 {
  return videoFrameVars(ratio).ar >= 2 ? 1 : 2;
}

function stillSizes(cols: 1 | 2) {
  return cols === 1 ? "(max-width: 800px) 100vw, min(100vw, 90rem)" : "(max-width: 800px) 100vw, 46vw";
}

type PreviewProps = { playbackId: string; armed: boolean; playing: boolean };

function BleedPreview(props: PreviewProps) {
  const [Preview, setPreview] = useState<ComponentType<PreviewProps> | null>(null);
  useEffect(() => {
    if (!props.armed) return;
    let live = true;
    import("@/features/filmmaking/components/PreviewVideo").then((mod) => {
      if (live) setPreview(() => mod.PreviewVideo);
    });
    return () => {
      live = false;
    };
  }, [props.armed]);
  if (!Preview) return null;
  return <Preview {...props} />;
}

function ProjectPage() {
  const { lang, slug } = Route.useParams();
  if (!isFilmLang(lang)) throw notFound();
  const { project } = Route.useLoaderData();
  const dictionary = getDictionary(lang);
  const frame = videoFrameVars(project.aspectRatio);
  const { prev, next } = getAdjacentProjects(slug, lang);
  const copy = project.description || project.summary;
  const roles = project.roles.map((role) => dictionary.roles[role]).join(" · ");
  const specRows = [
    project.camera ? { label: dictionary.camera, value: project.camera } : null,
    project.lenses ? { label: dictionary.lenses, value: project.lenses } : null,
    project.format ? { label: dictionary.format, value: project.format } : null,
    { label: dictionary.aspect, value: project.aspectRatio },
    project.grade ? { label: dictionary.grade, value: project.grade } : null,
    project.location ? { label: dictionary.location, value: project.location } : null,
    project.durationSec ? { label: dictionary.duration, value: formatClock(project.durationSec) } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));
  const lead = next ?? prev;
  const leadKind = next ? "next" : "prev";

  return (
    <main id="content" className="film-project">
      <section className="film-project-hero" aria-label={project.title}>
        <div
          className="film-project-stage"
          style={
            {
              "--film-video-aspect": frame.aspect,
              "--film-video-ar": frame.ar,
            } as React.CSSProperties
          }
        >
          <FilmPlayer
            playbackId={project.playbackId}
            title={project.title}
            slug={project.slug}
            posterTime={project.posterTime}
            aspectRatio={project.aspectRatio}
            autoPlay={false}
            lang={lang}
            maxResolution={project.maxResolution}
            posterWidth={project.posterWidth}
            playFromStart={project.playFromStart}
          />
        </div>
      </section>
      <div className="film-project-body">
        <header className="film-project-head">
          <p className="film-kicker">
            <FilmLink to="/filmmaking/$lang" params={{ lang }} search={{ work: undefined }}>
              {dictionary.nav.work}
            </FilmLink>
            {project.client ? <span> · {project.client}</span> : null}
          </p>
          <FilmTitle text={project.title} />
        </header>
        <div className="film-project-info">
          <aside className="film-project-meta">
            <dl className="film-meta-list">
              {project.client ? (
                <div>
                  <dt>{dictionary.client}</dt>
                  <dd>{project.client}</dd>
                </div>
              ) : null}
              <div>
                <dt>{dictionary.year}</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>{dictionary.rolesLabel}</dt>
                <dd>{roles}</dd>
              </div>
            </dl>
            <div className="film-slate">
              <p className="film-section-label">{dictionary.specs}</p>
              <dl>
                {specRows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
          <div className="film-project-copy">
            {copy ? <p className="film-project-description">{copy}</p> : null}
            <h2 className="film-section-label">{dictionary.credits}</h2>
            <ul className="film-credits">
              {project.credits.map((credit) => (
                <li key={`${credit.role}-${credit.name}`}>
                  <span>{credit.role}</span>
                  <span>{credit.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {project.stills.length ? (
          <section className="film-stills" aria-labelledby="film-stills-title">
            <h2 id="film-stills-title" className="film-section-label">
              {dictionary.stills}
            </h2>
            <div className="film-stills-grid" data-cols={stillColumns(project.aspectRatio)}>
              {project.stills.map((still, index) => {
                const cols = stillColumns(project.aspectRatio);
                const width = 768;
                const height = Math.max(1, Math.round(width / frame.ar));
                const poster = still.src ? null : thumbSet(project.playbackId, still.time, stillSizes(cols));
                return (
                  <figure key={`${still.time ?? still.src}-${index}`} className="film-still" style={{ animationDelay: `${index * 0.08}s` }}>
                    <img
                      src={still.src ?? poster?.src}
                      srcSet={poster?.srcSet}
                      sizes={poster?.sizes}
                      alt={still.alt}
                      width={width}
                      height={height}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      style={{ aspectRatio: frame.aspect }}
                    />
                    {still.time != null ? <figcaption>{formatClock(still.time)}</figcaption> : null}
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}
        {next && prev ? <AdjacentLink project={prev} lang={lang} kind="prev" bleed={false} /> : null}
      </div>
      {lead ? <AdjacentLink project={lead} lang={lang} kind={leadKind} bleed /> : null}
    </main>
  );
}

function AdjacentLink({
  project,
  lang,
  kind,
  bleed,
}: {
  project: ProjectCopy;
  lang: FilmLang;
  kind: "next" | "prev";
  bleed: boolean;
}) {
  const dictionary = getDictionary(lang);
  const reduced = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const label = kind === "next" ? dictionary.nextProject : dictionary.previousProject;
  const frame = videoFrameVars(project.aspectRatio);
  const width = 768;
  const height = Math.max(1, Math.round(width / frame.ar));
  const sizes = bleed ? "100vw" : "(max-width: 800px) 100vw, 22rem";
  const poster = thumbSet(project.playbackId, project.posterTime, sizes);

  return (
    <FilmLink
      to="/filmmaking/$lang/work/$slug"
      params={{ lang, slug: project.slug }}
      className={bleed ? "film-next" : "film-prev"}
      data-cursor={bleed ? "play" : undefined}
      data-play={dictionary.play}
      onPointerEnter={() => {
        if (!bleed || reduced) return;
        setArmed(true);
        setPlaying(true);
      }}
      onPointerLeave={() => {
        if (bleed) setPlaying(false);
      }}
    >
      <span className={bleed ? "film-next-media" : "film-prev-media"}>
        <img
          src={poster.src}
          srcSet={poster.srcSet}
          sizes={poster.sizes}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          style={{ aspectRatio: frame.aspect }}
        />
        {bleed ? (
          project.previewClip ? (
            <ClipPreview
              playbackId={project.playbackId}
              start={project.previewClip.start}
              end={project.previewClip.end}
              playing={playing && !reduced}
            />
          ) : (
            <BleedPreview playbackId={project.playbackId} armed={armed} playing={playing} />
          )
        ) : null}
      </span>
      <span className={bleed ? "film-next-copy" : "film-prev-copy"}>
        <span className="film-kicker">{label}</span>
        <span className={bleed ? "film-next-title" : "film-prev-title"}>{project.title}</span>
        <span className="film-next-meta">
          {[project.client, project.year].filter(Boolean).join(" · ")}
        </span>
      </span>
    </FilmLink>
  );
}
