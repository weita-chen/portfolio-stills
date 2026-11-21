import { HOME_LCP_SIZES } from "./mux";

export type ColSpan = 4 | 6 | 8 | 12;

export type CardLayout = {
  colSpan: ColSpan;
  aspect?: string;
};

/** Index starts at 0. Matches the Earcandy bento rhythm without nth-child. */
export function getCardLayout(index: number): CardLayout {
  if (index === 0) return { colSpan: 12, aspect: "31 / 15" };
  if (index === 1 || index === 4) return { colSpan: 4 };
  if (index === 2 || index === 3) return { colSpan: 8, aspect: "41 / 24" };
  if (index === 5 || index === 6) return { colSpan: 6, aspect: "61 / 35" };
  return { colSpan: 4, aspect: "16 / 10" };
}

export function cardSizes(colSpan: ColSpan): string {
  if (colSpan === 12) return HOME_LCP_SIZES;
  const desktop = { 8: "66vw", 6: "50vw", 4: "34vw" }[colSpan];
  return `(max-width: 767px) 100vw, ${desktop}`;
}

export function aspectBox(aspect: string | undefined): { width: number; height: number } {
  const source = aspect ?? "16 / 10";
  const [rawW, rawH] = source.split("/").map((part) => Number(part.trim()));
  const width = 1600;
  const height = Math.max(1, Math.round((width * rawH) / rawW));
  return { width, height };
}
