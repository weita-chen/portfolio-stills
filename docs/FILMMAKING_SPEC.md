# WEITA CHEN — Filmmaking｜動態影像作品集網站 設計與技術規格 v1.2

> 交付對象：Grok Build（AI coding agent，在 weitachen.pro 主站專案內工作）
> 文件語言：繁體中文（台灣）；程式識別字、檔名、套件名一律英文
> 參考標竿：https://www.earcandy.shop/（目標：達到並在影像體驗上超越）
> 版本：v1.2（2026-11-20 22:50 Asia/Taipei）
> 上線位置：**https://weitachen.pro/filmmaking**，**直接做在現有 weitachen.pro 主站 app 裡**，取代目前的 `/filmmaking` 佔位頁；姊妹房間 `/photography`（已近完成）與入口頁 `/` **不可被破壞**。
> 技術棧（沿用主站，已定案）：**TanStack Start（TanStack Router 檔案式路由、SSR）+ React + Vite + TypeScript + Tailwind CSS v4**，由 Grok App Builder／Grok Build 建置、部署在 Vercel。影像房間新增：**GSAP 3.13+**（ScrollTrigger / SplitText / Flip，皆免費）、**Mux Video**（1080p、`basic` 品質）、**Video.js v10**（`@videojs/react` + `@videojs/mux-video`，Mux 官方維護）、**zod**。
> 品牌：對外名稱與字標 **WEITA CHEN**；「WITNESS（見證／在場／真實）」是這個房間的創作理念與語氣，不作為網站名稱。

### v1.2 變更摘要
- 架構改為**主站內的一組路由**：不再有獨立 Next.js app、`basePath`、rewrites、Microfrontends、`next-video`、App Router 專屬功能。
- 路由：`/filmmaking`（語言分流）、`/filmmaking/en/...`、`/filmmaking/zh-tw/...`，**照攝影房間的做法**（§16）。
- Lightbox 改用 TanStack Router 的 **route masking**（§6.6），取代 Next 的 intercepting routes。
- 圖片改用自寫 `MuxImage`（`srcset` + Mux 縮圖 `width` 參數），取代 `next/image`。
- 字體全部用 `<link>` 在影像房間的路由 `head()` 載入：Clash Display（Fontshare CSS API）、JetBrains Mono（Google Fonts）；Outfit / Noto Sans TC 已由主站全域載入。
- 品牌資產改用正式 logo（§6.1、§15.2）。中文名暫寫「陳韋達」**（待韋達確認）**。
- 每個里程碑都附「不破壞主站」回歸檢查（§12.0）。

### v1.1 → v1.2 保留不變
設計方向、bento 版型、色彩與字級 tokens、動態數值、Mux 整合方式、Video.js v10、GSAP、Clash Display 授權結論、無障礙與效能目標、超越 Earcandy 的點子。

## 0. 給 Grok Build 的工作守則

1. 本文件是唯一事實來源。每個里程碑（§12）只做該里程碑範圍，不要偷跑。
2. **不可破壞主站**：入口頁 `/`、攝影房間 `/photography/**` 的檔案、路由、樣式、行為、字體載入一律不動。影像房間的程式全部放在自己的資料夾（§13），樣式全部以 `film-` 前綴或 `.film-root` 範圍限定。若必須改共用檔案（例如 root route、全域 CSS、`package.json`、Vite 設定），**先列出要改哪一行、為什麼，等 PM 同意再改**，且只能「新增」不能改既有行為。
3. 每個里程碑結束時：專案能 build、型別檢查與 lint 零錯誤；跑完 §12.0 回歸檢查；回報變更檔案清單、**預覽連結**、截圖（桌機 1440px、手機 390px，en 與 zh-tw）。
4. 所有設計數值用 §5 的 tokens，不在元件裡寫死顏色或字級。
5. 所有動畫集中在 `features/filmmaking/lib/motion.ts`，遵守 `prefers-reduced-motion`（§8）。
6. 影片只透過 Mux playback ID 存取；不把影片檔放進 repo。
7. 大方向不確定（頁面、文案、品牌）就停下來列問題，不自行決定。

## 1. Earcandy 拆解結果（實際讀原始碼）

> 資料來源：2026-11-20 以 curl 抓取 `earcandy.shop` 首頁/about/studio/blog/contact HTML、Webflow 共用 CSS（`ear-candy.webflow.shared.52b251325.min.css`），以及 jsDelivr 上 `@yes-chef/earcandy` 的 `videoHover.js@0.0.10`、`videoPlayer.js@0.0.7`、`hoverEffect.js`、`home.js`、`pageTransition.js`、`logoAnimation.js`、`signup.js`、`about.js`、`studio.js`、`contact.js@0.0.5`、`blog_list.js`、`sliders.js@0.0.6`，以及 `@yes-chef/yes-chef-sliders@1.0.0`（Swiper 包裝）。
> 標記：**【驗證】**＝直接從原始碼讀到；**【推論】**＝從行為/結構推測。

### 1.1 架構與頁面
- 【驗證】Webflow 站 + jQuery 3.5.1 + 各頁自己的 IIFE bundle（每支都內嵌一份 GSAP 3.12.5）。沒有 Lenis/Locomotive/Barba，也就是沒有平滑捲動，頁面切換是整頁重新載入（MPA）。
- 【驗證】頁面：`/`（Work）、`/about`（What we do）、`/studio`、`/blog`（Updates）、`/contact`。專案沒有獨立頁面，全部在首頁 lightbox 內播放；深連結用 `/?work=<slug>`，載入後由腳本找出 `[cms-item=slug]` 再程式化 `click()`。
- 【驗證】首頁結構：Nav → 作品 bento 牆（21 件）→ Clients logo 牆 → Footer（電子報表單 + 聯絡資訊 + 社群）。

### 1.2 色彩（CSS 變數，驗證）
| Token | 值 | 用途 |
|---|---|---|
| `--base-color-brand--off-black` | `#0F0E0F` | 全站背景 |
| `--base-color-brand--white` | `#FFFFFF` | 主要文字 |
| `--base-color-brand--purple` | `#9E7AD0` | 品牌強調（目前頁連結、按鈕字、選取色、輸入框邊框） |
| `--base-color-brand--black` | `#000000` | Lightbox 背景 |
| neutral 階 | `#111 / #222 / #444 / #666 / #AAA / #CCC / #EEE` | 次要文字（nav hover 用 `#AAA`） |
| 卡片遮罩 | `rgba(0,0,0,.2)`（`#0003`） | 縮圖上的暗化層 |

### 1.3 字體（驗證）
- 標題：**Mattone**（Regular 400、Black 900，自架 woff2）。Collletttivo 出品，設計師 Nunzio Mazzaferro，**SIL Open Font License（OFL）**，可免費商用、可自架；只支援拉丁字母，共 3 種字重。
- 內文：**Figtree** 400/500/600/700（OFL，Google Fonts 有）。
- 全站 `-webkit-font-smoothing: antialiased`。
- 字級（rem，桌機 → ≤991px → ≤479px）：
  - body：1.25 / — / 1.0，行高 1.5
  - h1：5 / 4 / 1.875，Mattone 900，行高 1.15
  - h2：3.875 / 2.75 / 1.5，Mattone 900，行高 1.15
  - h3：2.875 / 2.5 / 1.875，Mattone 900
  - h4：2 / 1.75 / 1.5，Mattone 700，行高 1.3
  - 作品卡標題 `.home-hero_title`（h2 → Mattone 900）：1.875 / — / 1.5；**第一張卡** 5rem（≥768px）、1.875rem（<768px）
  - 作品卡副標 `.home-hero_client`：Figtree 600、1.125rem、`uppercase`、`letter-spacing: .04em`、行高 1.15；第一張卡 1.875rem、`.03em`；手機 .875rem
  - Nav 連結：Mattone 400、**0.625rem**、`uppercase`、`letter-spacing: .05em`、padding `1.5rem .625rem`（極小字、寬字距）
  - 按鈕：Mattone 900、.875rem、uppercase、`.05em`、膠囊形（`border-radius: 50vw`）、padding 1.5rem
  - Lightbox 標題 1.25rem；細節文字 .75rem、`.02em`，欄名粗體 700

### 1.4 版面與間距（驗證）
- 斷點（Webflow 預設）：`≤991px`（平板）、`≤767px`（橫向手機）、`≤479px`（直向手機）；首頁 bento 另用 `min-width: 768px`。
- 容器：`max-width: 77.5rem`（1240px）置中；左右 padding `3rem` → `1.5rem`（≤991）→ `1rem`（≤479）。首頁作品牆在手機上 padding 0（滿版、圓角 0）。
- 主格線 `.grid_main`：12 欄，`column-gap 1.375rem`、`row-gap 1.5625rem`；手機 1 欄、gap 1rem。
- 區段 padding-top：small 3rem / medium 5rem / large 7rem（平板 4/6rem，手機 2/3/4rem）。
- 卡片：`border-radius: .5rem`、`overflow: hidden`；文字區絕對定位於左下 `inset: auto 1.75rem 1.25rem`，標題與副標間距 .5rem。
- **Bento 排列規則（≥768px，按 DOM 順序 `nth-child`）**：
  | 第幾件 | 欄寬（/12） | aspect-ratio |
  |---|---|---|
  | 1 | 12 | 31/15（≈2.07:1，接近寬銀幕） |
  | 2、5 | 4 | 無（被同列 8 欄卡撐高） |
  | 3、4 | 8 | 41/24 |
  | 6、7 | 6 | 61/35 |
  | 8 之後 | 4 | 16/10 |
  形成節奏：[滿版] → [4|8] → [8|4] → [6|6] → [4|4|4]…
  手機（<768px）：第 1 件 39/43（近直式），其餘 39/22。

