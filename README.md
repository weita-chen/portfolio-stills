# WEITA CHEN — Still Photography

Bilingual portfolio (English `/en`, Traditional Chinese `/zh-tw`). Photography leads; copy and most projects are still slots you can fill without rebuilding the pages.

## Update the work

All editable copy and projects live in:

- `src/content/site.ts` — name, homepage line, about, contact email, slideshow timing, hero image picks
- `src/content/projects.ts` — the ten projects, image order, layout, publication, and grid placement

To add an eleventh project, append an object to the `projects` array. Give it a unique `slug`, `order`, localized `title` / `description`, `images`, and `layoutSections`. The Work index and project page read that list. No page component needs a new file.

Image fields:

- `src` — path under `public/`, for example `/photography/my-project/01.jpg`
- `width` / `height` — pixel size, so the frame does not jump while loading
- `alt.en` and `alt["zh-TW"]`
- `objectPosition` — optional, such as `"30% center"`
- `placeholder: true` — omit `src` and the site draws a labeled empty frame
- `drive` — optional note of the original Drive file id and filename

`published: false` hides a project from the index and its URL.

`layoutSections` order is the page. Supported blocks: `hero`, `intro`, `full`, `single`, `pair`, `asymmetric`, `text`. Not every project has to use all of them.

Homepage slideshow ids are `heroSlides` in `src/content/site.ts`. Interval is `slideshowMs`.

About experience is the `experience` array in `src/content/site.ts`. Leave it empty rather than inventing jobs.

## Photographs currently mapped from Google Drive

Folder: [portfolio drive](https://drive.google.com/drive/folders/1HEHrb2Fh9_n_3j98Bq-7IfwTDayU4yvX)

| Site project | Drive folder | Files |
| --- | --- | --- |
| Yilan, Mt. Taiping | nature / project 01 Yilan Mt. Taiping | mt taiping-1.jpg … 4.jpg |
| Bubble Tea Shop | products / project 01 bubble tea shop | tea shop-1.jpg … 5.jpg |
| NYC Spring | street / project 01 NYC SPRING | NYC SPRING-1.jpg … 9.jpg |

Originals were copied into `public/photography/` because private Drive links are not reliable public image URLs. Projects 04–10 have no files in Drive yet. They are labeled placeholders.

## Contact

Set the real address in `contactEmail` inside `src/content/site.ts`. That enables the `mailto:` link.

The form validates name, email, and message. It only delivers when the server environment variable `CONTACT_WEBHOOK_URL` is set to an endpoint that accepts `POST` JSON:

```json
{ "name": "", "email": "", "organization": "", "projectType": "", "message": "" }
```

Until that variable exists, the form says the message was **not** sent. A hidden honeypot field drops obvious spam. Do not put the webhook URL in a `VITE_` variable.

Optional: `VITE_SITE_URL` (for example `https://example.com`) turns on canonical and `hreflang` links. Share-card images are site-wide, not per project.

## Language

The URL is the language. A visitor’s last choice is remembered in `localStorage` (`weita-lang`) and used only when they open `/` with no `/en` or `/zh-tw` in the path. An explicit localized URL is never overridden.

## Run

```sh
npm run dev
```

Production build: `npm run build`. The app is prepared for the usual Vercel deployment of this repository (TanStack Start). Direct links such as `/en/work/nyc-spring` are real routes.

No designated GitHub repository was named in the brief, and this workspace is not yet pushed. GitHub user `weita-chen` has no existing portfolio repo. Publish from the project host, or create a repository when you want the source on GitHub.
