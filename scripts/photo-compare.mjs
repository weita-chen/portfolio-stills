#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import path from "node:path";

const base = process.env.PROVE_URL || "http://127.0.0.1:8080";
const out = "/workspace/artifacts/photo-compare/after";
await mkdir(out, { recursive: true });

const shots = [
  { name: "photo-en-desktop", path: "/photography/en", viewport: { width: 1440, height: 900 } },
  { name: "photo-en-mobile", path: "/photography/en", viewport: { width: 390, height: 844 } },
  { name: "photo-zh-desktop", path: "/photography/zh-tw", viewport: { width: 1440, height: 900 } },
  { name: "photo-zh-mobile", path: "/photography/zh-tw", viewport: { width: 390, height: 844 } },
];

const browser = await chromium.launch({ headless: true });
for (const shot of shots) {
  const page = await browser.newPage({ viewport: shot.viewport, deviceScaleFactor: 1 });
  await page.goto(base + shot.path, { waitUntil: "networkidle", timeout: 45000 });
  await page.locator(".slideshow img.is-active").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1600);
  const file = path.join(out, `${shot.name}.png`);
  await page.screenshot({ path: file });
  const info = await page.evaluate(() => {
    const img = document.querySelector(".slideshow img.is-active");
    const box = img?.getBoundingClientRect();
    return {
      currentSrc: img?.currentSrc || "",
      opacity: img ? getComputedStyle(img).opacity : "",
      slides: document.querySelectorAll(".slideshow img").length,
      box: box ? { w: Math.round(box.width), h: Math.round(box.height) } : null,
    };
  });
  console.log(shot.name, info);
  await page.close();
}
await browser.close();

for (const shot of shots) {
  const before = sharp(`/workspace/artifacts/photo-compare/before/${shot.name}.png`);
  const after = sharp(`/workspace/artifacts/photo-compare/after/${shot.name}.png`);
  const [bm, am] = await Promise.all([before.metadata(), after.metadata()]);
  const width = Math.min(bm.width, am.width);
  const height = Math.min(bm.height, am.height);
  const [bRaw, aRaw] = await Promise.all([
    sharp(`/workspace/artifacts/photo-compare/before/${shot.name}.png`).resize(width, height).ensureAlpha().raw().toBuffer(),
    sharp(`/workspace/artifacts/photo-compare/after/${shot.name}.png`).resize(width, height).ensureAlpha().raw().toBuffer(),
  ]);
  let sum = 0;
  let hot = 0;
  const pixels = width * height;
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    const d = Math.abs(bRaw[o] - aRaw[o]) + Math.abs(bRaw[o + 1] - aRaw[o + 1]) + Math.abs(bRaw[o + 2] - aRaw[o + 2]);
    sum += d / 3;
    if (d / 3 > 24) hot++;
  }
  console.log(
    `${shot.name} meanΔ ${(sum / pixels).toFixed(2)} hot ${(100 * hot / pixels).toFixed(2)}% ${width}x${height}`,
  );
}
