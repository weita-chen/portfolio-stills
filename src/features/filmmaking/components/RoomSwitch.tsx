import { getDictionary, type FilmLang } from "../lib/i18n";

export function RoomSwitch({ lang }: { lang: FilmLang }) {
  const dictionary = getDictionary(lang);
  return (
    <div className="film-room">
      <a href={`/photography/${lang}`}>{dictionary.photography}</a>
    </div>
  );
}
