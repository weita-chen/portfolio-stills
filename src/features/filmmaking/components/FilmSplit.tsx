import { useEffect, useRef } from "react";
import { isCoarseMobile, whenIdleOrGesture } from "../lib/defer";

export function FilmSplit({
  as = "h1",
  className,
  children,
}: {
  as?: "h1" | "span";
  className?: string;
  children: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let live = true;
    let revert: (() => void) | undefined;
    const begin = () => {
      if (!live || !node.isConnected) return;
      const started = performance.now();
      const moving = Boolean(document.documentElement.dataset.filmMove);
      void import("../lib/gsap").then(({ gsap, SplitText }) => {
        if (!live || !node.isConnected) return;
        if (!moving && performance.now() - started > 100) return;
        const count = node.textContent?.length ?? 0;
        const split = SplitText.create(node, {
          type: "words,chars",
          wordsClass: "film-split-word",
          charsClass: "film-split-char",
          autoSplit: true,
          aria: "auto",
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: moving ? 100 : 40,
              duration: 0.6,
              ease: "expo.out",
              stagger: count > 16 ? { amount: 0.5 } : 0.03,
            }),
        });
        revert = () => split.revert();
      });
    };
    const cancel = isCoarseMobile() ? whenIdleOrGesture(begin) : (begin(), () => undefined);
    return () => {
      live = false;
      cancel();
      revert?.();
    };
  }, [children]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
