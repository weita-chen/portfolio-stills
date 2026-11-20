import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="not-found">
      <p className="page-kicker">404</p>
      <h1 className="page-title">This page is not here.</h1>
      <p className="lede">此頁不存在。</p>
      <p className="cta-row">
        <Link className="cta" to="/photography/$lang" params={{ lang: "en" }}>
          English
        </Link>
        <Link className="cta cta-quiet" to="/photography/$lang" params={{ lang: "zh-tw" }}>
          中文
        </Link>
      </p>
    </main>
  );
}
