import { getDictionary, type FilmLang } from "../lib/i18n";

export function RoomSwitch({ lang }: { lang: FilmLang }) {
  const dictionary = getDictionary(lang);
  return (
    <div className="film-room">
      <a className="film-room-mark" href="/" aria-label={dictionary.entrance}>
        <img src="/brand/icon-white.png" alt="" width={34} height={34} />
      </a>
      <a href={`/photography/${lang}`}>{dictionary.photography}</a>
    </div>
  );
}