### 1.5 作品卡互動（驗證，`hoverEffect.js` + `videoHover.js`）
- 卡片內層級：縮圖 `<img>`（object-fit cover）→ 20% 黑遮罩 → `<video class="lazy" preload="none" muted loop playsinline>`（z-index 100，`source` 用 `data-src`，指向 Vimeo progressive **720p MP4**）→ 文字 → 播放鈕。
- **預覽影片只在 hover 時才播**，不是捲動自動播：
  - `mouseenter`：若影片未載入，用 vanilla-lazyload 把 `data-src` 填入 → `loaded` 後 `currentTime = 0` 再 `play()`；已載入就直接 `play()`（從暫停處繼續）。
  - `mouseleave`：`pause()`（不淡出、不歸零，停在當下畫格）。
- **自訂游標＝播放鈕**：卡片 `cursor: none`；圓形播放鈕（直徑 4.375rem，手機 2.1875rem）跟著滑鼠，`gsap.to(x,y, { duration: .5, ease: "power3.out" })`，產生延遲跟隨感。
- Hover 時間軸（paused timeline，enter → `play()`、leave → `reverse()`）：
  1. 播放鈕：`filter: blur(10px) → blur(0)`、`opacity 0 → 1`，`.5s power3.out`
  2. 副標（客戶名）：從 `yPercent: 100, opacity: 0, skewX: 20` 進場，`.3s power1`，與 1 同時
  3. 標題：從 `y: 2rem` 上移到原位，`.3s power1`，同時
  → 靜止時只看到標題（略偏下）；hover 時標題上移、客戶名斜切滑入。
- 【推論】觸控裝置沒有 hover → 手機上只看縮圖、點擊開 lightbox，預覽影片永遠不會播。

### 1.6 Lightbox 播放器（驗證，`sliders.js` + `videoPlayer.js` + CSS）
- 一個全螢幕 `.video-popup_wrap`（`position: fixed; inset: 0; z-index: 9999; background: #000`），預設 `opacity: 0; pointer-events: none`，加 `.is-open` 時 `opacity: 1`，**`transition: opacity .35s`**（純 CSS，沒有 GSAP）。
- 內含 Swiper（所有作品預先渲染成 slide），速度 **400ms**、預設 slide 效果、可拖曳。點卡片 → `slideTo(index, 0)`（瞬間跳到）→ 開啟。
- 每張 slide：12 欄格線，影片佔 **10 欄**（16:9 Vimeo iframe）、資訊欄 **2 欄**（標題 + Client / Campaign / What We Did / Services 等欄位 + 底部上一部/下一部箭頭 1.875rem）。首尾箭頭 `opacity .6` 並停用。關閉鈕右上 `top: 1.5rem`，圖示 1.375rem。
- iframe 只在 lightbox 打開時才 lazy load；換 slide 或關閉時把全部 Vimeo player `pause()`。【推論】不會自動播放，要再按一次播放。
- 【驗證】沒有 ESC 關閉、沒有方向鍵、沒有 focus trap，也不會更新網址。
- 手機（≤479）：影片 100vw、資訊在下方、箭頭左右兩端。

### 1.7 頁面動畫（驗證）
- 首頁進場（`home.js`）：卡片先 `visibility: hidden`，再 `gsap.from(".home-hero_item", { y: "5rem", autoAlpha: 0, rotateZ: .5, stagger: .1 })`，duration 用 GSAP 預設 **.5s**、ease 預設 **power1.out**。Studio 頁圖片用同一組。
- 離場轉場（`pageTransition.js`）：攔截所有站內連結 → `gsap.to(".main-wrapper section", { y: "16px", opacity: 0, stagger: { amount: .5 }, ease: "power3.inOut" })`（.5s）→ 結束後再等 200ms → `location.href` 換頁。進場靠下一頁自己的進場動畫。`onbeforeunload` 捲回頂端。
- 文字逐字揭露（about / footer / contact，SplitType）：`.line { overflow: hidden }`，`.char` 從 `yPercent: 100` 進場、`stagger: .05`；About 段落從 `opacity 0, x: -1rem, blur(5px)` 進場；團隊區 ScrollTrigger `start: "top 80%"`，字元加 `scaleY 1.05 / scaleX .95` 的形變感。Footer 標語在 `top 75%` 觸發。
- Clients logo：ScrollTrigger `top 70%`，`opacity 0 + blur(10px)` 逐一 `stagger .1` 進場；hover 某個 logo 時其他降到 `opacity .2`。
- Logo hover：`rotate(10deg)`，`transition: transform .35s`。按鈕 `:active { scale(.95) }`，色彩轉場 .25s。

### 1.8 Nav（驗證）
- 左上圓形 logo（85px，平板 72px，手機 60px），絕對定位、會蓋出 nav 範圍。右側 5 個極小字連結；目前頁為紫色，hover `#AAA`。
- 【推論】Nav 不是固定（不 sticky），捲動後就離開畫面。
- 手機（Webflow `data-collapse="tiny"` → ≤479px）：漢堡鈕 → 全螢幕選單 `100dvh`、背景 off-black、連結 1.125rem 置中、底部社群 icon + email/電話，`transition: height .5s`。

### 1.9 Earcandy 的弱點（我們要超越的地方）
1. 21 支 720p MP4 預覽需要整支下載才能播，沒有自適應碼率；21 個 Vimeo iframe 全部渲染在 DOM。
2. 每張卡都在 `document` 綁一個 `mousemove`（21 個 listener 同時跑 GSAP）。
3. 手機完全沒有動態預覽；沒有 reduced-motion 處理。
4. Lightbox 沒鍵盤操作、沒 focus 管理、不改網址、打開後還要再點一次才播；深連結用 query + 模擬點擊。
5. 換頁是整頁重載（白閃風險、狀態遺失）。
6. 沒有專案獨立頁，SEO 與分享卡片薄弱（沒有 VideoObject 結構化資料）。

---

## 2. 品牌方向：WEITA CHEN · Filmmaking（理念：WITNESS）

- 對外品牌＝**WEITA CHEN**（與主站、攝影站一致的字標）。影像房間的創作理念＝**WITNESS：見證／在場／真實**，用在 About 文案、Footer 標語與語氣，不當網站名稱。
- 視覺語言＝「攝影機在錄」：劇院黑、寬銀幕比例、時間碼、REC 紅點、底片顆粒；克制、不炫技，讓影像說話。
- 跟姊妹站的關係：攝影站是**米白紙張＋襯線**的編輯感（首頁淺色 `#F3EFE8`、Newsreader）；影像房間是**同一組底色與暖白字的暗場版本**＋Clash Display，同棟建築、不同房間（§15.2）。
- 跟 Earcandy 的差異化：Earcandy 是音樂公司，靠大膽圓體＋紫色；我們以「畫面」為主角，UI 更安靜、更電影感。
- 語言：全站中英雙語（§16），兩種語言內容對等。

## 3. Site map 與頁面

> 全部是主站 app 內的路由（TanStack Router 檔案式路由）。

| 對外路由 | 頁面 | 內容 | 優先級 |
|---|---|---|---|
| `/filmmaking` | 語言分流 | 取代現在的「Forthcoming」佔位頁；照攝影房間 `/photography` 的做法依 `localStorage("weita-lang")` 導向（§16） | P0 |
| `/filmmaking/{lang}` | Work（首頁） | 第一張滿版＝**Showreel** → bento 作品牆 → 分類/角色篩選（M6）→ 合作客戶 → Footer | P0 |
| `/filmmaking/{lang}/work/$slug` | 專案頁 | 直接進入為完整頁；從首頁點擊時以 route masking 疊成 lightbox，網址顯示同一個 `/work/$slug` | P0 |
| `/filmmaking/{lang}/reel` | Showreel | 全螢幕直接播放主 reel | P0 |
| `/filmmaking/{lang}/about` | About | WITNESS 創作理念、簡介、角色（Director / DP / Editor / Colorist）、合作客戶、得獎/放映 | P0 |
| `/filmmaking/{lang}/contact` | Contact | Email、社群、所在地、接案狀態 | P0 |

`{lang}` ∈ `en` | `zh-tw`。**不做**：幕後筆記、器材頁。尾斜線行為沿用主站（`/filmmaking/` → `/filmmaking`）。

Nav：`WORK` `REEL` `ABOUT` `CONTACT`（中文：作品、影像集錦、關於、聯絡）＋語言切換 `中文 / EN`。房間切換：W 圖示回入口 `/`、`PHOTOGRAPHY 攝影` → `/photography/{lang}`（§15.2）。

## 4. 內容模型

### 4.1 檔案位置
> 以下路徑皆相對於 `src/features/filmmaking/`（實際根目錄依主站慣例）。

- `content/projects.json`：全部專案（陣列，依 `order` 排序）。可翻譯欄位用雙語物件。
- `content/site.json`：網站層級設定（tagline、email、社群、`showreelSlug`、clients logo、About/Contact 文案，雙語）。
- `dictionaries/en.json`、`dictionaries/zh-tw.json`：UI 字串（nav、按鈕、欄位名、無障礙標籤）。
- `lib/content.ts`：用 **zod** 驗證並匯出型別與查詢函式（`getProjects(lang)`、`getProject(slug, lang)`、`getAdjacent(slug)`、`getShowreel(lang)`）；驗證失敗時 build 直接失敗。
- `lib/i18n.ts`：`locales = ["en", "zh-tw"] as const`、`defaultLocale = "en"`、`getDictionary(lang)`、`t(localized, lang)`（缺中文時回退英文並在 dev console 警告）。
- 內容以 JSON 靜態 import，由各路由的 `loader` 取用（SSR 時即有資料）；之後若要後台，可換 Sanity 等 headless CMS，介面不變。

