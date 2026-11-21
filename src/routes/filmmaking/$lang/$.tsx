import { createFileRoute, notFound } from "@tanstack/react-router";

/** Unknown path under a real language. A missing language is redirected by the parent. */
export const Route = createFileRoute("/filmmaking/$lang/$")({
  beforeLoad: () => {
    throw notFound();
  },
});
