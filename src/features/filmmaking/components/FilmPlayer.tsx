import { useEffect, useState, type ComponentType } from "react";
import { whenIdleOrGesture } from "../lib/defer";
import { getDictionary, type FilmLang } from "../lib/i18n";
import { videoFrameVars } from "../lib/motion";
import { heroLcpSizes, playerThumb, type MuxResolution } from "../lib/mux";

type PlayerProps = {
  playbackId: string;
  title: string;
  slug: string;
  posterTime: number;
  aspectRatio: string;
  autoPlay: boolean;
  lang: FilmLang;
  onNeedSound?: () => void;
  maxResolution?: MuxResolution;
  posterWidth?: number;
  playFromStart?: boolean;
};

export function FilmPlayer(props: PlayerProps) {
  const [Player, setPlayer] = useState<ComponentType<PlayerProps> | null>(null);
  const frame = videoFrameVars(props.aspectRatio);
  const poster = playerThumb(props.playbackId, props.posterTime, heroLcpSizes(frame.ar), props.posterWidth ?? 960);
  const width = 768;
  const height = Math.max(1, Math.round(width / frame.ar));

  useEffect(() => {
    let live = true;
    const load = () => {
      import("./FullPlayer").then((mod) => {
        if (live) setPlayer(() => mod.FullPlayer);
      });
    };
    if (props.autoPlay) {
      load();
      return () => {
        live = false;
      };
    }
    const cancel = whenIdleOrGesture(load);
    return () => {
      live = false;
      cancel();
    };
  }, [props.autoPlay, props.playbackId]);

  if (!Player) {
    const image = (
      <img
        className="film-player-poster"
        src={poster.src}
        srcSet={poster.srcSet}
        sizes={poster.sizes}
        alt=""
        width={width}
        height={height}
        decoding="async"
        fetchPriority="high"
        style={{ aspectRatio: frame.aspect }}
      />
    );
    if (props.autoPlay) {
      return <div className="film-poster-hold">{image}</div>;
    }
    return (
      <button
        className="film-poster-hold"
        type="button"
        aria-label={`${getDictionary(props.lang).play} ${props.title}`}
        onClick={() => {
          import("./FullPlayer").then((mod) => setPlayer(() => mod.FullPlayer));
        }}
      >
        {image}
        <span className="film-poster-play" aria-hidden="true" />
      </button>
    );
  }

  return <Player {...props} />;
}