### 4.2 Project schema（TypeScript）
```ts
type Locale = "en" | "zh-tw";
type Localized = { en: string; "zh-tw"?: string };   // 英文必填；中文缺漏時回退英文

type AspectRatio = "16:9" | "1.85:1" | "2:1" | "2.39:1" | "4:3" | "9:16" | "1:1";
type Category = "showreel" | "commercial" | "music-video" | "documentary" | "narrative" | "brand-film" | "event" | "personal";
type Role = "director" | "dp" | "cinematographer" | "editor" | "colorist" | "producer"; // 顯示文字放字典

interface Project {
  slug: string;                 // URL 用，kebab-case，唯一，兩種語言共用
  title: Localized;
  client?: Localized;
  campaign?: Localized;
  category: Category;
  roles: Role[];
  year: number;
  order: number;                // 首頁排序（決定 bento 位置）；Showreel 固定為 0
  featured?: boolean;
  published: boolean;
  summary?: Localized;          // 一句話（卡片 / OG description）
  description?: Localized;      // 專案頁長文（簡單 Markdown）
  credits: { role: Localized; name: string }[];
  specs?: {
    camera?: string; lenses?: string; format?: string;
    aspectRatio?: AspectRatio; grade?: string; location?: Localized;
  };
  video: {
    fullPlaybackId: string;
    previewPlaybackId?: string;
    previewStart?: number;
    aspectRatio: AspectRatio;
    durationSec?: number;
    posterTime?: number;
    captions?: { lang: Locale; label: string }[]; // Mux 上已上傳的字幕軌
  };
  poster?: { src: string; alt: Localized };
  stills?: { muxTime?: number; src?: string; alt: Localized }[];
  awards?: Localized[];
  links?: { label: Localized; href: string }[];
  accentColor?: string;
}
```

### 4.3 Placeholder 資料（M1 用）
以下為 Mux 官方公開的示範 playback ID（2026-11-20 已實測 `stream.mux.com/{id}.m3u8`、`image.mux.com/{id}/thumbnail.webp`、`storyboard.vtt` 皆回 200），在韋達的素材上傳前循環使用：
- `a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M`
- `EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs`
- `601n4w1fq88NJiVpzvrQQeQfNnnjjfKMIN7dCGAEarTs`
- `VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU`

先建 **10 筆**假專案：第 1 筆 `slug: "showreel"`、`category: "showreel"`、`order: 0`；其餘涵蓋 bento 全部版型與 3 種以上比例，標題中英都填明顯假名（`Placeholder — Night Market`／`佔位 — 夜市`）。

## 5. Design tokens

### 5.1 色彩（已定案：與主站同色系 + REC 紅）
主站與攝影站的 tokens（實測 `weitachen.pro/assets/styles-*.css`）：`--color-paper #10100e`、`--color-paper-deep #1b1a17`、`--color-ink #f3efe8`、`--color-muted #b3aa9f`、`--color-line #3a362f`、`--color-menu #070706`、`--color-ball #b52`（攝影站選單球的赭紅）。影像房間沿用同一組底色與文字色，讓三個頁面像同一棟建築；用 REC 紅與更黑的劇院黑做出電影感。

| Token（CSS 變數） | 值 | 說明 |
|---|---|---|
| `--color-bg` | `#10100E` | ＝主站 `--color-paper` |
| `--color-bg-elevated` | `#1B1A17` | ＝主站 `--color-paper-deep`，卡片底色 / skeleton |
| `--color-black` | `#070706` | ＝主站 `--color-menu`，Lightbox、劇院模式 |
| `--color-fg` | `#F3EFE8` | ＝主站 `--color-ink` |
| `--color-fg-muted` | `#B3AA9F` | ＝主站 `--color-muted` |
| `--color-line` | `#3A362F` | ＝主站 `--color-line`，分隔線（不可用於文字） |
| `--color-accent` | `#E5372B` | **REC 紅**：REC 指示燈、紅點、焦點環、選取底色、大字強調 |
| `--color-accent-text` | `#E83F32` | 小字用的 REC 紅（目前頁 nav、文字連結）；肉眼與 `#E5372B` 幾乎相同，但對比過 AA |
| `--color-overlay` | `rgb(0 0 0 / .2)` | 卡片暗化 |
| `--color-overlay-strong` | `linear-gradient(to top, rgb(0 0 0 / .65), transparent 55%)` | 卡片底部文字可讀性 |
| `::selection` | bg `--color-accent`、文字 `#fff` | |
| `theme-color` meta | `#10100E` | 同主站 |

對比（已計算，對 `#10100E`）：`--color-fg` ≈ 16.6:1、`--color-fg-muted` ≈ 8.3:1、`--color-accent` `#E5372B` ≈ 4.46:1（**小字未達 AA**，只用於圖形、紅點、≥24px 大字）、`--color-accent-text` `#E83F32` ≈ 4.71:1（小字可用）。

### 5.2 字體（已定案）
| 角色 | 字體 | 載入方式 | 授權 |
|---|---|---|---|
| Display（拉丁大標、卡片標題、Nav） | **Clash Display**（Indian Type Foundry，Fontshare；200–700） | **Fontshare 官方 CSS API**：在 `/filmmaking/$lang` layout 的 `head()` 加 `links`：`preconnect` `https://api.fontshare.com`、`https://cdn.fontshare.com`（crossorigin），stylesheet `https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap`。只在影像房間載入 | **ITF Free Font License（FFL）v2.0**，見下方 |
| Body（拉丁內文） | **Outfit**（與主站、攝影站相同） | **主站 root 已全域載入**（Google Fonts，300/400/500），不需重複載入 | OFL |
| 中文（標題＋內文） | **Noto Sans TC**（大標可選 **Noto Serif TC**） | **主站 root 已全域載入**（400/500）；若需要 600/700 粗體中文大標，在影像房間 `head()` 另加一條只含所需字重的 Google Fonts link（先確認不會影響攝影房間） | OFL |
| Mono（時間碼、規格、標籤） | **JetBrains Mono** | 影像房間 `head()` 加 Google Fonts link（400/500，`display=swap`） | OFL |

**Clash Display 授權查證（2026-11-20 讀 https://www.fontshare.com/licenses/itf-ffl ，FFL v2.0，2026-08-17 版）**
- ✅ 個人與商業用途免費、無期限；明文允許用於網站，並**允許自架**（`@font-face` 自己的伺服器），Fontshare API 非必要。
- ✅ 可用於 logo/字標，產出作品權利歸作者。
- ⚠️ **不得修改字型檔**：包含**子集化（subsetting）、格式轉換**、改名或改 metadata → 只能用 Fontshare 官方提供的檔案；不要丟進 glyphhanger/fonttools 等工具，也不要讓建置流程自動子集化或轉檔（Vite 外掛如 font subsetter 不可套用在 Clash Display）。
- ⚠️ **不得散佈**：不可把字型檔放在公開可下載的地方或公開 repo，也不可直接寄給外部設計師（對方需自行從 Fontshare 下載）。→ 我們用 Fontshare CSS API，**repo 裡不放 Clash Display 字型檔**，自然符合。
- ⚠️ 不可做成讓第三方挑字型、編輯內容的服務（我們不會）。
- 只支援拉丁字母；中文一律由 Noto Sans TC 承接。

載入方式：一律使用 Fontshare 官方 CSS API（授權明文允許）。若日後要自架以提升效能，只能放 Fontshare 官方下載的原始 woff2 檔，且 repo 必須 private；目前不做。

字體堆疊：
```css
--font-display: "Clash Display", "Noto Sans TC", sans-serif;
--font-body: Outfit, "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
--font-zh-serif: "Noto Serif TC", "Songti TC", serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```
`<html lang>` 為 `zh-Hant-TW` 時，`body` 改用 `--font-body` 但中文行高/字距套 §5.3 的中文規則；Clash Display 大標中若混中文，中文字自動落到 Noto Sans TC（同字重 500–700）。

