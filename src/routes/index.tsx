import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: site.name },
      { name: "description", content: "Photography and filmmaking by WEITA CHEN." },
    ],
  }),
  component: Entrance,
});

function Entrance() {
  return (
    <main className="door">
      <p className="door-name">{site.name}</p>
      <div className="door-grid">
        <Link className="door-link" to="/photography">
          <span className="door-en">Photography</span>
          <span className="door-zh">攝影</span>
        </Link>
        <Link className="door-link" to="/filmmaking">
          <span className="door-en">Filmmaking</span>
          <span className="door-zh">影像</span>
        </Link>
      </div>
    </main>
  );
}
