import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";

export function NotFound() {
  return (
    <main className="not-found">
      <p className="page-kicker">404</p>
      <h1 className="page-title">This page is not here.</h1>
      <p className="lede">此頁不存在。</p>
      <p className="cta-row">
        <Link className="cta" to="/$lang" params={{ lang: "en" }}>
          {site.name}
        </Link>
        <Link className="cta cta-quiet" to="/$lang" params={{ lang: "zh-tw" }}>
          中文
        </Link>
      </p>
    </main>
  );
}