### 5.3 字級（流體，clamp）
| Token | 值 | 對應 |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 1.2rem + 5vw, 6rem)` | Showreel 卡標題、About 大標（Clash Display 600，`letter-spacing: -0.02em`，行高 .95） |
| `--text-h1` | `clamp(1.875rem, 1rem + 3.6vw, 5rem)` | |
| `--text-h2` | `clamp(1.5rem, .9rem + 2.6vw, 3.875rem)` | |
| `--text-h3` | `clamp(1.375rem, 1rem + 1.6vw, 2.875rem)` | |
| `--text-card-title` | `clamp(1.25rem, 1rem + .9vw, 1.875rem)` | Clash Display 500 |
| `--text-body` | `clamp(1rem, .95rem + .25vw, 1.125rem)`，行高 1.5 | Outfit 300/400 |
| `--text-small` | `.875rem` | |
| `--text-micro` | `.75rem`、`uppercase`、`letter-spacing: .14em` | Nav、語言切換、metadata（與主站 `.lang-switch` 的 .78rem / .14em 一致） |
| `--text-wordmark` | `.75rem`、`uppercase`、`letter-spacing: .28em` | `WEITA CHEN` 文字字標（與主站 `.door-name` 一致） |
| 卡片副標 | `uppercase`、`letter-spacing: .04em`、weight 500 | |
| 中文內文 | 行高 `1.75`、`letter-spacing: .02em` | |
| 中文大標 | `letter-spacing: .04em`、行高 1.2（不套 Clash 的負字距） | 用 `:lang(zh-Hant-TW)` 選擇器覆寫 |

### 5.4 間距、格線、圓角、斷點、easing
- 斷點：`sm 480px`、`md 768px`、`lg 992px`、`xl 1280px`、`2xl 1600px`。
- 容器：`max-width: 90rem`；`--gutter: clamp(1.2rem, 4vw, 3.2rem)`（與主站 `.menu-nav` padding 一致）。
- 格線：12 欄，`--grid-col-gap: clamp(.75rem, 1.5vw, 1.375rem)`、`--grid-row-gap: clamp(.75rem, 1.7vw, 1.5625rem)`。
- 區段間距：`--space-section-s: clamp(2rem, 4vw, 3rem)`、`-m: clamp(3rem, 7vw, 5rem)`、`-l: clamp(4rem, 10vw, 7rem)`。
- 圓角：`--radius-card: .375rem`（＝主站 `--radius-md`；手機滿版時為 0）。
- 觸控目標最小 44px（與主站一致）。
- 共用 easing：`--ease-editorial: cubic-bezier(0.22, 1, 0.36, 1)`（主站頁面進場用），GSAP 中以 `CustomEase` 或 `"expo.out"` 近似。
- z-index：`header 50`、`room-switch 55`、`cursor 60`、`lightbox 100`、`grain 110`。

### 5.5 Tailwind v4 與樣式隔離（重要）
- 主站已有自己的 `@theme` tokens（`--color-paper`、`--color-ink`、`--color-muted`、`--color-line`、`--color-ball`、`--ease-editorial`…）。**不可改寫或覆蓋它們。**
- 影像房間的 tokens 一律加 `film-` 前綴，例如 `--color-film-bg`、`--color-film-fg`、`--color-film-accent`、`--font-film-display`、`--text-film-display`，產生 `bg-film-bg`、`text-film-fg`、`font-film-display` 等 utility，不會與攝影房間撞名。
- 放在 `features/filmmaking/styles/film.css`：`@theme { … }` 區塊＋只作用在 `.film-root` 內的元件樣式。接入方式依第 0 步盤點：若需要在主站全域 CSS 加一行 `@import`（Tailwind v4 需要同一次編譯才產生 utility），屬於共用檔案的「新增一行」，需先報備。
- 本文件其他章節寫的 `--color-bg`、`--text-display` 等名稱，實作時對應 `--color-film-bg`、`--text-film-display`（加 `film-` 前綴）。
- 影像房間根元素：`<div class="film-root" lang="…" data-theme="film">`，在其上設定背景、文字色、字體；`body` 背景若需變暗，用 `body:has(.film-root)`（與主站入口頁 `body:has(.frame-root[data-home])` 同手法），不改全域 `body` 規則。

## 6. 元件清單與行為

> 檔案放 `features/filmmaking/components/`。TanStack Start 為 SSR + hydration，元件預設在伺服器與瀏覽器都會執行：存取 `window`、`matchMedia`、`IntersectionObserver`、GSAP 的程式一律放在 `useEffect` / `useGSAP` 內；播放器等重元件用 `React.lazy` 動態載入。

### 6.1 `SiteHeader`（品牌字標、房間切換、語言切換）
- **左上：`BrandMark`（正式字標）**
  - `<picture>`：`/brand/wordmark-light-640.webp`（＋320w）→ fallback `/brand/wordmark-light.png`（皆用 trimmed 版，比例 761×563），`alt="WEITA CHEN"`，明確 `width`/`height` 防 CLS，高度 `--brand-h`（桌機 36px、手機 28px）。資產說明見 §15.2。
  - 元件保留 `src` / `variant`（`"wordmark" | "icon"`）參數，日後有 SVG 可直接替換；icon 版用既有 `/brand/icon-white.png`。
  - 連到 `/filmmaking/{lang}`；hover 時字標右側出現 6px REC 紅點閃一次。
- **房間切換 `RoomSwitch`**（與主站同構，§15.2）：字標旁一個 44px 的 W 圖示（`/brand/icon-white.png`，同攝影房間 `.home-mark`）連回入口 `/`，以及小字連結 `PHOTOGRAPHY`／`攝影` → `/photography/{lang}`（保留目前語言）。這兩個是**別的房間**：用一般 `<a>` 整頁導航（或 TanStack `Link` 但不跑影像房間轉場、並確保離開時清掉游標/捲動鎖/GSAP）。手機上收進選單。
- **右側 Nav**：`WORK` `REEL` `ABOUT` `CONTACT`（`--text-micro`、Clash Display 500 或 Outfit 500）；目前頁 `--color-accent-text` + 前方 `--color-accent` 紅點；hover `--color-fg-muted`，`.25s`。
- **語言切換 `LangSwitch`**：`中文 / EN`，樣式比照攝影站 `.lang-switch`（`.75rem`、uppercase、`.14em`、目前語言 `--color-fg`、其他 `--color-fg-muted`、半透明底 + `backdrop-filter: blur(8px)`、每個連結最小高度 44px）。切換時導向**同一頁的另一語言**（例如 `/filmmaking/en/work/x` ↔ `/filmmaking/zh-tw/work/x`），並寫入 `localStorage("weita-lang")`（與攝影房間共用，§16）。連結加 `hrefLang`、目前語言 `aria-current="true"`。
- **行為**：預設不固定；往下捲 > 120px 後若使用者往上捲，header 以 `yPercent -100 → 0` 滑回（`.45s power3.out`），背景 `rgb(16 16 14 / .72)` + `backdrop-filter: blur(12px)`；往下捲再收起。Lightbox 開啟時隱藏。
- **手機（<768px）**：漢堡 → 全螢幕選單（`100dvh`、`--color-black`），連結 `--text-h2` 置中逐行 SplitText 進場（`yPercent 100 → 0`、`stagger .06`、`.6s power3.out`），底部放語言切換、房間切換（Hub / Photography）、email + 社群；開啟時鎖捲動，ESC/點連結關閉。

### 6.2 `WorkGrid`（首頁 bento）
- 由首頁路由的 `loader` 取得 `projects`（已排序、`featured && published`）後傳入。
- 12 欄 CSS grid，**以 `index` 決定版型**（不要用 `nth-child` CSS，改由 JS 算出 `layout` 屬性，篩選後仍正確）：
  ```ts
  // index 從 0 起算；對應 Earcandy 規則
  function getCardLayout(i: number): { colSpan: 4|6|8|12; aspect?: string } {
    if (i === 0) return { colSpan: 12, aspect: "31 / 15" };
    if (i === 1 || i === 4) return { colSpan: 4 };            // 被同列撐高
    if (i === 2 || i === 3) return { colSpan: 8, aspect: "41 / 24" };
    if (i === 5 || i === 6) return { colSpan: 6, aspect: "61 / 35" };
    return { colSpan: 4, aspect: "16 / 10" };
  }
  ```
- <768px：單欄，第 1 張 `aspect-ratio: 4 / 5`（Earcandy 39/43 的近似，更適合直式手機），其餘 `16 / 9`；卡片滿版（左右 padding 0、圓角 0），間距 `.75rem`。
- 第一張卡固定＝**Showreel**（`site.json` 的 `showreelSlug`，不受篩選影響、永遠在最上方），標題用 `--text-display`，hover 預覽、點擊開 lightbox（另有 `/reel` 全螢幕頁可分享）。
- 分類篩選（M6）：`All / Commercial / Music Video / Documentary / Narrative…` + 角色篩選（Director / DP / Editor），以 GSAP Flip 重新排列（`.6s power3.inOut`）。

### 6.3 `WorkCard`
- 結構：TanStack `<Link to="/filmmaking/$lang" search={{ work: slug }} mask={{ to: "/filmmaking/$lang/work/$slug", params, unmaskOnReload: true }}>`（§6.6；href 仍是真實的 `/filmmaking/{lang}/work/{slug}`，可右鍵開新分頁） class="group relative block overflow-hidden" data-cursor="play">` 內含：
  1. `MuxImage` 封面：`<img src srcset sizes width height loading decoding fetchpriority>`，`srcset` 由 `https://image.mux.com/{fullPlaybackId}/thumbnail.webp?time={posterTime}&width={w}` 產生（w = 480/800/1200/1600/2400），`sizes` 依 colSpan 計算；第一張 `loading="eager" fetchpriority="high"`，其餘 `loading="lazy"`；有 `poster.src` 時用它
  2. `PreviewVideo`（絕對定位滿版，預設 `opacity: 0`）
  3. 遮罩：`--color-overlay` + 底部漸層 `--color-overlay-strong`
  4. 文字區（左下 `inset: auto 1.75rem 1.25rem`，手機 `1rem`）：標題（display 字體）+ 副標（client · year，uppercase）+ 角色（mono，hover 時出現）
  5. 右上：時長 `02:31`（mono、`--text-micro`、hover 才出現）
- Hover（桌機，`(hover: hover) and (pointer: fine)`）時間軸，enter `play()`、leave `reverse()`：
  - 封面 `scale 1 → 1.03`（`.8s power3.out`），影片 `opacity 0 → 1`（`.35s power1.out`，影片 `playing` 事件後才淡入，避免黑閃）
  - 標題 `y: 2rem → 0`（`.3s power1.out`）
  - 副標 `yPercent: 100, opacity: 0, skewX: 20 → 0`（`.3s power1.out`，同時）
  - 角色/時長 `opacity 0 → 1`、`y: .5rem → 0`（`.3s`，延遲 `.05s`）
- 點擊：以 route masking 導航（§6.6），lightbox 開啟，網址顯示 `/filmmaking/{lang}/work/{slug}`。

### 6.4 `PreviewVideo`
- 使用 Video.js v10 的 **`MuxBackgroundVideo`**（`@videojs/react/media/mux-background-video`，約 27 kB、固定 muted / inline / loop、無控制列；**不需要付費的 MP4 static renditions**）。
- `src = https://stream.mux.com/{previewPlaybackId ?? fullPlaybackId}.m3u8?max_resolution=720p`；若用 full 版本加 `#t={previewStart}` 或載入後設 `currentTime`。
- **延遲載入**：預設不給 `src`、`autoPlay={false}`。條件成立才給 `src`：
  - 桌機：第一次 `mouseenter` 時（同 Earcandy），之後 hover 直接 `play()`；離開 `pause()`，**並保留目前畫格**。
  - 觸控裝置（超越 Earcandy）：用 IntersectionObserver，**畫面中央可見比例最高的那一張**自動播放（threshold `[0, .5, .75, 1]`），其他暫停；同時最多 1 支在播。
  - 預先暖身：卡片進入 viewport 300px 內時 `<link rel="preconnect" href="https://stream.mux.com">`（全站一次）。
- `prefers-reduced-motion: reduce` 或 `navigator.connection.saveData`：永不載入，只顯示封面。
- 播放錯誤：`onError` → 保持封面，不顯示錯誤 UI。
- 備案：若 SPF 背景引擎與某支 Mux 串流不相容，改用 `MuxVideo`（無 skin，`muted loop playsInline`）。

