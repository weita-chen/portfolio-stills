import { createFileRoute, Link } from "@tanstack/react-router";
import { preferredLang } from "@/lib/lang-pref";
import { site } from "@/content/site";

export const Route = createFileRoute("/")({
  loader: async () => ({ lang: await preferredLang() }),
  head: () => ({
    meta: [
      { title: site.name },
      { name: "description", content: "Photography and filmmaking by WEITA CHEN." },
    ],
  }),
  component: Entrance,
});

function Entrance() {
  const { lang } = Route.useLoaderData();
  return (
    <main className="door">
      <p className="door-name">{site.name}</p>
      <div className="door-grid">
        <Link className="door-link" to="/photography/$lang" params={{ lang }}>
          <span className="door-en">Photography</span>
          <span className="door-zh">攝影</span>
        </Link>
        <Link className="door-link" to="/filmmaking/$lang" params={{ lang }}>
          <span className="door-en">Filmmaking</span>
          <span className="door-zh">影像</span>
        </Link>
      </div>
    </main>
  );
}
