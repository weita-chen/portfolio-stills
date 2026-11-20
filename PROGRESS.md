# PROGRESS

2026-11-20

## 目前狀態

公開網站是 [weitachen.pro](https://weitachen.pro)。Vercel 專案 `portfolio-stills`（WEITA / Hobby），原始碼在 [weita-chen/portfolio-stills](https://github.com/weita-chen/portfolio-stills)，`main` 已部署。

- `/` 是入口，Photography 與 Filmmaking 兩扇門。
- `/photography` 是攝影站。會依上次選擇的語言進 `/photography/en` 或 `/photography/zh-tw`。作品、關於、聯絡都在這底下。
- `/filmmaking` 只有佔位頁：Forthcoming · 即將開放。
- 舊網址 `/en/...`、`/zh-tw/...` 會轉到 `/photography` 底下的同一頁。
- 照片檔在 `/stills/...`，不跟網站路徑 `/photography` 混在一起。
- 作品列表每次進入或重整會隨機排；主題內頁仍照編輯順序。
- `www.weitachen.pro` 以 308 轉到 `weitachen.pro`。
- Porkbun 上的 Brevo／信箱記錄（DKIM、MX、SPF、DMARC）留著，沒有刪。

## 已決定的事

- 這個網域是入口，不是只有攝影站。攝影是 `weitachen.pro/photography`。
- 主網址用不帶 www 的 `weitachen.pro`。
- 入口只用現有字體和紙色，兩扇門並排，不加介紹文。
- Filmmaking 先佔位，不做第二個獨立專案或子網域。
- 公開站關閉登入：Vercel 環境變數 `VITE_AUTH_ENABLED=false`。
- 作品封面用各資料夾的 `hero`；內頁第一張是同一張的完整版。直幅封面旁留文字，橫幅則滿欄。
- Bubble Tea Shop 的列表封面是直的，內頁維持橫的。
- 尚未分類那組不上線（`published: false`）。

## 待決定的事

- Filmmaking 那一房要做什麼、什麼時候做。
- 要不要在 Vercel 加上 `VITE_SITE_URL=https://weitachen.pro`。沒設的話，canonical 和語系替代連結不會帶這個網域。
- 聯絡信箱還沒有。`contactEmail` 是空的，表單也不會真的寄出。
- 關於頁的自介和經歷仍是佔位文字。
- 入口的兩扇門之後要不要改文案或加圖片。