### 6.5 `PlayCursor`（自訂游標）
- **全站只綁一個** `pointermove`（Earcandy 每張卡各綁一個），用 `gsap.quickTo(el, "x"/"y", { duration: .5, ease: "power3.out" })`。
- 進入 `[data-cursor="play"]`：圓形（直徑 `4.5rem`）從 `scale .4, opacity 0, blur(10px)` → `scale 1, opacity 1, blur(0)`（`.5s power3.out`）；圓內顯示 ▶ 與小字 `PLAY`；**超越**：圓周外顯示該作品時長或即時時間碼 `00:00:12:08`（mono 10px）。
- 離開：反向。系統游標在卡片上 `cursor: none`；僅 `(pointer: fine)` 啟用；reduced-motion 時不啟用（保留原生游標）。
- 在 lightbox 內：游標切換成左右箭頭（畫面左 1/3 = 上一部、右 1/3 = 下一部）—— M6 選配。

### 6.6 `ProjectViewer`（Lightbox）
- 路由（TanStack Router **route masking**）：首頁路由 `/filmmaking/$lang/` 以 `validateSearch`（zod）接受 `work?: string`；有 `work` 時在作品牆上方渲染 `ProjectViewer`。卡片 `Link` 導到 `{ to: "/filmmaking/$lang", search: { work: slug } }` 並 `mask` 成 `/filmmaking/$lang/work/$slug`，`unmaskOnReload: true`。結果：網址列顯示專案網址；重新整理或分享時直接開完整專案頁（§6.8）。
- 只用元件層級的 `mask` 參數，**不改全域 router 設定**（`routeMasks` 需改共用檔，避免）。
- 外觀：`position: fixed; inset: 0; background: #000; z-index: 100`。桌機版面：影片區佔 10/12 欄（依專案 `aspectRatio` letterbox、置中），右側 2/12 欄資訊；<992px 改上下排列（影片 100vw、資訊在下）。
- 開啟動畫（超越 Earcandy 的純淡入）：用 **GSAP Flip** 從被點的卡片封面放大到影片區（`.7s power3.inOut`），背景 `opacity 0 → 1`（`.35s`）；資訊欄文字 `y: 1rem, opacity 0` 依序進場（`stagger .05`，延遲 `.35s`）。關閉時反向收回卡片位置（若卡片不在畫面中則改為 `.35s` 淡出）。M3 先做 `.35s` 淡入淡出，M6 再升級 Flip。
- 播放：Video.js v10 `VideoPlayer` + `VideoSkin`（或自訂極簡 skin）+ `MuxVideo source={{ playbackId }}` + `MuxData`；**開啟後自動播放（有聲）**，若被瀏覽器擋就靜音播放並顯示「點擊開啟聲音」按鈕。播放器以 `React.lazy(() => import("./FullPlayer"))` + `Suspense` 延遲載入、只在瀏覽器渲染，首頁 JS 不含播放器。
- 切換：上一部/下一部按鈕（資訊欄底部，`1.875rem` 箭頭）、鍵盤 `←/→`、手機左右滑（Embla Carousel 或自寫 pointer 手勢）；切換動畫 `xPercent ±100`、`.4s power3.inOut`（對應 Earcandy Swiper 400ms）。**只渲染目前 ±1 部**，非全部。切換時舊影片 pause 並卸載，網址用 `navigate({ to: "/filmmaking/$lang", search: { work: next }, mask: { to: "/filmmaking/$lang/work/$slug", params }, replace: true, resetScroll: false })` 同步。首尾不循環，箭頭 `opacity .4` 並 `disabled`。
- 資訊欄：標題（display、1.25rem）、客戶、年份、角色、credits（欄名粗體 `--text-micro`、內容 `.8125rem`）、specs（mono）、`View project →` 連到完整頁。
- 無障礙：`role="dialog" aria-modal="true" aria-labelledby`；開啟時 focus 到關閉鈕、focus trap、`ESC` 關閉（`router.history.back()`；若是直接進入則 `navigate` 回首頁並移除 `work`）、關閉後 focus 回到原卡片；開啟時 `body` 鎖捲動（保留捲動位置）。
- 關閉鈕：右上 `top: 1.5rem; right: var(--gutter)`，`1.5rem` 圖示，hover 旋轉 90°（`.35s power3.out`）。

### 6.7 `FullPlayer`
- 包裝 Video.js v10 的播放器設定，供 lightbox、專案頁、`/reel` 共用。
- Props：`playbackId`、`title`、`aspectRatio`、`autoPlay`、`startTime?`、`posterTime?`。
- Poster：`https://image.mux.com/{id}/thumbnail.webp?time={posterTime}&width=1920`；縮圖預覽（timeline hover）用 Mux storyboard（Video.js 會自動處理）。
- Skin 客製：主色 `--color-accent`、控制列字體 mono、隱藏畫質選單以外的多餘按鈕；保留全螢幕、PiP、字幕。
- Mux Data：`<MuxData />` 加上 `metadata-video-title`、`metadata-video-id=slug`（播放分析在 Mux 後台看）。

### 6.8 `/filmmaking/$lang/work/$slug` 專案頁
- Hero：`FullPlayer`（不自動播放，大封面 + 中央播放鈕）；標題 `--text-h1` SplitText 逐字進場。
- 資訊區（12 欄）：左 4 欄 metadata（client / year / roles / specs），右 8 欄描述 + credits。
- 劇照區 `Stills`：用 Mux thumbnail 在指定秒數擷取畫格（`?time=t&width=1600`），依專案比例排成 1–2 欄，ScrollTrigger `top 85%` 進場（`opacity 0, y 3rem → 0`、`.8s power3.out`、`stagger .08`）。
- 底部「Next Project」：下一部的 PreviewVideo 滿版 + 大標題，點擊整頁轉場。
- 路由 `loader`：找不到 slug → `throw notFound()`。`head()`：雙語 title、description、OG image（Mux thumbnail `width=1200&height=630&fit_mode=smartcrop`）、`og:url`、canonical、hreflang；`scripts` 輸出 `VideoObject` JSON-LD。

### 6.9 其他
- `SiteFooter`：大標語（WITNESS 理念：`Be there. Bear witness.`／「在場，見證。」，雙語；最終文案待韋達確認）；下方「WEITA CHEN — Photography · Filmmaking」房間連結與回入口。標語 SplitText 逐字 `yPercent 100`、`stagger .03`、ScrollTrigger `top 80%`；email（大字、hover 底線由左長出 `.4s`）、社群、© 年份。
- `ClientsMarquee`：合作客戶 logo；ScrollTrigger `top 70%`、`opacity 0 + blur(10px)` `stagger .1` 進場；hover 某個 → 其他 `opacity .2`（沿用 Earcandy）。
- `GrainOverlay`（M6）：全站極淡底片顆粒（`opacity .05–.07`，SVG `feTurbulence` 或小張 png 以 `steps(8)` 動畫平移），reduced-motion 時靜止。
- `FilmLink` / `PageTransition`：§7.3。
- `SoundToggle`（選配）：首頁 showreel 卡可開聲音。

---

## 7. 動態規格（`lib/motion.ts`）

### 7.1 常數
```ts
export const EASE = {
  out: "power3.out",      // 一般進場、游標跟隨
  inOut: "power3.inOut",  // 轉場、Flip、slide
  soft: "power1.out",     // 小幅位移（卡片文字）
  expo: "expo.out",       // 大標文字揭露
} as const;

export const DUR = {
  micro: 0.25,   // 色彩/hover 小變化
  fast: 0.3,     // 卡片文字（Earcandy 0.3）
  base: 0.5,     // 游標、預設（Earcandy GSAP 預設 0.5）
  slide: 0.4,    // lightbox 切換（Earcandy Swiper 400ms）
  fade: 0.35,    // lightbox 背景（Earcandy 0.35）
  flip: 0.7,     // 卡片 → lightbox
  reveal: 0.8,   // 捲動揭露
} as const;
```

### 7.2 動畫表
| 場景 | 目標 | from → to | 時長 / ease / stagger | 觸發 |
|---|---|---|---|---|
| 首頁載入 | `WorkCard` | `y 5rem, autoAlpha 0, rotateZ .5` → 原位 | `.5s` / `power1.out` / `.1`（**超越**：只對首屏內卡片做 stagger，其餘用 ScrollTrigger `top 90%` 進場） | mount |
| 首頁 intro 字 | 品牌一行字 | SplitText lines `yPercent 100` → 0（mask） | `.9s` / `expo.out` / `.08` | mount，早於卡片 `.2s` |
| 卡片 hover | 見 §6.3 | | `.3s power1.out`；影片淡入 `.35s` | pointerenter |
| 游標跟隨 | `PlayCursor` | quickTo x/y | `.5s power3.out` | pointermove |
| 游標出現 | `PlayCursor` | `scale .4, opacity 0, blur 10px` → 1/1/0 | `.5s power3.out` | 進入卡片 |
| Lightbox 開 | 背景 / Flip | opacity 0→1；封面 Flip | `.35s` / `.7s power3.inOut` | 點卡 |
| Lightbox 資訊 | 文字項目 | `y 1rem, opacity 0` → 原位 | `.5s power3.out` / `.05`，delay `.35s` | 開啟後 |
| Lightbox 切換 | slide | `xPercent ±100` | `.4s power3.inOut` | ←/→ / 箭頭 / 滑動 |
| 頁面離場 | `main > section` | → `y 16px, opacity 0` | `.5s power3.inOut` / `{ amount: .3 }`（Earcandy .5，我們收短） | 站內連結點擊 |
| 頁面進場 | `main > section` | `y 16px, opacity 0` → 原位 | `.5s power3.out` / `{ amount: .3 }` | 新頁 mount |
| 標題逐字 | h1 chars | `yPercent 100` → 0（line mask） | `.6s expo.out` / `.03`（Earcandy .05；中文字多時改 `{ amount: .5 }`） | mount / ScrollTrigger `top 80%` |
| 段落 | p | `opacity 0, x -1rem, blur 5px` → 原位 | `.6s power3.out` | 同上 `<+0.3` |
| Logo 牆 | logos | `opacity 0, blur 10px` → 原位 | `.5s` / `.1` | ScrollTrigger `top 70%` |
| Header 回收 | header | `yPercent -100 ↔ 0` | `.45s power3.out` | 捲動方向 |
| 篩選重排 | cards | GSAP Flip | `.6s power3.inOut`，新進 `opacity 0, scale .96` | 點篩選 |

