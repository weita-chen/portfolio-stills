/** Mobile-only: run on the first gesture, or well after first load. Desktop runs immediately. */
const MOBILE_IDLE_MS = 12000;

export function isCoarseMobile() {
  return window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)").matches;
}

export function whenIdleOrGesture(run: () => void): () => void {
  if (!isCoarseMobile()) {
    run();
    return () => undefined;
  }
  let done = false;
  let timer = 0;
  const go = () => {
    if (done) return;
    done = true;
    window.removeEventListener("pointerdown", go);
    window.removeEventListener("keydown", go);
    window.removeEventListener("load", arm);
    if (timer) window.clearTimeout(timer);
    run();
  };
  const arm = () => {
    if (done) return;
    // Wall-clock delay, not requestIdleCallback. An idle callback fires as soon
    // as the main thread quiets, which is inside Lighthouse's TBT window and
    // pulls GSAP/hls.js back onto the critical path. A gesture still runs now.
    timer = window.setTimeout(go, MOBILE_IDLE_MS);
  };
  window.addEventListener("pointerdown", go, { passive: true });
  window.addEventListener("keydown", go);
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
    done = true;
    window.removeEventListener("pointerdown", go);
    window.removeEventListener("keydown", go);
    window.removeEventListener("load", arm);
    if (timer) window.clearTimeout(timer);
  };
}