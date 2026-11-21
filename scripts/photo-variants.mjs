import { pathToFileURL } from "node:url";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public/stills");
const outDir = path.join(root, "public/photo");
const cachePath = path.join(outDir, ".cache.json");
const manifestPath = path.join(root, "src/content/photo-manifest.ts");
const WIDTHS = [480, 960, 1440, 1920, 2560];

sharp.cache(false);
sharp.concurrency(1);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && /\.jpe?g$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function relPublic(file) {
  const rel = path.relative(path.join(root, "public"), file).split(path.sep).join("/");
  return `/${rel}`;
}

function outBase(publicSrc) {
  const without = publicSrc.replace(/^\/stills\//, "").replace(/\.jpe?g$/i, "");
  return path.join(outDir, without);
}

async function readCache() {
  try {
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    return {};
  }
}

async function encodeSet(buffer, width) {
  const base = sharp(buffer).rotate().resize({ width, withoutEnlargement: true });
  const [avif, webp, jpeg] = await Promise.all([
    base.clone().avif({ quality: 58, effort: 2 }).toBuffer(),
    base.clone().webp({ quality: 80 }).toBuffer(),
    base.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
  ]);
  return { avif, webp, jpeg };
}

async function one(file, cache) {
  const info = await stat(file);
  const key = relPublic(file);
  const stamp = `${info.mtimeMs}:${info.size}`;
  const cached = cache[key];
  if (cached?.stamp === stamp && cached.entry) return cached.entry;

  const meta = await sharp(file).rotate().metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceHeight = meta.height ?? 0;
  const widths = WIDTHS.filter((width) => width <= sourceWidth);
  if (!widths.length && sourceWidth) widths.push(sourceWidth);
  const dir = path.dirname(outBase(key));
  const stem = path.basename(key).replace(/\.jpe?g$/i, "");
  const blurName = `${stem}-blur.webp`;
  const made = widths.map((width) => ({
    width,
    names: {
      avif: `${stem}-${width}.avif`,
      webp: `${stem}-${width}.webp`,
      jpeg: `${stem}-${width}.jpg`,
    },
  }));
  const publicDir = `/photo/${key.replace(/^\/stills\//, "").replace(/\/[^/]+$/, "")}`.replace(/\/$/, "");
  const join = (format) => made.map((item) => `${publicDir}/${item.names[format]} ${item.width}w`).join(", ");
  const fallback = made[made.length - 1];
  const entry = {
    blur: `${publicDir}/${blurName}`,
    avif: join("avif"),
    webp: join("webp"),
    jpeg: join("jpeg"),
    src: fallback ? `${publicDir}/${fallback.names.jpeg}` : key,
    width: sourceWidth,
    height: sourceHeight,
  };
  const ready = await (async () => {
    try {
      if ((await stat(path.join(dir, blurName))).size <= 0) return false;
      for (const item of made) {
        for (const name of Object.values(item.names)) {
          if ((await stat(path.join(dir, name))).size <= 0) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  })();
  if (ready) {
    cache[key] = { stamp, entry };
    return entry;
  }

  const buffer = await readFile(file);
  await mkdir(dir, { recursive: true });
  const blurBuf = await sharp(buffer).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  await writeFile(path.join(dir, blurName), blurBuf);
  for (const item of made) {
    const encoded = await encodeSet(buffer, item.width);
    await Promise.all(
      Object.entries(item.names).map(([format, name]) => writeFile(path.join(dir, name), encoded[format])),
    );
  }
  cache[key] = { stamp, entry };
  return entry;
}

export async function generatePhotoVariants() {
  const files = await walk(sourceDir);
  const cache = await readCache();
  const manifest = {};
  let index = 0;
  const queue = files.slice();
  async function worker() {
    while (queue.length) {
      const file = queue.shift();
      if (!file) return;
      const key = relPublic(file);
      manifest[key] = await one(file, cache);
      index += 1;
      if (index % 20 === 0 || index === files.length) {
        console.log(`[photo] ${index}/${files.length}`);
      }
    }
  }
  await mkdir(outDir, { recursive: true });
  const workers = Array.from({ length: 2 }, () => worker());
  await Promise.all(workers);
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  const body =
    "export type PhotoVariant = {\n" +
    "  blur: string;\n" +
    "  avif: string;\n" +
    "  webp: string;\n" +
    "  jpeg: string;\n" +
    "  src: string;\n" +
    "  width: number;\n" +
    "  height: number;\n" +
    "};\n\n" +
    `export const photoManifest: Record<string, PhotoVariant> = ${JSON.stringify(ordered)};\n`;
  await writeFile(manifestPath, body);
  await writeFile(cachePath, JSON.stringify(cache));
  console.log(`[photo] ${Object.keys(ordered).length} variants`);
  return ordered;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generatePhotoVariants().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
