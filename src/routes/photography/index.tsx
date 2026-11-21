import { createFileRoute, Link } from "@tanstack/react-router";
import { rememberLang, langRedirect, preferredLang } from "@/lib/lang-pref";
import { site } from "@/content/site";

export const Route = createFileRoute("/photography/")({
  beforeLoad: async () => {
    const lang = await preferredLang();
    throw langRedirect(`/photography/${lang}`);
  },
  component: LanguageGate,
});

function LanguageGate() {
  return (
    <main className="not-found">
      <p className="page-kicker">{site.name}</p>
      <h1 className="page-title">Photography</h1>
      <p className="cta-row">
        <Link className="cta" to="/photography/$lang" params={{ lang: "en" }} onClick={() => rememberLang("en")}>
          English
        </Link>
        <Link
          className="cta cta-quiet"
          to="/photography/$lang"
          params={{ lang: "zh-tw" }}
          onClick={() => rememberLang("zh-tw")}
        >
          中文
        </Link>
      </p>
    </main>
  );
}
