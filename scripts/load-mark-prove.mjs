#!/usr/bin/env node
// First-load wordmark proof. Fast loads must not mount the mark.
// A tiny off-screen image keeps window "load" pending so the mark can appear.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.env.PROVE_URL || "http://127.0.0.1:8080";
const out = "/workspace/artifacts/load-mark";
await mkdir(out, { recursive: true });

const HOLD =
  '<img src="/__hold__.svg" alt="" width="1" height="1" style="position:absolute;width:1px;height:1px;left:-9999px">';

const browser = await chromium.launch({ headless: true });
const failures = [];

function note(ok, message) {
  console.log(`${ok ? "ok" : "FAIL"} ${message}`);
  if (!ok) failures.push(message);
}

async function withHold(page, holdMs) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const timer = setTimeout(release, holdMs);
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (request.resourceType() === "document") {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers["content-encoding"];
      delete headers["content-length"];
      const body = (await response.text()).replace("</body>", `${HOLD}</body>`);
      await route.fulfill({ status: response.status(), headers, body });
      return;
    }
    if (request.url().includes("__hold__.svg")) {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/>",
      });
      return;
    }
    await route.continue();
  });
  return () => {
    clearTimeout(timer);
    release();
  };
}

async function open(path, { reduced = false, holdMs = 0, viewport = { width: 1280, height: 800 } } = {}) {
  const page = await browser.newPage({
    viewport,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const hits = [];
  page.on("request", (request) => {
    if (request.url().includes("loading-wordmark")) hits.push(request.url());
  });
  await page.addInitScript(() => {
    window.__markPhases = [];
    const push = () => {
      const el = document.querySelector(".load-mark");
      window.__markPhases.push(el ? el.getAttribute("data-on") : "gone");
    };
    new MutationObserver(push).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-on"],
    });
  });
  const release = holdMs ? await withHold(page, holdMs) : () => {};
  await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 45000 });
  return { page, hits, release };
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const hits = [];
  page.on("request", (request) => {
    if (request.url().includes("loading-wordmark")) hits.push(request.url());
  });
  await page.addInitScript(() => {
    Object.defineProperty(document, "readyState", { configurable: true, get: () => "complete" });
  });
  await page.goto(`${base}/photography/en`, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(400);
  const mark = await page.locator(".load-mark").count();
  const html = await page.content();
  note(mark === 0 && hits.length === 0, `fast photography home skips mark (nodes=${mark}, requests=${hits.length})`);
  note(!html.includes("loading-wordmark"), "wordmark is not in the server HTML");
  await page.close();
}

{
  const { page, hits, release } = await open("/", { holdMs: 1500 });
  await page.waitForTimeout(600);
  const mark = await page.locator(".load-mark").count();
  note(mark === 0 && hits.length === 0, `hub has no loader (nodes=${mark}, requests=${hits.length})`);
  release();
  await page.close();
}

{
  const { page, hits, release } = await open("/photography/en", {
    holdMs: 1800,
    viewport: { width: 1440, height: 900 },
  });
  const mark = page.locator(".load-mark");
  try {
    await mark.waitFor({ state: "visible", timeout: 2500 });
    const tone = await mark.getAttribute("data-tone");
    const src = await mark.locator("img").getAttribute("src");
    const cls = await page.evaluate(() => {
      const entries = performance.getEntriesByType("layout-shift");
      return entries.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value), 0);
    });
    note(tone === "light" && src?.includes("loading-wordmark-dark"), `photo home tone=${tone} src=${src}`);
    note(hits.some((url) => url.includes("loading-wordmark-dark")), "photo home requests the black wordmark");
    note(cls < 0.02, `photo home CLS while pending ${cls.toFixed(4)}`);
    await page.screenshot({ path: `${out}/photo-home-slow.png` });
    release();
    await page.waitForFunction(() => !document.querySelector(".load-mark"), null, { timeout: 4000 });
    note(true, "photo home mark leaves after load");
  } catch (error) {
    note(false, `photo home slow mark (${error.message})`);
    release();
  }
  await page.close();
}

{
  const { page, release } = await open("/filmmaking/en", { holdMs: 1800 });
  const mark = page.locator(".load-mark");
  try {
    await mark.waitFor({ state: "visible", timeout: 2500 });
    const tone = await mark.getAttribute("data-tone");
    const src = await mark.locator("img").getAttribute("src");
    note(tone === "dark" && src?.includes("loading-wordmark-light"), `film tone=${tone} src=${src}`);
    await page.screenshot({ path: `${out}/film-slow.png` });
    release();
  } catch (error) {
    note(false, `film slow mark (${error.message})`);
    release();
  }
  await page.close();
}

{
  const { page, release } = await open("/photography/en/work", { holdMs: 1800 });
  const mark = page.locator(".load-mark");
  try {
    await mark.waitFor({ state: "visible", timeout: 2500 });
    const tone = await mark.getAttribute("data-tone");
    const src = await mark.locator("img").getAttribute("src");
    note(tone === "dark" && src?.includes("loading-wordmark-light"), `photo work tone=${tone} src=${src}`);
    await page.screenshot({ path: `${out}/photo-work-slow.png` });
    release();
  } catch (error) {
    note(false, `photo work slow mark (${error.message})`);
    release();
  }
  await page.close();
}

{
  const { page, release } = await open("/photography/en", { holdMs: 1600, reduced: true });
  const mark = page.locator(".load-mark");
  try {
    await mark.waitFor({ state: "visible", timeout: 2500 });
    const transition = await mark.evaluate((el) => getComputedStyle(el).transitionDuration);
    note(transition === "0s", `reduced motion transition ${transition}`);
    release();
    await page.waitForFunction(() => !document.querySelector(".load-mark"), null, { timeout: 3000 });
    const phases = await page.evaluate(() => window.__markPhases);
    note(!phases.includes("false"), `reduced motion phases ${JSON.stringify(phases)}`);
  } catch (error) {
    note(false, `reduced motion mark (${error.message})`);
    release();
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("load-mark proof passed");
