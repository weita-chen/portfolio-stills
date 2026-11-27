import type { FilmLang } from "../lib/i18n";
import { displayName } from "../lib/name";

/** Hub mark: same W asset as the photography room's top-left `.home-mark`. */
export function BrandMark({ lang }: { lang: FilmLang }) {
  const name = displayName(lang);
  const label = lang === "zh-tw" ? `${name}首頁` : `${name} home`;
  return (
    <a href="/" className="film-home-mark" aria-label={label}>
      <img src="/brand/icon-white.png" alt="" width={34} height={34} decoding="async" />
    </a>
  );
}
