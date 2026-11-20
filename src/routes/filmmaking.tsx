import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/content/site";

export const Route = createFileRoute("/filmmaking")({
  head: () => ({
    meta: [
      { title: `Filmmaking — ${site.name}` },
      { name: "description", content: "Forthcoming." },
    ],
  }),
  component: Filmmaking,
});

function Filmmaking() {
  return (
    <main className="room">
      <p className="door-name room-name">{site.name}</p>
      <div className="room-body">
        <h1 className="door-en">Filmmaking</h1>
        <p className="door-zh">影像</p>
        <p className="room-note">Forthcoming · 即將開放</p>
        <Link className="cta" to="/">
          Entrance
        </Link>
      </div>
    </main>
  );
}
