import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectCopy } from "../lib/content";
import { consumeCloseFlip, consumeGridFlip, runFlip, runGridFlip } from "../lib/flip";
import type { FilmLang } from "../lib/i18n";
import { whenIdleOrGesture } from "../lib/defer";
import { useReducedMotion, useSaveData } from "../lib/motion";
import { WorkCard } from "./WorkCard";

function preloadPreview() {
  void import("./PreviewVideo");
}

export function WorkGrid({
  projects,
  lang,
  suspended,
}: {
  projects: ProjectCopy[];
  lang: FilmLang;
  suspended?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const saveData = useSaveData();
  const [touchOnly, setTouchOnly] = useState(false);
  const [pointerKnown, setPointerKnown] = useState(false);
  const [mobileLive, setMobileLive] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [warmId, setWarmId] = useState<string | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const desktop = !touchOnly;
  const playingId = reduced || saveData || suspended ? null : touchOnly ? (mobileLive ? centerId : null) : hoverId;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)");
    const update = () => setTouchOnly(query.matches);
    update();
    setPointerKnown(true);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!pointerKnown || reduced || saveData) return;
    if (touchOnly) return whenIdleOrGesture(preloadPreview);
    preloadPreview();
  }, [pointerKnown, touchOnly, reduced, saveData]);

  useEffect(() => {
    if (!touchOnly || reduced || saveData) return;
    return whenIdleOrGesture(() => setMobileLive(true));
  }, [touchOnly, reduced, saveData]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const grid = consumeGridFlip();
    if (grid) {
      const cards = [...node.querySelectorAll<HTMLElement>(".film-card")];
      runGridFlip(grid, cards, 0.6, {
        onEnter: (elements: Element[]) => {
          elements.forEach((element) => {
            element.animate(
              [
                { opacity: 0, transform: "scale(0.96)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 600, easing: "cubic-bezier(0.65, 0.05, 0.36, 1)", fill: "none" },
            );
          });
        },
      });
    }
    const closing = consumeCloseFlip();
    if (!closing) return;
    const card = node.querySelector(`[data-slug="${closing.slug}"]`);
    if (card) runFlip(closing.state, card, 0.7);
  }, [projects]);

  useEffect(() => {
    const node = root.current;
    if (!node || !touchOnly || reduced || saveData || suspended) return;
    const ratios = new Map<Element, number>();
    const pick = () => {
      const chosen: { el: HTMLElement | null } = { el: null };
      let bestRatio = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      const mid = window.innerHeight / 2;
      ratios.forEach((ratio, element) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - mid);
        if (ratio > bestRatio || (ratio === bestRatio && ratio > 0 && distance < bestDistance)) {
          chosen.el = element as HTMLElement;
          bestRatio = ratio;
          bestDistance = distance;
        }
      });
      setCenterId(bestRatio > 0 ? chosen.el?.dataset.slug ?? null : null);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
        pick();
      },
      { threshold: [0, 0.5, 0.75, 1] },
    );
    node.querySelectorAll(".film-card").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [touchOnly, reduced, saveData, suspended, projects]);

  const onPreview = (slug: string | null) => {
    if (!desktop) return;
    setHoverId(slug);
    if (slug) {
      setHeldId(slug);
      preloadPreview();
    }
  };

  const onWarm = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!desktop || reduced || saveData) return;
    const cards = root.current?.querySelectorAll<HTMLElement>(".film-card");
    if (!cards) return;
    let nearest: string | null = null;
    let best = 280;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const dx = event.clientX < rect.left ? rect.left - event.clientX : event.clientX > rect.right ? event.clientX - rect.right : 0;
      const dy = event.clientY < rect.top ? rect.top - event.clientY : event.clientY > rect.bottom ? event.clientY - rect.bottom : 0;
      const distance = Math.hypot(dx, dy);
      if (distance < best) {
        best = distance;
        nearest = card.dataset.slug ?? null;
      }
    });
    if (nearest) preloadPreview();
    setWarmId(nearest);
  };

  return (
    <div className="film-grid" ref={root} onPointerMove={onWarm}>
      {projects.map((project, index) => (
        <WorkCard
          key={project.slug}
          project={project}
          index={index}
          lang={lang}
          playing={playingId === project.slug}
          armed={!suspended && !reduced && !saveData && (playingId === project.slug || warmId === project.slug || heldId === project.slug)}
          motion={desktop && !reduced}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
