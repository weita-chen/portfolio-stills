import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { FilmPlayer } from "@/features/filmmaking/components/FilmPlayer";
import { getShowreel } from "@/features/filmmaking/lib/content";
import { getDictionary, isFilmLang } from "@/features/filmmaking/lib/i18n";
import { videoFrameVars } from "@/features/filmmaking/lib/motion";
import { pageTitle } from "@/features/filmmaking/lib/name";
import { filmHead, muxOgImage, videoObject } from "@/features/filmmaking/lib/seo";

export const Route = createFileRoute("/filmmaking/$lang/reel")({
  loader: ({ params }) => {
    if (!isFilmLang(params.lang)) throw notFound();
    const project = getShowreel(params.lang);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params }) => {
    const lang = isFilmLang(params.lang) ? params.lang : "en";
    const project = isFilmLang(params.lang) ? getShowreel(lang) : undefined;
    const title = project ? pageTitle(project.title, lang) : pageTitle(lang === "zh-tw" ? "影像集錦" : "Reel", lang);
    const description = project?.summary || project?.description || (lang === "zh-tw" ? "影像集錦。" : "Showreel.");
    const path = `/filmmaking/${lang}/reel`;
    return filmHead({
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
            year: project.year,
            path,
            lang,
          })
        : undefined,
    });
  },
  component: ReelPage,
});

function ReelPage() {
  const { lang } = Route.useParams();
  if (!isFilmLang(lang)) throw notFound();
  const { project } = Route.useLoaderData();
  const dictionary = getDictionary(lang);
  const frame = videoFrameVars(project.aspectRatio);
  const [needSound, setNeedSound] = useState(false);

  return (
    <main id="content" className="film-reel">
      <h1 className="film-sr">{project.title}</h1>
      <div
        className="film-reel-stage"
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
          autoPlay
          lang={lang}
          onNeedSound={() => setNeedSound(true)}
        />
        {needSound ? (
          <button
            className="film-sound"
            type="button"
            onClick={(event) => {
              const video = event.currentTarget.parentElement?.querySelector("video");
              if (!video) return;
              video.muted = false;
              void video.play();
              setNeedSound(false);
            }}
          >
            {dictionary.sound}
          </button>
        ) : null}
      </div>
      <p className="film-reel-caption">
        {dictionary.nav.reel}
        <span>
          {project.title.includes(String(project.year))
            ? project.title
            : `${project.title} · ${project.year}`}
        </span>
      </p>
    </main>
  );
}
