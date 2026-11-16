import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { langKey, site } from "@/content/site";
import type { Lang } from "@/content/types";

export const Route = createFileRoute("/")({
  component: LanguageGate,
  head: () => ({
    scripts: [
      {
        children: `try{var l=localStorage.getItem("${langKey}");var n=l==="zh-tw"?"zh-tw":"en";if(location.pathname==="/"||location.pathname==="")location.replace("/"+n);}catch(e){}`,
      },
    ],
  }),
});

function LanguageGate() {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    let lang: Lang = "en";
    try {
      const saved = localStorage.getItem(langKey);
      if (saved === "zh-tw") lang = "zh-tw";
    } catch {
      /* ignore */
    }
    void navigate({ to: "/$lang", params: { lang }, replace: true });
  }, [navigate]);

  return (
    <main className="not-found">
      <p className="page-kicker">{site.name}</p>
      <h1 className="page-title">WEITA CHEN</h1>
      <p className="cta-row">
        <Link className="cta" to="/$lang" params={{ lang: "en" }}>
          English
        </Link>
        <Link className="cta cta-quiet" to="/$lang" params={{ lang: "zh-tw" }}>
          中文
        </Link>
      </p>
    </main>
  );
}
