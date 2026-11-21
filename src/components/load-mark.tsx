import { useEffect, useState } from "react";

let decided = false;

const SHOW_AFTER_MS = 300;

/**
 * First-load wordmark. SSR content stays painted underneath.
 * The mark is not in the document until a load is still pending past 300ms,
 * and it never mounts on a fast load.
 */
export function LoadMark({ tone }: { tone: "light" | "dark" }) {
  const [phase, setPhase] = useState<"off" | "in" | "out">("off");

  useEffect(() => {
    if (decided || document.readyState === "complete") {
      decided = true;
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = false;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      decided = true;
      if (!shown) return;
      if (reduced) {
        setPhase("off");
        return;
      }
      setPhase("out");
      window.setTimeout(() => setPhase("off"), 460);
    };
    const reveal = () => {
      if (closed || document.readyState === "complete") {
        close();
        return;
      }
      shown = true;
      decided = true;
      setPhase("in");
    };
    const wait = Math.max(0, SHOW_AFTER_MS - performance.now());
    const timer = window.setTimeout(reveal, wait);
    window.addEventListener("load", close, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", close);
      if (!shown) decided = false;
    };
  }, []);

  if (phase === "off") return null;
  const src = tone === "light" ? "/brand/loading-wordmark-dark.webp" : "/brand/loading-wordmark-light.webp";
  return (
    <div className="load-mark" data-on={phase === "in" ? "true" : "false"} data-tone={tone} aria-hidden="true">
      <img src={src} alt="" width={910} height={192} decoding="async" fetchPriority="low" />
    </div>
  );
}