### 7.3 頁面轉場實作（TanStack Router）
- `FilmLink`：包 TanStack `Link`；只用於**影像房間內部**連結。點擊（排除 modifier 鍵、`target=_blank`、`data-no-transition`）→ `preventDefault` → 跑離場 timeline → `navigate({ to, params })`。
- 進場：`/filmmaking/$lang` layout 以 `useRouterState({ select: s => s.location.pathname })` 為 key，pathname 改變時在 `useGSAP` 內跑進場 timeline 並 `scrollTo(0,0)`（lightbox 的 masked 導航除外）。
- 主站攝影房間用 CSS `page-enter`（`.42s`、`translateY(14px)`、`cubic-bezier(0.22,1,0.36,1)`）；影像房間數值與它相近（§7.2），兩房間切換時感受一致。
- 開關 lightbox（只改 `search.work`）不跑頁面轉場。
- 連到入口 `/` 或 `/photography/**`：不攔截、不跑影像轉場；layout unmount 時 `gsap.context().revert()`、移除游標與捲動鎖。
- 切換語言：不跑離場動畫，只做 `.2s` 淡出淡入。

### 7.4 GSAP 使用規範
- 安裝 `gsap`、`@gsap/react`（用主站既有的套件管理器）；`features/filmmaking/lib/gsap.ts` 統一 `gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)`。
- 元件內一律用 `useGSAP(() => {...}, { scope: ref })` 自動清理；SplitText 用 `autoSplit: true` + `onSplit()`，並加 `mask: "lines"`。
- 首屏元素在 CSS 先 `visibility: hidden`（`[data-animate]`），由 GSAP `autoAlpha` 顯示，避免 FOUC；`<noscript>` 下強制顯示。

---

## 8. 無障礙與 reduced motion

- `prefers-reduced-motion: reduce`：
  - 預覽影片不載入、不自動播放；只顯示封面。
  - 關閉自訂游標、Flip、位移/模糊/形變；所有轉場改成 `opacity` 淡入淡出 `.15s`。
  - 顆粒靜止；ScrollTrigger 揭露改為直接顯示。
  - 實作：`lib/motion.ts` 匯出 `useReducedMotion()`，GSAP 用 `gsap.matchMedia()` 分兩套。
- 鍵盤：所有卡片是真正的 `<a>`；focus 樣式 `outline: 2px solid var(--color-accent); outline-offset: 3px`；skip link「跳到作品」。
- 語意：每頁一個 `h1`（首頁 `h1` 可視覺隱藏：en：「WEITA CHEN — Filmmaking」、zh-tw：「WEITA CHEN 陳韋達 — 動態影像作品集」（中文姓名寫法待確認））；卡片標題 `h2`/`h3`。
- 語言標記：`.film-root` 帶 `lang`（`en`／`zh-Hant-TW`），`<html lang>` 處理見 §16.3；裝飾性預覽影片外層 `aria-hidden="true"`。
- 字幕：若影片有對白，於 Mux 上傳字幕檔或開 Mux 自動字幕，播放器預設顯示。
- 對比度全部 ≥ 4.5:1（小字）。

---

## 9. 效能目標

| 指標 | 目標（行動裝置，Lighthouse / Vercel Speed Insights） |
|---|---|
| Lighthouse Performance | ≥ 90（桌機 ≥ 95） |
| Accessibility / Best Practices / SEO | ≥ 95 / ≥ 95 / 100 |
| LCP | < 2.0s（首張封面 `priority` + `fetchPriority="high"`） |
| CLS | < 0.05（所有卡片固定 aspect-ratio） |
| INP | < 200ms |
| 影像首頁新增 JS | < 120 kB gzip（不含主站既有共用 chunk；播放器、Flip、SplitText 以動態 import 延後） |
| 同時解碼的影片 | ≤ 1（桌機 hover 那支 / 手機中央那支） |

手段：SSR + 路由 code-split（影像房間的 JS 不進攝影房間與入口頁）；`MuxImage` 用 Mux 縮圖 `width` 參數產生 `srcset` 並給 `sizes`；首張封面 `fetchpriority="high"` 並在 `head()` 加 `<link rel="preload" as="image" imagesrcset>`；預覽 `max_resolution=720p`；`preconnect` 到 `image.mux.com`、`stream.mux.com`、`api.fontshare.com`；播放器 lazy；若主站已裝 Vercel Speed Insights 就沿用。

---

## 10. Mux 整合

### 10.1 資產規則
- 上傳設定：`video_quality: "basic"`、`max_resolution_tier: "1080p"`、`playback_policy: ["public"]`（作品集公開觀看；未來要保護的案子再改 `signed`）。
- 每個專案兩個資產（建議）：
  1. **Full**：完整成片。
  2. **Preview**：6–12 秒、無聲、精挑的最美段落。可用 Mux「從既有資產剪片段」功能建立（`input: [{ url: "mux://assets/{ASSET_ID}", start_time, end_time }]`），不用另外輸出檔案。若沒做 preview，元件會退回用 Full + `previewStart`。
- `passthrough` 欄位填 `slug`，方便對應。
- 播放與縮圖都是公開 URL，**前端執行時不需要任何 Mux 金鑰**：
  - 串流：`https://stream.mux.com/{PLAYBACK_ID}.m3u8`
  - 縮圖：`https://image.mux.com/{PLAYBACK_ID}/thumbnail.webp?time=1&width=1200`
  - 動態縮圖（OG/分享選配）：`https://image.mux.com/{PLAYBACK_ID}/animated.webp?start=2&end=5&width=640`
  - Storyboard：`https://image.mux.com/{PLAYBACK_ID}/storyboard.vtt`

### 10.2 環境變數（Vite）
```
# 選配：Mux Data 環境 key（Video.js 的 <MuxData /> 用；不填則依 playback ID 推斷）
VITE_MUX_DATA_ENV_KEY=
# 只給本機/後台腳本用；絕不可加 VITE_ 前綴（否則會打包進前端）
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
```
- 目前播放與縮圖皆為公開 URL，**網站執行時不需要任何 Mux 金鑰**；M1–M7 不需設定任何環境變數。

### 10.3 工具腳本（選配，由 PM 在本機執行，不放進主站）
- `scripts/mux-list.ts`：用 `@mux/mux-node` 列出所有資產（id、playback id、時長、比例、passthrough），輸出成可貼進 `projects.json` 的片段。
- `scripts/mux-clip.ts <assetId> <start> <end>`：建立 preview 片段資產。
- 讀 `projects.json` 檢查每個 playback ID 是否存在且 `status: ready`（CI 可跑）。

### 10.4 播放器套件（2026-11 現況，已查證）
- **Mux Player（`@mux/mux-player-react`）已進入維護模式**，Mux 官方建議新專案改用 **Video.js v10**（由 Mux 維護，10.5.0）。因此本案：
  - 完整播放：`@videojs/react` + `@videojs/mux-video` + `@videojs/mux-data`
  - 預覽：`@videojs/react/media/mux-background-video`（27 kB，SPF 引擎）
- 不使用 MP4 static renditions（付費附加），全部走 HLS。

---

## 11. 超越 Earcandy 的點子（攝影師/導演作品集取向）

| # | 點子 | 說明 | 里程碑 |
|---|---|---|---|
| 1 | 真比例 letterbox | 每部影片依原生比例（2.39:1、1.85:1、9:16…）在 lightbox 留黑邊，卡片角落標示比例；是攝影師的專業訊號 | M3 |
| 2 | 卡片 → 全螢幕 Flip | 點擊後封面無縫放大成播放器，關閉收回原位 | M6 |
| 3 | 時間碼游標 | 自訂游標顯示 `00:00:12:08` 即時時間碼與時長、REC 紅點 | M6 |
| 4 | Storyboard 拖曳預覽 | 桌機在卡片上左右移動滑鼠＝在影片時間軸上 scrub（用 Mux storyboard 雪碧圖，不必載影片），點擊才播 | M6（選配） |
| 5 | 手機也有動態 | 捲動時中央那張卡自動播預覽（Earcandy 手機完全靜態） | M2 |
| 6 | 拍攝規格欄 | 相機、鏡頭、格式、調色、地點（mono 字體，像 slate 場記板） | M4 |
| 7 | 劇照/畫格牆 | 直接用 Mux thumbnail 依秒數抓畫格，免另外輸出劇照 | M4 |
| 8 | 依角色篩選 | Director / DP / Editor / Colorist 一鍵篩選，讓不同客戶看到相關作品 | M6 |
| 9 | 可分享深連結 | `/filmmaking/{lang}/work/[slug]` 真網址（雙語）＋完整專案頁＋OG 圖＋VideoObject 結構化資料 | M3/M7 |
| 10 | 開啟即播放 | lightbox 開啟直接有聲播放（被擋就靜音播並提示），少一次點擊 | M3 |
| 11 | 底片顆粒＋暖白 | 極淡顆粒與 `#F2EFE9` 暖白，畫面更有電影質地 | M6 |
| 12 | 鍵盤劇院模式 | `←/→` 換片、`Space` 播放暫停、`F` 全螢幕、`M` 靜音、`ESC` 關閉 | M3 |
| 13 | 頁面不重載 | TanStack Router 客戶端導航＋GSAP 轉場，無白閃 | M5 |

---

## 12. 分階段建置計畫（每個里程碑＝一次 Grok Build 對話任務）

