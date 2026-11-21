#!/usr/bin/env node
// Category-filter layout proof for the filmmaking work grid.
// Clicks every category, including a rapid pass, and asserts card boxes never
// overlap or collapse while the filter settles. Desktop + mobile, en + zh-tw,
// and prefers-reduced-motion.
import { chromium } from "playwright";

const base = process.env.FILM_PROVE_URL || "http://127.0.0.1:8080";
const runs = [
  { lang: "en", viewport: { width: 1280, height: 800 }, reduced: false, name: "desktop en" },
  { lang: "zh-tw", viewport: { width: 1280, height: 800 }, reduced: false, name: "desktop zh-tw" },
  { lang: "en", viewport: { width: 390, height: 844 }, reduced: false, name: "mobile en" },
  { lang: "zh-tw", viewport: { width: 390, height: 844 }, reduced: false, name: "mobile zh-tw" },
  { lang: "en", viewport: { width: 1280, height: 800 }, reduced: true, name: "desktop en reduced" },
  { lang: "zh-tw", viewport: { width: 390, height: 844 }, reduced: true, name: "mobile zh-tw reduced" },
];

function overlaps(a, b) {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 2 && h > 2 ? { w: Math.round(w), h: Math.round(h) } : null;
}

async function readGrid(page) {
  return page.evaluate(() => {
    const grid = document.querySelector(".film-grid");
    const bounds = grid?.getBoundingClientRect();
    const cards = [...document.querySelectorAll(".film-card")].map((el) => {
      const rect = el.getBoundingClientRect();
      const img = el.querySelector(".film-card-frame img");
      const image = img?.getBoundingClientRect();
      const imgStyle = img ? getComputedStyle(img) : null;
      return {
        title: el.querySelector("h2")?.textContent?.trim() || el.dataset.slug || "card",
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        position: getComputedStyle(el).position,
        opacity: getComputedStyle(el).opacity,
        inline: el.getAttribute("style") || "",
        poster: img
          ? {
              width: image.width,
              height: image.height,
              opacity: imgStyle.opacity,
              display: imgStyle.display,
              visibility: imgStyle.visibility,
            }
          : null,
      };
    });
    return {
      gridHeight: bounds?.height ?? 0,
      gridWidth: bounds?.width ?? 0,
      cards,
    };
  });
}

function assertSample(label, data, failures) {
  if (data.cards.length < 2) failures.push(`${label}: expected at least 2 cards, got ${data.cards.length}`);
  if (data.gridHeight < 120) failures.push(`${label}: grid collapsed to ${Math.round(data.gridHeight)}px`);
  for (const card of data.cards) {
    if (card.width < 48 || card.height < 48) {
      failures.push(`${label}: ${card.title} collapsed to ${Math.round(card.width)}x${Math.round(card.height)}`);
    }
    if (card.position === "absolute") failures.push(`${label}: ${card.title} is position:absolute`);
    if (/(?:^|;)\s*(?:position|top|left|width|height|grid-area|transform|max-width|min-width|max-height|min-height)\s*:/i.test(card.inline)) {
      failures.push(`${label}: ${card.title} leaked inline layout (${card.inline.slice(0, 160)})`);
    }
    if (!card.poster) failures.push(`${label}: ${card.title} has no poster`);
    else if (card.poster.display === "none" || card.poster.visibility === "hidden" || Number(card.poster.opacity) === 0) {
      failures.push(`${label}: ${card.title} poster hidden`);
    } else if (card.poster.width < 8 || card.poster.height < 8) {
      failures.push(`${label}: ${card.title} poster box ${Math.round(card.poster.width)}x${Math.round(card.poster.height)}`);
    }
  }
  for (let i = 0; i < data.cards.length; i++) {
    for (let j = i + 1; j < data.cards.length; j++) {
      const hit = overlaps(data.cards[i], data.cards[j]);
      if (hit) failures.push(`${label}: ${data.cards[i].title} overlaps ${data.cards[j].title} by ${hit.w}x${hit.h}`);
    }
  }
  return data.gridHeight;
}

async function arm(page) {
  await page.waitForSelector(".film-card", { timeout: 45000 });
  await page.waitForFunction(() => document.documentElement.dataset.filmReady === "1", null, { timeout: 20000 });
  await page.evaluate(() => {
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  });
  const loaded = await page
    .waitForFunction(
      () => performance.getEntriesByType("resource").some((entry) => /gsap|flip/i.test(entry.name)),
      null,
      { timeout: 8000 },
    )
    .then(() => true)
    .catch(() => false);
  await page.waitForTimeout(loaded ? 250 : 500);
  return loaded;
}

async function clickFilter(page, index) {
  const button = page.locator(".film-filter-row").first().locator("button").nth(index);
  await button.click();
}

async function probe(page, label, failures) {
  const heights = [];
  const marks = [
    ["0ms", 0],
    ["100ms", 100],
    ["300ms", 200],
    ["settle", 700],
  ];
  for (const [name, wait] of marks) {
    if (wait) await page.waitForTimeout(wait);
    const data = await readGrid(page);
    heights.push(assertSample(`${label} @${name}`, data, failures));
  }
  const [first] = heights;
  for (const height of heights) {
    if (Math.abs(height - first) > 2) {
      failures.push(`${label}: grid height moved ${Math.round(first)} -> ${Math.round(height)}`);
      break;
    }
  }
}

async function runCase(browser, run) {
  const failures = [];
  const context = await browser.newContext({
    viewport: run.viewport,
    reducedMotion: run.reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error?.message || error)));
  await page.goto(`${base}/filmmaking/${run.lang}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const flipLoaded = await arm(page);
  const count = await page.locator(".film-filter-row").first().locator("button").count();
  if (count !== 8) failures.push(`${run.name}: expected 8 category buttons, got ${count}`);
  const initial = await readGrid(page);
  assertSample(`${run.name} initial`, initial, failures);

  for (let index = 1; index < count; index++) {
    await clickFilter(page, index);
    await probe(page, `${run.name} category ${index}`, failures);
  }
  await clickFilter(page, 0);
  await probe(page, `${run.name} all`, failures);

  for (let index = 1; index < count; index++) {
    await clickFilter(page, index);
    const data = await readGrid(page);
    assertSample(`${run.name} rapid ${index} @0ms`, data, failures);
    await page.waitForTimeout(40);
  }
  await clickFilter(page, 0);
  await probe(page, `${run.name} rapid all`, failures);

  if (errors.length) failures.push(`${run.name} pageerror: ${errors.slice(0, 3).join(" | ")}`);
  await context.close();
  return { name: run.name, flipLoaded, failures };
}

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const results = [];
for (const run of runs) results.push(await runCase(browser, run));
await browser.close();

let failed = 0;
for (const result of results) {
  const status = result.failures.length ? "FAIL" : "ok";
  if (result.failures.length) failed += 1;
  console.log(`${status}  ${result.name}  flipLoaded=${result.flipLoaded}  issues=${result.failures.length}`);
  for (const failure of result.failures) console.log(`  - ${failure}`);
}
if (failed) {
  console.error(`film-prove: ${failed} case(s) failed`);
  process.exit(1);
}
console.log("film-prove: filter layout held on every category");
