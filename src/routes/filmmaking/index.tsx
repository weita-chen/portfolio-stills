import { createFileRoute, Link } from "@tanstack/react-router";
import { langRedirect, preferredLang, rememberLang } from "@/lib/lang-pref";
import "@/features/filmmaking/styles/film.css";

export const Route = createFileRoute("/filmmaking/")({
  beforeLoad: async () => {
    const lang = await preferredLang();
    throw langRedirect(`/filmmaking/${lang}`);
  },
  component: FilmLanguageGate,
});

function FilmLanguageGate() {
  return (
    <div className="film-root" lang="en" data-theme="film">
      <main className="film-placeholder">
        <p className="film-kicker">WEITA CHEN</p>
        <h1>Filmmaking</h1>
        <p className="film-inline-links">
          <Link to="/filmmaking/$lang" params={{ lang: "en" }} onClick={() => rememberLang("en")}>
            English
          </Link>
          <Link to="/filmmaking/$lang" params={{ lang: "zh-tw" }} onClick={() => rememberLang("zh-tw")}>
            中文
          </Link>
        </p>
      </main>
    </div>
  );
}
