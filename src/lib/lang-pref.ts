import { createIsomorphicFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { langKey } from "@/content/site";
import { isLang, type Lang } from "@/content/types";

/** One year. The preference is set only by the language toggle, never by Accept-Language. */
export const LANG_MAX_AGE = 60 * 60 * 24 * 365;

export function langFromCookieHeader(header: string | null | undefined): Lang | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== langKey) continue;
    let value = part.slice(eq + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep the raw value */
    }
    return isLang(value) ? value : null;
  }
  return null;
}

function storedLang(): Lang | null {
  try {
    const saved = localStorage.getItem(langKey);
    return saved && isLang(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Cookie first, then localStorage, otherwise English.
 * Never reads Accept-Language. The server implementation stays inside
 * createIsomorphicFn so the client bundle cannot import the request API.
 */
export const preferredLang = createIsomorphicFn()
  .client(async (): Promise<Lang> => {
    return langFromCookieHeader(document.cookie) ?? storedLang() ?? "en";
  })
  .server(async (): Promise<Lang> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    try {
      return langFromCookieHeader(getRequest().headers.get("cookie")) ?? "en";
    } catch {
      return "en";
    }
  });

export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(langKey, lang);
  } catch {
    /* storage may be blocked */
  }
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${langKey}=${encodeURIComponent(lang)}; Max-Age=${LANG_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/** Insert the chosen language into a room path that does not already have one. */
export function withPreferredLang(room: "photography" | "filmmaking", pathname: string, lang: Lang): string {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const base = `/${room}`;
  const rest = path === base ? "" : path.startsWith(`${base}/`) ? path.slice(base.length) : "";
  const first = rest.split("/").filter(Boolean)[0];
  if (first === "en" || first === "zh-tw") return path;
  return `${base}/${lang}${rest}`;
}

export function langRedirect(href: string) {
  return redirect({
    href,
    replace: true,
    statusCode: 307,
    headers: { "cache-control": "private, no-store" },
  });
}
