import type { FilmLang } from "../lib/i18n";
import { displayName } from "../lib/name";
import { FilmLink } from "./FilmLink";

type BrandMarkProps = {
  lang: FilmLang;
  variant?: "wordmark" | "icon";
  src?: string;
};

export function BrandMark({ lang, variant = "wordmark", src }: BrandMarkProps) {
  const label = displayName(lang);
  if (variant === "icon") {
    return (
      <FilmLink to="/filmmaking/$lang" params={{ lang }} search={{ work: undefined }} className="film-brand" aria-label={label}>
        <img src={src ?? "/brand/icon-white.png"} alt="" width={44} height={44} />
      </FilmLink>
    );
  }

  return (
    <FilmLink to="/filmmaking/$lang" params={{ lang }} search={{ work: undefined }} className="film-brand" aria-label={label}>
      <picture>
        <source
          type="image/webp"
          srcSet="/brand/wordmark-light-320.webp 320w, /brand/wordmark-light-640.webp 640w"
          sizes="(max-width: 767px) 48px, 64px"
        />
        <img src={src ?? "/brand/wordmark-light.png"} alt={label} width={761} height={563} />
      </picture>
    </FilmLink>
  );
}
