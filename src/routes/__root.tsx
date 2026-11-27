import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PwaRegister } from "@/components/pwa-register";
import appCss from "../styles.css?url";

const OUTFIT_LATIN = "/fonts/latin/QGYvz_MVcBeNP4NJtEtq.woff2";
const NEWSREADER_LATIN = "/fonts/latin/cY9AfjOCX1hbuyalUrK4397yjA.woff2";
const NEWSREADER_ITALIC = "/fonts/latin/cY9XfjOCX1hbuyalUrK439vogqCz_goCYw7oRd6JFYYzbA.woff2";

function documentLang(pathname: string) {
  return /^\/(?:photography|filmmaking)\/zh-tw(?:\/|$)/.test(pathname) ? "zh-Hant-TW" : "en";
}

function fontPreloads(pathname: string) {
  const links: Array<{
    rel: "preload";
    href: string;
    as: "font";
    type: "font/woff2";
    crossOrigin: "anonymous";
  }> = [
    {
      rel: "preload",
      href: OUTFIT_LATIN,
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
  ];
  const serif = pathname === "/" || pathname.startsWith("/photography");
  if (serif) {
    links.push({
      rel: "preload",
      href: NEWSREADER_LATIN,
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
  }
  if (pathname.startsWith("/photography")) {
    links.push({
      rel: "preload",
      href: NEWSREADER_ITALIC,
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
  }
  return links;
}

export const Route = createRootRoute({
  head: ({ matches }) => {
    const pathname = matches[matches.length - 1]?.pathname ?? "/";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "WEITA CHEN" },
        { name: "description", content: "Still photography by WEITA CHEN." },
        { name: "theme-color", content: "#000000" },
        { name: "application-name", content: "WEITA" },
        { name: "apple-mobile-web-app-title", content: "WEITA" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/favicon-16.png" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        ...fontPreloads(pathname),
        { rel: "stylesheet", href: "/fonts/latin.css" },
        { rel: "stylesheet", href: "/fonts/cjk.css", media: "print" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      ],
      scripts: [
        {
          children:
            '(function(){function enable(){var links=document.querySelectorAll(\'link[rel="stylesheet"][media="print"]\');for(var i=0;i<links.length;i++){if((links[i].getAttribute("href")||"").indexOf("/fonts/cjk.css")===-1)continue;(function(link){var apply=function(){link.media="all";};if(link.sheet)apply();else link.addEventListener("load",apply);})(links[i]);}}if(document.readyState==="complete")enable();else setTimeout(enable,0);})();',
        },
      ],
    };
  },
  component: RootDocument,
});

function RootDocument() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <html lang={documentLang(pathname)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <PwaRegister />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
