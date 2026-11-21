import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isFilmLang } from "@/features/filmmaking/lib/i18n";

export const Route = createFileRoute("/filmmaking/$lang/work/")({
  beforeLoad: ({ params }) => {
    if (!isFilmLang(params.lang)) throw notFound();
    throw redirect({
      to: "/filmmaking/$lang",
      params: { lang: params.lang },
      replace: true,
    });
  },
});
