# Shared performance plan

Do not implement this until the owner approves it. None of the changes below are in the tree. Filmmaking-only work (Clash self-host, poster preload, deferred GSAP/hls) is separate and does not touch these files.

Measured on the production preview before the filmmaking-only pass (Lighthouse 12, simulated mobile, Chrome 158):

| Page | Mobile perf | LCP | TBT | Notes |
| --- | --- | --- | --- | --- |
| `/filmmaking/en` | 68 | 4.8s | 259ms | LCP is the Showreel poster |
| `/photography/en` | 53 | 11.3s | 402ms | CLS 0.053 |

The dominant render-blocking request on both rooms is the shared Google Fonts stylesheet in `src/routes/__root.tsx` (~139KB CSS, ~2337ms wasted on the film mobile run). Shared `styles.css` was ~8KB and ~359ms. Filmmaking CSS was ~5.6KB and ~359ms. Those two stylesheets are small next to the Google CSS.

## (a) `<html lang>` from the URL

**Change.** In `src/routes/__root.tsx` only, stop hardcoding `<html lang="en">`. Derive the language from the first URL segment:

- path starts with `/zh-tw` or contains `/$lang` equal to `zh-tw` (both `/photography/zh-tw` and `/filmmaking/zh-tw`) → `lang="zh-Hant-TW"`
- otherwise → `lang="en"`

Do it in the root route component (it already renders `<html>`) so the SSR document matches the URL. Keep `suppressHydrationWarning` if the client still adjusts `documentElement.lang`.

**Mobile perf gain.** None, for `/filmmaking` or `/photography`. This is an accessibility/SEO correction, not a speed fix.

**Risk to `/photography` look.** None. `FilmShell` already sets `document.documentElement.lang` after load and restores the previous value on unmount. SSR would finally match that. No CSS depends on `html[lang]`.

## (b) Self-host the shared Google Fonts

**Change.**

- Scope: `src/routes/__root.tsx` (drop the `FONT` stylesheet and the `fonts.googleapis.com` / `fonts.gstatic.com` preconnects once nothing else needs them) plus new files under something like `public/fonts/` and an `@font-face` block. `src/styles.css` font-family names stay the same (`--font-sans`, `--font-serif`), so photography markup does not change. No filmmaking file needs to change for this.
- Families in the current CSS URL: Outfit 300/400/500, Newsreader roman 400/500 + italic 400 (opsz 6–72), Noto Sans TC 400/500, Noto Serif TC 400/500. All four are SIL Open Font License, so self-hosting woff2 on this site is allowed. Do not commit full CJK fonts.
- Outfit and Newsreader: latin (and Newsreader italic) subsets, `font-display: swap`. Preload only the one or two latin files that paint above the fold (Outfit 400 on both rooms; Newsreader 400 on photography). Do not preload every weight.
- Noto Sans TC and Noto Serif TC: unicode-range subsets built from the actual zh-tw strings in photography and filmmaking copy, split by range so a page does not download the whole Traditional Chinese font. `font-display: swap`. Do not preload them ahead of the LCP image; let the unicode-range CSS fetch them after first paint.

**Mobile perf gain.**

- Removes the ~2.3s render-blocking Google CSS on both `/filmmaking` and `/photography`. In this sandbox that is the largest single LCP waiter. A reasonable expectation is roughly 1.5–2.3s off mobile LCP on both rooms, and a film home score in the low-to-mid 80s rather than ~68. It does **not** guarantee 90: the LCP element is still an image, the shared client bundle is still parsed on the main thread, and photography's mobile LCP was 11.3s (its own images, not only fonts).
- `/filmmaking` body copy uses Outfit from this shared sheet, so the film room pays the 2.3s even after Clash Display is self-hosted.

**Risk to `/photography` look.**

- Real, but bounded. `font-display: swap` is already what the Google URL requests, so FOUT behavior stays the same; the win is that the CSS file itself stops blocking first paint.
- If a zh-tw glyph is missing from the subset, the stack already falls through to PingFang TC / Microsoft JhengHei / Songti TC / PMingLiU. Shapes will differ from Noto, which is visible on Traditional Chinese pages. An Outfit or Newsreader subset that misses a latin glyph renders tofu. Opsz/italic Newsreader must be subset carefully or photography serif headlines change weight and italic.
- Variable-font vs static-file mismatch can shift photography's measured line lengths. Keep the same family names and the weights the CSS already uses.

## (c) Other shared mobile LCP blockers

Do not change these without the same approval.

| Item | Exact scope | Expected mobile gain | Look risk |
| --- | --- | --- | --- |
| Render-blocking `src/styles.css` (~8KB, ~359ms on the film run), linked from `__root.tsx` and imported by the root route | `src/styles.css` and the root `<link>`. Inlining the critical above-the-fold rules and deferring the rest would touch photography's global CSS | A few hundred milliseconds on both rooms, much smaller than the Google CSS. Not enough to reach 90 alone | Medium. Photography and the entrance page share this file. A bad split causes a flash of unstyled type, grid, or color |
| Shared client JS (router shell, root bundle). Film home's extra JS is already small; TBT on both rooms has this floor (film home 259ms, photography 402ms before the film pass) | `src/routes/__root.tsx`, `src/router.tsx`, and whatever the root route pulls in (auth provider, preview bridge). Not a filmmaking-only edit | TBT, not LCP, unless a long task delays the LCP image. Maybe tens to a couple hundred milliseconds of TBT on both rooms if the root graph is trimmed | Low visually, higher behavior risk (auth, preview bridge, photography hydration) |
| Photography image weight and CLS (mobile LCP 11.3s, CLS 0.053) | Photography routes and `src/components/media.tsx` only. Not shared with filmmaking | Large for `/photography` only. None for `/filmmaking` | High if sizes, crops, or priority change the photo grid |
| Response compression and cache headers. `vite preview` does not compress; the ~139KB font CSS is uncompressed here. Vercel may already gzip/brotli | Hosting config (`vercel.json` or the platform), not component code | Shrinks transfer time of the shared CSS and JS on a cold mobile connection. Secondary to removing the Google CSS round trip | None, if limited to compression and cache |

Clash Display is not in this list. It is filmmaking-only, already self-hosted at `public/film/fonts/clash-display-500.woff2` and `clash-display-600.woff2` under the ITF Free Font License (self-hosting on this site is allowed; the files are not a redistributable font product). That removes the Fontshare CSS (~761ms) without a shared-file diff. JetBrains Mono stays a Google stylesheet with `media="print"` so it is not render-blocking; filmmaking swaps it to `all` after the file has loaded.
