import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isLang } from "@/content/types";

export const Route = createFileRoute("/$lang/")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
    throw redirect({
      to: "/photography/$lang",
      params: { lang: params.lang },
      replace: true,
    });
  },
});
