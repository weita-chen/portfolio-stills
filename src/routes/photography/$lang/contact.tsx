import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/contact-form";
import { SiteFoot } from "@/components/shell";
import { contactEmail, site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/photography/$lang/contact")({
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    return pageHead({
      title: `${t(site.contactLabel, lang)} — ${site.name}`,
      description: t(site.contactInvite, lang),
      path: `/photography/${lang}/contact`,
      lang,
      enPath: "/photography/en/contact",
      zhPath: "/photography/zh-tw/contact",
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const { lang } = Route.useParams();
  const current = (isLang(lang) ? lang : "en") as Lang;
  return (
    <main id="content" className="page">
      <p className="page-kicker">{site.name}</p>
      <h1 className="page-title">{t(site.contactLabel, current)}</h1>
      <div className="contact-grid">
        <div className="contact-copy">
          <p className="lede">{t(site.contactInvite, current)}</p>
          {contactEmail ? (
            <p className="email-line">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          ) : (
            <p className="email-line email-missing">{t(site.emailMissing, current)}</p>
          )}
          <p className="awaiting">{t(site.formNote, current)}</p>
        </div>
        <ContactForm lang={current} />
      </div>
      <SiteFoot lang={current} />
    </main>
  );
}
