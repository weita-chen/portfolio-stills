import type { Copy } from "./types";

/** Production origin for canonical and hreflang links. */
export const siteOrigin = (import.meta.env.VITE_SITE_URL ?? "https://weitachen.pro").replace(/\/$/, "");

/**
 * Contact mailbox. Leave empty until the owner supplies an address.
 * Do not invent one.
 */
export const contactEmail = "";

/** Slideshow dwell time. */
export const slideshowMs = 5200;

export const langKey = "weita-lang";

export const site = {
  name: "WEITA CHEN",
  role: {
    en: "Photographer & Visual Storyteller",
    "zh-TW": "攝影師・影像敘事",
  } satisfies Copy,
  /** Starter homepage line. Replace in this file when final copy is ready. */
  lede: {
    en: "Still photographs for brands, places, and the people who move through them.",
    "zh-TW": "為品牌、地方，以及在其中移動的人，拍攝靜態影像。",
  } satisfies Copy,
  viewWork: { en: "View the work", "zh-TW": "查看作品" } satisfies Copy,
  contactCta: { en: "Contact", "zh-TW": "聯絡" } satisfies Copy,
  pause: { en: "Pause", "zh-TW": "暫停" } satisfies Copy,
  play: { en: "Play", "zh-TW": "播放" } satisfies Copy,
  menu: { en: "Open menu", "zh-TW": "開啟選單" } satisfies Copy,
  closeMenu: { en: "Close menu", "zh-TW": "關閉選單" } satisfies Copy,
  skip: { en: "Skip to content", "zh-TW": "跳至內容" } satisfies Copy,
  workLabel: { en: "Work", "zh-TW": "作品" } satisfies Copy,
  homeLabel: { en: "Home", "zh-TW": "首頁" } satisfies Copy,
  filterWork: { en: "Filter work", "zh-TW": "篩選作品" } satisfies Copy,
  filterHeading: { en: "Filter", "zh-TW": "篩選" } satisfies Copy,
  categoriesHeading: { en: "Categories", "zh-TW": "分類" } satisfies Copy,
  allWork: { en: "All", "zh-TW": "全部" } satisfies Copy,
  aboutLabel: { en: "About", "zh-TW": "關於" } satisfies Copy,
  contactLabel: { en: "Contact", "zh-TW": "聯絡" } satisfies Copy,
  workIntro: {
    en: "Projects in the order they are filed. Descriptions stay short until final copy is written.",
    "zh-TW": "作品依資料夾中的順序排列。正式文案完成前，說明先保持簡短。",
  } satisfies Copy,
  forthcoming: { en: "Photograph forthcoming", "zh-TW": "照片準備中" } satisfies Copy,
  placeholderProject: {
    en: "Photographs and final text are not in the folder yet.",
    "zh-TW": "照片與正式文字尚未放入資料夾。",
  } satisfies Copy,
  previous: { en: "Previous", "zh-TW": "上一件" } satisfies Copy,
  next: { en: "Next", "zh-TW": "下一件" } satisfies Copy,
  enlarge: { en: "Enlarge photograph", "zh-TW": "放大照片" } satisfies Copy,
  close: { en: "Close", "zh-TW": "關閉" } satisfies Copy,
  aboutBio: {
    en: "A short biography will go here. It has not been written yet.",
    "zh-TW": "簡短自介將放在這裡，目前尚未撰寫。",
  } satisfies Copy,
  portraitNote: {
    en: "Portrait forthcoming",
    "zh-TW": "肖像準備中",
  } satisfies Copy,
  experienceTitle: { en: "Experience", "zh-TW": "經歷" } satisfies Copy,
  experienceEmpty: {
    en: "To be added.",
    "zh-TW": "尚待補上。",
  } satisfies Copy,
  contactInvite: {
    en: "For commercial projects and collaborations.",
    "zh-TW": "商業案件與合作，歡迎來信。",
  } satisfies Copy,
  emailMissing: {
    en: "Email address to be added.",
    "zh-TW": "電子信箱尚待補上。",
  } satisfies Copy,
  formNote: {
    en: "The form is ready, but no delivery service is connected yet, so a message is not sent.",
    "zh-TW": "表單已可填寫，但寄送服務尚未接上，因此目前不會真的送出。",
  } satisfies Copy,
  selectedWork: { en: "Selected work", "zh-TW": "選用作品" } satisfies Copy,
};

/** Optional lines. Leave empty rather than inventing jobs or clients. */
export const experience: Copy[] = [];

export const formCopy = {
  name: { en: "Name", "zh-TW": "姓名" } satisfies Copy,
  email: { en: "Email", "zh-TW": "電子信箱" } satisfies Copy,
  organization: {
    en: "Company or organization (optional)",
    "zh-TW": "公司或單位（選填）",
  } satisfies Copy,
  projectType: {
    en: "Project type (optional)",
    "zh-TW": "案件類型（選填）",
  } satisfies Copy,
  message: { en: "Message", "zh-TW": "訊息" } satisfies Copy,
  send: { en: "Send", "zh-TW": "送出" } satisfies Copy,
  sending: { en: "Sending", "zh-TW": "送出中" } satisfies Copy,
  required: { en: "This field is required.", "zh-TW": "此欄必填。" } satisfies Copy,
  emailInvalid: {
    en: "Enter a valid email address.",
    "zh-TW": "請輸入有效的電子信箱。",
  } satisfies Copy,
  success: {
    en: "Sent. Thank you — the message was delivered.",
    "zh-TW": "已送出，謝謝。訊息已交付。",
  } satisfies Copy,
  notConfigured: {
    en: "Not sent. A delivery address has not been configured yet.",
    "zh-TW": "尚未送出。寄送位址還沒有設定。",
  } satisfies Copy,
  failed: {
    en: "Not sent. The delivery service returned an error.",
    "zh-TW": "尚未送出。寄送服務回報錯誤。",
  } satisfies Copy,
};

export const heroSlides: { projectId: string; imageId: string }[] = [
  { projectId: "nyc-spring", imageId: "nyc-01" },
  { projectId: "yilan-mt-taiping", imageId: "yilan-02" },
  { projectId: "bubble-tea-shop", imageId: "tea-01" },
  { projectId: "nyc-spring", imageId: "nyc-02" },
  { projectId: "yilan-mt-taiping", imageId: "yilan-04" },
  { projectId: "bubble-tea-shop", imageId: "tea-04" },
  { projectId: "nyc-spring", imageId: "nyc-08" },
  { projectId: "yilan-mt-taiping", imageId: "yilan-01" },
];
