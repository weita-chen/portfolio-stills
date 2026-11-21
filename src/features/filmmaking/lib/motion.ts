import { useEffect, useState } from "react";

export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  soft: "power1.out",
  expo: "expo.out",
} as const;

export const DUR = {
  micro: 0.25,
  fast: 0.3,
  base: 0.5,
  slide: 0.4,
  fade: 0.35,
  flip: 0.7,
  reveal: 0.8,
} as const;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function useFinePointer() {
  const [fine, setFine] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return fine;
}

export function useSaveData() {
  const [saveData, setSaveData] = useState(false);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setSaveData(Boolean(connection?.saveData));
  }, []);
  return saveData;
}

export function formatTimecode(seconds?: number) {
  if (seconds == null || !Number.isFinite(seconds)) return "";
  const fps = 24;
  const total = Math.max(0, seconds);
  const frames = Math.floor((total % 1) * fps);
  const whole = Math.floor(total);
  const ss = whole % 60;
  const mm = Math.floor(whole / 60) % 60;
  const hh = Math.floor(whole / 3600);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(frames)}`;
}

export function formatClock(seconds?: number) {
  if (seconds == null || !Number.isFinite(seconds)) return "";
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

export function videoFrameVars(ratio: string): { aspect: string; ar: number } {
  const [width, height] = ratio.split(":").map((part) => Number(part.trim()));
  if (!width || !height) return { aspect: "16 / 9", ar: 16 / 9 };
  return { aspect: `${width} / ${height}`, ar: width / height };
}
