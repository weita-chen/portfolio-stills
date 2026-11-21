import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilmSplit } from "@/features/filmmaking/components/FilmSplit";
import { getDictionary, isFilmLang } from "@/features/filmmaking/lib/i18n";
import { pageTitle } from "@/features/filmmaking/lib/name";
import { filmHead, personObject } from "@/features/filmmaking/lib/seo";

export const Route = createFileRoute("/filmmaking/$lang/contact")({
  head: ({ params }) => {
    const lang = isFilmLang(params.lang) ? params.lang : "en";
    const dictionary = getDictionary(lang);
    const path = `/filmmaking/${lang}/contact`;
    return filmHead({
      title: pageTitle(lang === "zh-tw" ? "聯絡" : "Contact", lang),
      description: dictionary.closing,
      path,
      lang,
      jsonLd: personObject({
        lang,
        path,
        email: dictionary.contactEmail,
        jobTitle: dictionary.aboutRoles,
      }),
    });
  },
  component: ContactPage,
});

function copyAddress(email: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(email).catch(() => copyAddressFallback(email));
  }
  return copyAddressFallback(email);
}

function copyAddressFallback(email: string): Promise<void> {
  const input = document.createElement("textarea");
  input.value = email;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-999px";
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand("copy");
  input.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

function ContactPage() {
  const { lang } = Route.useParams();
  if (!isFilmLang(lang)) throw notFound();
  const dictionary = getDictionary(lang);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <main id="content" className="film-page">
      <section>
        <p className="film-kicker">{dictionary.nav.contact}</p>
        <FilmSplit className="film-page-position">{lang === "zh-tw" ? "聯絡" : "Contact"}</FilmSplit>
        <p className="film-page-lede">{dictionary.closing}</p>
        <div className="film-contact-actions">
          <a className="film-contact-mail" href={`mailto:${dictionary.contactEmail}`}>
            {dictionary.contactEmail}
          </a>
          <button
            type="button"
            className="film-contact-copy"
            onClick={() => {
              void copyAddress(dictionary.contactEmail).then(
                () => setCopied(true),
                () => undefined,
              );
            }}
          >
            <span aria-live="polite">{copied ? dictionary.contactCopied : dictionary.contactCopy}</span>
          </button>
        </div>
      </section>
    </main>
  );
}
