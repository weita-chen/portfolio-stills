export type FilmMove = "page" | "lang" | "reduced";

export function classifyMove(fromPath: string, toPath: string): "page" | "lang" | "external" {
  const path = toPath.split("?")[0] || "/";
  if (path === "/" || path.startsWith("/photography")) return "external";
  if (!path.startsWith("/filmmaking/")) return "external";
  const strip = (value: string) => value.replace(/\/filmmaking\/(?:en|zh-tw)/, "/filmmaking");
  if (strip(fromPath) === strip(path) && fromPath !== path) return "lang";
  return "page";
}

export async function playFilmExit(move: FilmMove): Promise<void> {
  const main = document.querySelector(".film-root main");
  if (!main) return;
  const { gsap } = await import("./gsap");
  if (move === "reduced") {
    await gsap.to(main, { opacity: 0, duration: 0.15, ease: "none" });
    return;
  }
  if (move === "lang") {
    await gsap.to(main, { opacity: 0.35, duration: 0.2, ease: "power1.out" });
    return;
  }
  await gsap.to(main, { y: 16, opacity: 0, duration: 0.34, ease: "power3.inOut" });
}