### 12.0 每個里程碑都必做的「不破壞主站」回歸檢查
開工前先記錄基準（截圖＋HTTP 狀態），完工後再比一次：
- [ ] `/` 入口頁：200，兩扇門文字、樣式、hover 與改動前一致
- [ ] `/photography`（語言導向）、`/photography/en`、`/photography/zh-tw`、以及 `/photography/en/work`、`/about`、`/contact`：200，畫面與改動前一致（字體、顏色、選單球、語言切換）
- [ ] `git diff --stat` 中，`/photography` 相關檔案與入口頁檔案**沒有任何變更**；共用檔案（root route、全域 CSS、`package.json`、Vite/router 設定）的變更都已事先取得同意且只有新增
- [ ] 攝影房間與入口頁的 JS chunk 沒有變大（GSAP、Video.js、影像房間元件只出現在 `/filmmaking` 的 chunk）
- [ ] 主站的 `<head>`（Google Fonts link、favicon、manifest、OG）在非影像頁面不變
- [ ] build、typecheck、lint 零錯誤，瀏覽器 console 無新錯誤

### M1 — 盤點現有架構＋影像房間骨架、tokens、字體、版面、首頁作品牆（靜態）
範圍：**第 0 步先盤點**主站結構（路由檔位置、攝影房間的語言路由做法、root route、全域 CSS、Tailwind 設定、字體載入、public 資產），回報後再動工。然後：以影像房間路由取代 `/filmmaking` 佔位頁；`/filmmaking` 語言分流；`/filmmaking/$lang` layout（驗證 lang、`film-root` 包裝、header/footer 靜態版、BrandMark 正式 logo、RoomSwitch、LangSwitch）；tokens（`film-` 前綴）；Clash Display / JetBrains Mono 在影像路由 `head()` 載入；content + zod（雙語）；`WorkGrid` + `WorkCard`（`MuxImage` 封面＋文字）；10 筆 placeholder（第 1 筆 Showreel）；about/contact/reel/work 佔位頁。
驗收：
- [ ] `/filmmaking` 依 `localStorage("weita-lang")` 導向 `/filmmaking/en` 或 `/filmmaking/zh-tw`；無偏好時依瀏覽器語言，預設 en
- [ ] 兩語言首頁皆顯示 10 張卡，bento 節奏 [12 Showreel] → [4|8] → [8|4] → [6|6] → [4|4|4]（1440px）；390px 單欄滿版
- [ ] LangSwitch 停在同一頁的另一語言，並寫入 `weita-lang`；之後去 `/photography` 也會是同一語言
- [ ] 封面來自 `image.mux.com`（有 `srcset`、`width/height`，第 1 張 `fetchpriority="high"`），無 CLS
- [ ] 不存在的 lang（如 `/filmmaking/fr`）或 slug 顯示影像房間的 404
- [ ] Clash Display 只在 `/filmmaking/**` 頁面載入
- [ ] §12.0 全部通過

### M2 — 預覽影片與卡片互動
範圍：安裝 `gsap`、`@gsap/react`、`@videojs/react`；`PreviewVideo`（MuxBackgroundVideo、hover 延遲載入、觸控中央自動播）、`PlayCursor`、卡片 hover timeline、首頁載入 stagger、`motion.ts`、`gsap.ts`、reduced-motion。
驗收：
- [ ] 未 hover 前 Network 沒有 `stream.mux.com` 請求；hover 後 < 1s 開播、`playing` 後才淡入；離開暫停並停在當下畫格
- [ ] 同時只有 1 支在播；觸控模擬時中央卡片自動播
- [ ] 游標 `.5s power3.out` 延遲跟隨，全站只綁一個 `pointermove`，離開 `/filmmaking` 時移除
- [ ] reduced-motion：無影片請求、無游標、無位移動畫
- [ ] 影像首頁 Lighthouse 行動版 Performance ≥ 90
- [ ] §12.0 全部通過（特別是攝影房間 chunk 不含 gsap / videojs）

### M3 — Lightbox 播放器（ProjectViewer）
範圍：route masking 開啟 lightbox（§6.6）、`FullPlayer`（Video.js v10 + MuxVideo + MuxData，lazy import）、上一部/下一部、鍵盤、手勢、URL 同步、focus 管理、letterbox、字幕依語言預設。
驗收：
- [ ] 首頁點卡 → 網址顯示 `/filmmaking/{lang}/work/{slug}`，lightbox 開啟並自動播放（被擋則靜音＋提示）
- [ ] `←/→`、箭頭、滑動換片並同步網址；`ESC`/關閉/上一頁可關閉，focus 回原卡片、捲動位置不變
- [ ] 重新整理或分享該網址 → 開啟完整專案頁（M4 前可為簡版）
- [ ] 2.39:1 片正確留黑邊；影像首頁初次載入不含 Video.js 播放器 chunk
- [ ] §12.0 全部通過

### M4 — 專案完整頁＋Reel 頁＋每頁 head
範圍：`/work/$slug`（hero 播放器、metadata/specs/credits、劇照、Next Project）、`/reel`；每個路由的 `head()`（雙語 title/description、OG、hreflang、canonical、VideoObject JSON-LD）。
驗收：
- [ ] 所有 slug × 兩語言可直接開啟；不存在的 slug → 404
- [ ] 檢視原始碼（SSR HTML）可見正確的 title、description、`og:image`（Mux 縮圖）、`hreflang`、canonical `https://weitachen.pro/filmmaking/{lang}/...`
- [ ] Reel 頁開啟即播（被擋則靜音＋提示）
- [ ] §12.0 全部通過

### M5 — 導覽行為、頁面轉場、About / Contact、Footer
範圍：`FilmLink`（離場動畫後導航）＋ layout 進場動畫、header 捲動回收、手機全螢幕選單（含語言與房間切換）、About、Contact、Footer 標語 SplitText、Clients logo 牆。
驗收：
- [ ] 影像房間內換頁無整頁重載，總時長 ≤ .8s；連到 `/`、`/photography/**` 不跑影像房間轉場、也不殘留游標/滾動鎖
- [ ] 手機選單鍵盤/ESC 可關、鎖捲動，離開時解除
- [ ] 中文 SplitText 不破字、不亂斷行
- [ ] §12.0 全部通過

### M6 — 質感升級（超越 Earcandy）
範圍：Flip 卡片→lightbox、時間碼游標、分類/角色篩選（`?role=dp` 以 `validateSearch` 驗證）、顆粒、（選配）storyboard scrub。
驗收：60fps、無 > 50ms 長任務；篩選網址可分享；與 Earcandy 並排錄影由 PM 驗收；§12.0 全部通過。

### M7 — 效能、無障礙、SEO 總檢
範圍：Lighthouse（兩語言所有頁）、axe、reduced-motion 全站、影像房間頁面加入主站 sitemap（若主站有 sitemap 機制，**先提案再改**）、`<html lang>` 修正提案（§16.3，需同意）。
驗收：§9 指標達標；axe 0 serious/critical；Rich Results 可辨識 VideoObject；§12.0 全部通過。

### M8 — 真實素材與上線
範圍：換上韋達的真實 Mux playback ID、雙語文案、中文姓名定稿、Clash Display 改自架官方 woff2（可選，見 §5.2）、正式發布。
驗收：`/filmmaking` 三個入口皆 200；真機測試 iPhone Safari、Android Chrome、Mac Safari/Chrome、Windows Chrome；§12.0 全部通過。

## 13. 目錄結構（建議；以第 0 步盤點到的主站慣例為準）

```
src/routes/filmmaking/                 # 取代現有 /filmmaking 佔位路由（實際檔名依主站慣例，可能是 filmmaking.tsx 或 filmmaking/index.tsx）
  index.tsx                            # /filmmaking：語言分流（照 /photography 做法）
  $lang/route.tsx                      # layout：驗證 lang、head() 載入字體、.film-root、header/footer、404 元件
  $lang/index.tsx                      # 首頁（Showreel + 作品牆；validateSearch: { work?, role? }）
  $lang/work/$slug.tsx                 # 完整專案頁
  $lang/reel.tsx
  $lang/about.tsx
  $lang/contact.tsx
src/features/filmmaking/               # 影像房間全部程式（photography 不會 import 這裡任何東西）
  components/  BrandMark.tsx RoomSwitch.tsx LangSwitch.tsx SiteHeader.tsx MobileMenu.tsx SiteFooter.tsx
               WorkGrid.tsx WorkCard.tsx MuxImage.tsx PreviewVideo.tsx PlayCursor.tsx
               ProjectViewer.tsx FullPlayer.tsx Stills.tsx ClientsMarquee.tsx FilmLink.tsx GrainOverlay.tsx NotFound.tsx
  content/     projects.json site.json
  dictionaries/ en.json zh-tw.json
  lib/         content.ts i18n.ts mux.ts gsap.ts motion.ts layout.ts seo.ts
  styles/      film.css                # film- 前綴 tokens 與 .film-root 範圍樣式
public/brand/  wordmark-light.png、wordmark-light-320.webp、wordmark-light-640.webp、w-dark.png（新增，皆 trimmed 版，PM 提供）；icon-white.png、logo-design-01.png、favicon.svg（既有，不動）
docs/          FILMMAKING_SPEC.md      # 本文件副本
```
- 若主站的路由不是 `src/routes/`，照主站實際位置放；**`routeTree.gen.ts` 是自動產生的，不要手改**。
- 若 `$lang` 參數在攝影房間是用別的方式（例如固定的 `en/`、`zh-tw/` 資料夾），影像房間照抄同一種。

## 14. 已定案（2026-11-20）與剩餘問題

已定案：
1. 頁面：Work / About / Contact / Reel。
2. 全站 zh-TW / en，路由與攝影房間同構。
3. Display：Clash Display（Fontshare CSS）；內文 Outfit；中文 Noto Sans TC。
4. 強調色 REC 紅 `#E5372B`（小字用 `#E83F32`）。
5. 首頁第一張滿版：Showreel。
6. Logo：正式檔已到位（§15.2）。
7. 架構：做在 weitachen.pro 主站 app（TanStack Start）裡，取代 `/filmmaking` 佔位頁。

