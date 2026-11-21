import { useEffect, useRef, useState } from "react";
import { registerFilmGsap, gsap } from "../lib/gsap";
import { DUR, EASE, formatTimecode, useReducedMotion } from "../lib/motion";

export function PlayCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [label, setLabel] = useState("");
  const [playWord, setPlayWord] = useState("PLAY");

  useEffect(() => {
    const cursor = cursorRef.current;
    const root = cursor?.closest(".film-root");
    if (!cursor || !root || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    registerFilmGsap();
    root.setAttribute("data-cursor", "on");
    document.documentElement.dataset.filmPointermove = "1";
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.4, opacity: 0, filter: "blur(10px)" });
    const xTo = gsap.quickTo(cursor, "x", { duration: DUR.base, ease: EASE.out });
    const yTo = gsap.quickTo(cursor, "y", { duration: DUR.base, ease: EASE.out });
    let inside = false;
    let currentCard: Element | null = null;

    let frame = 0;
    const paintTime = () => {
      const node = timeRef.current;
      const card = currentCard;
      if (!node || !card) return;
      const video = card.querySelector("video");
      const next =
        video && !video.paused && video.currentTime > 0.05
          ? formatTimecode(video.currentTime)
          : (card.getAttribute("data-timecode") ?? "");
      if (node.textContent !== next) node.textContent = next;
    };
    const tick = () => {
      paintTime();
      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
      const card = (event.target as Element | null)?.closest?.("[data-cursor='play']") ?? null;
      const next = Boolean(card);
      if (card !== currentCard) {
        currentCard = card;
        setLabel(card?.getAttribute("data-timecode") ?? "");
        setPlayWord(card?.getAttribute("data-play") ?? "PLAY");
        if (card && !frame) frame = window.requestAnimationFrame(tick);
        if (!card && frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      }
      if (next !== inside) {
        inside = next;
        gsap.to(cursor, {
          scale: next ? 1 : 0.4,
          opacity: next ? 1 : 0,
          filter: next ? "blur(0px)" : "blur(10px)",
          duration: DUR.base,
          ease: EASE.out,
          overwrite: "auto",
        });
      }
    };

    document.addEventListener("pointermove", onMove);
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.filmPointermove;
      root.removeAttribute("data-cursor");
      gsap.killTweensOf(cursor);
    };
  }, [reduced]);

  return (
    <div ref={cursorRef} className="film-cursor" aria-hidden="true">
      <span>{playWord}</span>
      <span ref={timeRef} className="film-cursor-time">
        {label}
      </span>
    </div>
  );
}
