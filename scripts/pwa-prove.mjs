import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.PWA_PROVE_URL || "http://127.0.0.1:8081";
const failures = [];
function check(ok, msg) {
  console.log(`${ok ? "ok" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
}

const manifestRes = await fetch(`${base}/manifest.webmanifest`);
const manifestType = manifestRes.headers.get("content-type") || "";
check(manifestRes.ok, `manifest HTTP ${manifestRes.status}`);
check(
  /application\/manifest\+json|application\/json/.test(manifestType),
  `manifest content-type is ${manifestType}`,
);
const manifest = await manifestRes.json();
check(manifest.name === "WEITA", `manifest.name is ${JSON.stringify(manifest.name)}`);
check(manifest.short_name === "WEITA", `manifest.short_name is ${JSON.stringify(manifest.short_name)}`);
check(manifest.start_url === "/", `start_url is ${manifest.start_url}`);
check(manifest.scope === "/", `scope is ${manifest.scope}`);
check(manifest.display === "standalone", `display is ${manifest.display}`);
check(manifest.background_color === "#000000", `background_color is ${manifest.background_color}`);
check(manifest.theme_color === "#000000", `theme_color is ${manifest.theme_color}`);
const srcs = (manifest.icons || []).map((i) => i.src);
check(srcs.includes("/icons/icon-192.png"), "has 192 icon");
check(srcs.includes("/icons/icon-512.png"), "has 512 icon");
check(srcs.includes("/icons/icon-512-maskable.png"), "has 512 maskable icon");
check(
  (manifest.icons || []).some((i) => i.purpose === "maskable" && i.sizes === "512x512"),
  "maskable 512 is marked purpose=maskable",
);
check(!JSON.stringify(manifest).includes("Grok"), "manifest has no Grok naming");

for (const src of ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-512-maskable.png", "/icons/apple-touch-icon.png", "/sw.js", "/offline.html"]) {
  const res = await fetch(`${base}${src}`);
  check(res.ok, `${src} HTTP ${res.status}`);
}

async function status(path, opts = {}) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...opts });
  const loc = res.headers.get("location") || "";
  return { status: res.status, loc };
}

const hub = await status("/");
check(hub.status === 200, `/ is ${hub.status} (hub must load)`);

const photo = await status("/photography");
check(photo.status === 307 && photo.loc.endsWith("/photography/en"), `/photography is ${photo.status} -> ${photo.loc}`);
const film = await status("/filmmaking");
check(film.status === 307 && film.loc.endsWith("/filmmaking/en"), `/filmmaking is ${film.status} -> ${film.loc}`);

const photoZh = await status("/photography", { headers: { cookie: "weita-lang=zh-tw" } });
check(photoZh.status === 307 && photoZh.loc.endsWith("/photography/zh-tw"), `weita-lang=zh-tw /photography is ${photoZh.status} -> ${photoZh.loc}`);

const photoEn = await status("/photography/en");
const filmEn = await status("/filmmaking/en");
check(photoEn.status === 200, `/photography/en is ${photoEn.status}`);
check(filmEn.status === 200, `/filmmaking/en is ${filmEn.status}`);

const grokManifest = await (await fetch(`${base}/__grok/manifest.webmanifest`)).json();
check(grokManifest.name === "WEITA" && grokManifest.short_name === "WEITA", `__grok/manifest is ${grokManifest.name}`);

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`${base}/`, { waitUntil: "networkidle" });

const head = await page.evaluate(() => {
  const attr = (sel, name) => document.querySelector(sel)?.getAttribute(name) || "";
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") || "";
  return {
    title: document.title,
    manifest: attr('link[rel="manifest"]', "href"),
    apple: attr('link[rel="apple-touch-icon"]', "href"),
    appName: meta("application-name"),
    appleTitle: meta("apple-mobile-web-app-title"),
    capable: meta("apple-mobile-web-app-capable"),
    theme: meta("theme-color"),
    headText: document.head.innerHTML,
  };
});
check(head.manifest === "/manifest.webmanifest", `head manifest href is ${head.manifest}`);
check(head.apple === "/icons/apple-touch-icon.png", `apple-touch-icon is ${head.apple}`);
check(head.appName === "WEITA", `application-name is ${head.appName}`);
check(head.appleTitle === "WEITA", `apple-mobile-web-app-title is ${head.appleTitle}`);
check(head.capable === "yes", `apple-mobile-web-app-capable is ${head.capable}`);
check(head.theme === "#000000", `theme-color is ${head.theme}`);
check(!/Grok App|Grok Build/.test(head.headText), "head has no Grok App/Grok Build naming");

const sw = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return { error: "no serviceWorker" };
  const deadline = Date.now() + 8000;
  let reg = await navigator.serviceWorker.getRegistration("/");
  while (!reg?.active && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 150));
    reg = (await navigator.serviceWorker.ready) || (await navigator.serviceWorker.getRegistration("/"));
  }
  return {
    scope: reg?.scope ?? "",
    scriptURL: reg?.active?.scriptURL ?? "",
    state: reg?.active?.state ?? "",
  };
});
check(!sw.error, `SW available (${sw.error || "ok"})`);
check(sw.state === "activated", `SW state is ${sw.state}`);
check(sw.scriptURL.endsWith("/sw.js"), `SW script is ${sw.scriptURL}`);
check(sw.scope.endsWith("/"), `SW scope is ${sw.scope}`);

// Offline fallback: kill network after SW is ready, reload.
await context.setOffline(true);
try {
  const offlineNav = page.goto(`${base}/photography/en`, { waitUntil: "domcontentloaded", timeout: 8000 });
  const result = await offlineNav.then(() => page.evaluate(() => document.body.innerText)).catch((err) => ({ error: String(err) }));
  if (result && result.error) {
    check(false, `offline navigation failed: ${result.error}`);
  } else {
    const text = String(result);
    check(/offline|WEITA/i.test(text), `offline fallback text includes WEITA/offline (${JSON.stringify(text.slice(0, 80))})`);
  }
} finally {
  await context.setOffline(false);
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} PWA checks failed`);
  process.exit(1);
}
console.log("\nall PWA checks passed");
