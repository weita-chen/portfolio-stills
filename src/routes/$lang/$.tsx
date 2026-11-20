import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isLang } from "@/content/types";

export const Route = createFileRoute("/$lang/$")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
    const rest = params._splat ? `/${params._splat}` : "";
    throw redirect({
      href: `/photography/${params.lang}${rest}`,
      replace: true,
    });
  },
});