剩餘問題：
- **中文姓名**：目前暫寫「陳韋達」，請韋達確認正確寫法（字標本身用英文 WEITA CHEN 不受影響）。
- About / Contact 的雙語文案、合作客戶名單、聯絡 email 與社群連結。
- 是否同意 M7 修正主站 `<html lang>`（會讓攝影房間中文頁也一起變正確，屬共用檔案變更）。

## 15. 主站整合與部署（weitachen.pro/filmmaking）

### 15.1 現況調查（2026-11-20 22:40 Asia/Taipei 以 curl 實測）
| 項目 | 結果 |
|---|---|
| 託管 | **Vercel**（所有路徑回應 `server: Vercel`、`x-vercel-id: iad1::…`；apex A 記錄 `216.198.79.1`、`www` CNAME 到 `*.vercel-dns-017.com`，`www` 308 轉到 apex） |
| DNS | **Porkbun**（NS：`curitiba/fortaleza/salvador/maceio.ns.porkbun.com`） |
| 框架 | **TanStack Start（TanStack Router SSR）+ Vite + Tailwind CSS v4**（`$_TSR` 串流標記、`/assets/*-hash.js` modulepreload、`tsr-scroll-restoration`） |
| 建置工具 | **Grok App Builder**（載入 `https://grok.com/grok-app-builder/extensions.js`、`/__grok/manifest.webmanifest` 名稱為 "Grok App"） |
| 結構 | **同一個 app**（本案就做在這裡）同時提供 `/`（入口）、`/photography/*`（攝影站）與 `/filmmaking`（目前是 "Forthcoming · 即將開放" 佔位頁，有 "Entrance" 回主站按鈕）。尾斜線：`/photography/`、`/filmmaking/` 307 → 無斜線 |
| 入口頁 | 米白底 `#F3EFE8`、黑字 `#141414`；上方小字 `WEITA CHEN`（.72rem、uppercase、`letter-spacing .28em`）；左右兩扇「門」：`Photography / 攝影`、`Filmmaking / 影像`（Newsreader 襯線大字 `clamp(2.8rem,5.4vw,5.4rem)` + 中文小字 `.22em` 字距）；hover 時門變黑底 |
| 攝影站 | 語言路由 `/photography/en`、`/photography/zh-tw`；`/photography` 由 inline script 讀 `localStorage("weita-lang")`（值 `en`/`zh-tw`，預設 `en`）導向；左上固定 44px W 圖示（`/brand/icon-white.png`）連回首頁；右上語言切換 `中文 / EN`（.78rem、uppercase、`.14em`、半透明底＋blur）；底部中央圓形選單鈕（赭紅 `#B52`）展開 Home/Work/About/Contact；頁面進場 `.42s`、`translateY(14px)`、`cubic-bezier(0.22,1,0.36,1)`；有 skip link、`prefers-reduced-motion` 處理 |
| 字體 | Google Fonts：Outfit 300/400/500（sans）、Newsreader（serif）、Noto Sans TC、Noto Serif TC |
| 色彩 tokens | `--color-paper #10100e`、`--color-paper-deep #1b1a17`、`--color-ink #f3efe8`、`--color-muted #b3aa9f`、`--color-line #3a362f`、`--color-menu #070706`、`--color-ball #b52`；`theme-color #10100e` |
| 品牌資產 | `/favicon.svg`（深底 `#141414` + 暖白 W 折線）、`/brand/icon-white.png`、`/brand/logo-design-01.png`、`/og.jpg` 皆公開 |
| 小瑕疵 | 攝影站中文頁 `<html lang="en">` 未改成中文（我們會做對） |

### 15.2 姊妹房間一致性與品牌資產
- **一致**：W 圖示回入口、語言切換的位置/字級/字距/行為、`localStorage("weita-lang")`（同一把 key、值 `en`/`zh-tw`）、底色 `#10100E` 與暖白 `#F3EFE8`、Outfit 內文、44px 觸控目標、skip link、reduced-motion。
- **不同（保留電影感）**：暗場為主、Clash Display 大標、REC 紅取代攝影房間的赭紅 `#B52`、bento 影片牆與播放游標、劇院黑 lightbox。攝影房間的底部「選單球」**不搬過來**（影像房間用頂部 nav），避免兩套導航混淆；但手機選單開關可沿用圓形按鈕語彙。

**正式品牌資產**（PM 已備妥於 `/workspace/portfolio/brand/official/`，另有去除留白的 `trimmed/` 版本與 320/640px WebP；需上傳給 Grok Build 放進主站 `public/brand/`）：

| 檔案 | 內容 | 用途 | 主站狀態 |
|---|---|---|---|
| `wordmark-light.png` | 白色字標（雙橫線夾 WEITA／CHEN） | **影像房間 header / footer 字標**（暗底） | 需新增 → `/brand/wordmark-light.png` |
| `wordmark-dark.png` | 深灰字標 | 淺底用（OG 圖、淺色區塊） | 與既有 `/brand/logo-design-01.png` 完全相同（md5 一致），**直接用既有路徑** |
| `w-light.png` | 白色 W 圖示（含淡陰影） | RoomSwitch 回入口圖示、手機 header | 與既有 `/brand/icon-white.png` 完全相同，**直接用既有路徑** |
| `w-dark.png` | 黑色 W 圖示 | 淺底用 | 需新增 → `/brand/w-dark.png`（選用） |
| `/favicon.svg` | 深底 + 暖白 W 折線 | 全站 favicon | 既有，**不動**（影像房間沿用） |

- `BrandMark`：`<img src="/brand/wordmark-light.png" alt="WEITA CHEN" width height>`（用 trimmed 比例 761×563，header 高度 `--brand-h`：桌機 36px、手機 28px），WebP 優先（`<picture>`）。PNG 原檔是 1024×1024 含大量留白，**請用 trimmed 版**。日後若有 SVG 版可直接替換（元件保留 `src` 參數）。
- 字標旁不再另放文字 `WEITA CHEN`；螢幕閱讀器靠 `alt`。

### 15.3 部署方式
- 影像房間就是主站 app 的一部分：**同一個 repo、同一個 Vercel 專案、同一個網域**，隨主站一起由 Grok Build 發布。不需要 basePath、rewrites、Microfrontends，也**不需要改 DNS**。
- 程式碼分割：TanStack Router 依路由自動 code-split；GSAP、Video.js、影像房間元件只能在 `/filmmaking/**` 路由（或其 lazy 元件）內 import，不可加進 root route 或共用模組。
- 每個里程碑都要先在**預覽連結**驗收（含 §12.0 回歸），PM 同意後才發布到正式網域。
- 環境變數（Vite）：`VITE_MUX_DATA_ENV_KEY`（選配，Mux Data）；`MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` 只給本機或後台腳本使用，**絕不可加 `VITE_` 前綴**（否則會被打包進前端）。目前所有播放與縮圖都是公開 URL，前端不需要金鑰。
- 回退：Vercel Instant Rollback 到上一個部署。

### 15.4 需要韋達提供或確認
1. 中文姓名寫法（暫寫「陳韋達」）。
2. About / Contact 雙語文案、email、社群、合作客戶 logo。
3. 真實影片上傳到 Mux 後的 playback ID 清單（或給 PM Mux 存取權）。

## 16. 國際化（zh-TW / en）

### 16.1 路由（照攝影房間）
- 攝影房間實測：`/photography` 由 inline script 讀 `localStorage("weita-lang")`（`zh-tw` 或預設 `en`）後 `location.replace("/photography/" + lang)`；頁面在 `/photography/en/...`、`/photography/zh-tw/...`；語言切換是兩個 `<a hrefLang>`。
- 影像房間：`/filmmaking/en/...`、`/filmmaking/zh-tw/...`。第 0 步先看攝影房間在程式裡是用 `$lang` 動態參數還是固定資料夾，**用同一種寫法**。若用 `$lang`：在 `$lang/route.tsx` 的 `beforeLoad`（或 `params.parse`）驗證 `lang ∈ ["en","zh-tw"]`，否則 `throw notFound()`。
- 內容與字典：`features/filmmaking/lib/i18n.ts` 匯出 `locales`、`defaultLocale = "en"`、`getDictionary(lang)`、`t(localized, lang)`（缺中文回退英文、dev 時 console 警告）。不引入 i18n 套件。

### 16.2 語言分流與切換
- `/filmmaking`（index route）：與 `/photography` 相同做法——SSR 一個極小頁（`WEITA CHEN / Filmmaking / English・中文` 兩個連結），`head()` 內 inline script：讀 `localStorage("weita-lang")` → 沒有則看 `navigator.languages` 是否以 `zh` 開頭 → 預設 `en`，`location.replace("/filmmaking/" + lang)`。若攝影房間已有共用的分流 helper，直接重用。
- `LangSwitch`：`<a href="/filmmaking/{other}/{same-path}" hrefLang>`，點擊時寫 `localStorage("weita-lang")`（和攝影房間共用，所以從影像切到攝影會保持同語言）。若攝影房間另有寫 cookie，照做。
- 直接進入某語言的深層網址時不改導向。

### 16.3 `<html lang>` 與 SEO
- 主站 root 目前固定 `<html lang="en">`（攝影房間中文頁也是 en）。**M1–M6 不改 root**：影像房間在 `.film-root` 外層加 `lang="zh-Hant-TW"`／`lang="en"`（螢幕閱讀器與字體選擇會依此生效），並在 client 端 `useEffect` 同步 `document.documentElement.lang`、離開時還原。
- M7 提案（需同意）：root 依目前路徑中的 `/zh-tw` 段落輸出 `lang="zh-Hant-TW"`，一次修好兩個房間。
- 每頁 `head()`：`<link rel="alternate" hrefLang="en">`、`hrefLang="zh-Hant"`、`hrefLang="x-default"`（→ en）、canonical `https://weitachen.pro/filmmaking/{lang}/...`。
- 中文頁 meta：title 例「影像作品｜WEITA CHEN 陳韋達」（姓名待確認）。
- 字幕：`video.captions` 依目前語言預設開啟對應字幕軌。
