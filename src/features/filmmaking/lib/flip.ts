type FlipState = object;

type FlipTween = {
  progress: (value: number) => unknown;
  kill: () => unknown;
};

type FlipApi = {
  getState: (targets: Element | Element[] | NodeListOf<Element>, vars?: Record<string, unknown>) => FlipState;
  from: (state: FlipState, vars: Record<string, unknown>) => FlipTween;
};

let api: FlipApi | null = null;
let openState: FlipState | null = null;
let closeState: { slug: string; state: FlipState } | null = null;
let gridState: FlipState | null = null;
let gridMarkTimer = 0;

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function loadFlip(): Promise<void> {
  if (api) return Promise.resolve();
  return import("./gsap").then(({ Flip }) => {
    api = Flip as unknown as FlipApi;
  });
}

export function captureCardFlip(element: Element | null) {
  if (!api || !element || reduced()) return;
  openState = api.getState(element);
}

export function restoreOpenFlip(state: FlipState | null) {
  if (state && !openState) openState = state;
}

export function consumeOpenFlip() {
  const state = openState;
  openState = null;
  return state;
}

export function stashCloseFlip(slug: string, element: Element | null) {
  if (!api || !element || reduced()) return;
  closeState = { slug, state: api.getState(element) };
}

export function consumeCloseFlip() {
  const state = closeState;
  closeState = null;
  return state;
}

function cancelScriptAnimations(element: HTMLElement) {
  if (typeof element.getAnimations !== "function") return;
  element.getAnimations().forEach((animation) => {
    if (typeof CSSAnimation !== "undefined" && animation instanceof CSSAnimation) return;
    animation.cancel();
  });
}

function clearGridFlipStyles(element: HTMLElement) {
  const style = element.style;
  style.position = "";
  style.top = "";
  style.left = "";
  style.right = "";
  style.bottom = "";
  style.width = "";
  style.height = "";
  style.maxWidth = "";
  style.maxHeight = "";
  style.minWidth = "";
  style.minHeight = "";
  style.margin = "";
  style.padding = "";
  style.gridArea = "";
  style.transform = "";
  style.translate = "";
  style.rotate = "";
  style.scale = "";
  style.opacity = "";
  style.zIndex = "";
  style.transition = "";
}

function gridOf(cards: HTMLElement[]) {
  const parent = cards[0]?.parentElement;
  return parent instanceof HTMLElement ? parent : null;
}

/** Drop the mobile content-visibility suspension when the filter animation ends. */
function releaseGridMark(grid: HTMLElement | null, delay = 0) {
  if (gridMarkTimer) window.clearTimeout(gridMarkTimer);
  gridMarkTimer = 0;
  if (!grid) return;
  if (delay <= 0) {
    delete grid.dataset.flip;
    return;
  }
  grid.dataset.flip = "1";
  gridMarkTimer = window.setTimeout(() => {
    gridMarkTimer = 0;
    delete grid.dataset.flip;
  }, delay);
}

export function captureGridFlip(root: ParentNode | null) {
  if (!api || !root || reduced()) return;
  const host = root instanceof HTMLElement ? root : null;
  releaseGridMark(host, 0);
  if (host) host.dataset.flip = "1";
  root.querySelectorAll(".film-card").forEach((element) => {
    if (element instanceof HTMLElement) cancelScriptAnimations(element);
  });
  gridState = api.getState(root.querySelectorAll(".film-card"), { simple: true });
}

export function consumeGridFlip() {
  const state = gridState;
  gridState = null;
  return state;
}

export function runFlip(
  state: FlipState,
  targets: Element | Element[],
  duration: number,
  extra?: Record<string, unknown>,
) {
  if (!api || reduced()) return;
  api.from(state, {
    targets,
    duration,
    ease: "power3.inOut",
    absolute: true,
    ...extra,
  });
}

/**
 * Filter changes keep the grid in normal flow. Flip's absolute mode writes
 * position:absolute and grid-area:1/1/1/1, which collapses the grid and stacks
 * every card. A translating flip also drags posters across each other.
 * Resolve Flip immediately, strip those inline styles, then animate only a
 * contained scale (and opacity for cards that enter) so boxes never overlap.
 */
export function runGridFlip(
  state: FlipState,
  targets: Element[],
  duration: number,
  extra?: Record<string, unknown>,
) {
  if (!api || reduced()) return;
  const cards = targets.filter((element): element is HTMLElement => element instanceof HTMLElement);
  cards.forEach(cancelScriptAnimations);
  const grid = gridOf(cards);
  if (grid) grid.dataset.flip = "1";
  const { onComplete, onEnter, ...rest } = extra ?? {};
  const entering = new Set<Element>();
  try {
    const tween = api.from(state, {
      ...rest,
      targets: cards,
      duration: 0,
      absolute: false,
      simple: true,
      scale: true,
      prune: true,
      clearProps: true,
      onEnter: (elements: Element[]) => {
        elements.forEach((element) => entering.add(element));
        if (typeof onEnter === "function") onEnter(elements);
      },
    });
    tween.progress(1);
    tween.kill();
  } catch {
    // A detached leaving card must not leave the grid stuck mid-flip.
  }
  cards.forEach(clearGridFlipStyles);
  releaseGridMark(grid, Math.round(duration * 1000));
  if (!reduced()) {
    cards.forEach((element) => {
      if (entering.has(element)) return;
      element.animate([{ transform: "scale(0.985)" }, { transform: "none" }], {
        duration: Math.round(duration * 1000),
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "none",
      });
    });
  }
  if (typeof onComplete === "function") onComplete();
}
