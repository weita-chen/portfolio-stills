import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import type { ProjectCopy } from "../lib/content";
import { getDictionary, type FilmLang } from "../lib/i18n";
import "../lib/globals";
import { aspectBox, cardSizes, getCardLayout } from "../lib/layout";
import { captureCardFlip } from "../lib/flip";
import { formatClock, formatTimecode, videoFrameVars } from "../lib/motion";
import { MuxImage } from "./MuxImage";
import { ClipPreview } from "./ClipPreview";
import { posterWidth } from "../lib/mux";

type PreviewProps = {
  playbackId: string;
  armed: boolean;
  playing: boolean;
};

function CardPreview(props: PreviewProps) {
  const [Preview, setPreview] = useState<ComponentType<PreviewProps> | null>(null);

  useEffect(() => {
    if (!props.armed) return;
    let live = true;
    import("./PreviewVideo").then((mod) => {
      if (live) setPreview(() => mod.PreviewVideo);
    });
    return () => {
      live = false;
    };
  }, [props.armed]);

  if (!Preview) return null;
  return <Preview {...props} />;
}

export function WorkCard({
  project,
  index,
  lang,
  playing,
  armed,
  motion,
  onPreview,
}: {
  project: ProjectCopy;
  index: number;
  lang: FilmLang;
  playing: boolean;
  armed: boolean;
  motion: boolean;
  onPreview: (slug: string | null) => void;
}) {
  const layout = getCardLayout(index);
  const box = aspectBox(layout.aspect);
  const frame = videoFrameVars(project.aspectRatio);
  const dictionary = getDictionary(lang);
  const subtitle = project.client ? `${project.client} · ${project.year}` : String(project.year);
  const roles = project.roles.map((role) => dictionary.roles[role]).join(" · ");
  const duration = formatClock(project.durationSec);

  return (
    <article
      className="film-card"
      data-flip-id={project.slug}
      data-span={layout.colSpan}
      data-lead={index === 0 ? "true" : undefined}
      data-aspect={layout.aspect ? "true" : undefined}
      data-slug={project.slug}
      data-cursor="play"
      data-duration={duration}
      data-timecode={formatTimecode(project.durationSec)}
      data-play={dictionary.play}
      data-preview={playing ? "on" : "off"}
      style={layout.aspect ? ({ "--film-aspect": layout.aspect } as React.CSSProperties) : undefined}
      onPointerEnter={() => {
        if (motion) onPreview(project.slug);
      }}
      onPointerLeave={() => {
        if (motion) onPreview(null);
      }}
      onPointerDown={(event) => {
        window.__filmGesture = Date.now();
        void import("./FullPlayer");
        captureCardFlip(event.currentTarget.querySelector(".film-card-media"));
      }}
    >
      <span className="film-card-media">
        <span
          className="film-card-fit"
          style={
            {
              "--film-video-aspect": frame.aspect,
              "--film-video-ar": frame.ar,
            } as React.CSSProperties
          }
        >
          <span className="film-card-frame">
            <MuxImage
              playbackId={project.playbackId}
              time={project.posterTime}
              sizes={cardSizes(layout.colSpan)}
              width={box.width}
              height={box.height}
              alt=""
              priority={index === 0}
              srcWidth={project.cardPosterWidth ?? posterWidth(layout.colSpan)}
            />
            <span className="film-card-shade" aria-hidden="true" />
            {project.previewClip ? (
              <ClipPreview
                playbackId={project.playbackId}
                start={project.previewClip.start}
                end={project.previewClip.end}
                playing={playing}
              />
            ) : (
              <CardPreview playbackId={project.playbackId} armed={armed} playing={playing} />
            )}
          </span>
        </span>
      </span>
      <Link
        to="/filmmaking/$lang"
        params={{ lang }}
        search={(prev) => ({ ...prev, work: project.slug })}
        mask={{
          to: "/filmmaking/$lang/work/$slug",
          params: { lang, slug: project.slug },
          unmaskOnReload: true,
        }}
        className="film-card-hit"
      >
        <span className="film-card-copy">
          <h2 className={index === 0 ? "film-card-title is-display" : "film-card-title"}>{project.title}</h2>
          <span className="film-card-meta-clip">
            <span className="film-card-meta">{subtitle}</span>
          </span>
          <span className="film-card-extra">
            {roles}
            {duration ? ` · ${duration}` : ""}
          </span>
        </span>
        <span className="film-card-ratio">{project.aspectRatio}</span>
      </Link>
    </article>
  );
}
