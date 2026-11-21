import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  coverOf,
  projectCategories,
  publishedProjects,
  workCategories,
} from "@/content/queries";
import { site } from "@/content/site";
import { t, type Lang, type Project } from "@/content/types";
import { Frame } from "./media";
import { photoSizes } from "@/content/photos";

const DRIFT = [
  { y: "-14vh", time: "18.5s", delay: "0s", lead: "0px" },
  { y: "-9vh", time: "26.7s", delay: "0.2s", lead: "-8vh" },
  { y: "-16vh", time: "21.5s", delay: "0.05s", lead: "-3vh" },
  { y: "-11vh", time: "29.7s", delay: "0.35s", lead: "-12vh" },
];

function useColumnCount() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1080px)");
    const mid = window.matchMedia("(min-width: 801px)");
    const apply = () => setCount(wide.matches ? 4 : mid.matches ? 2 : 1);
    apply();
    wide.addEventListener("change", apply);
    mid.addEventListener("change", apply);
    return () => {
      wide.removeEventListener("change", apply);
      mid.removeEventListener("change", apply);
    };
  }, []);
  return count;
}

function useDrift(enabled: boolean) {
  const stopped = useRef(false);
  const [drifting, setDrifting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced || stopped.current) {
      setDrifting(false);
      return;
    }
    setDrifting(true);
    const stop = () => {
      stopped.current = true;
      setDrifting(false);
    };
    const onScroll = () => {
      if (window.scrollY > 6) stop();
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        stop();
      }
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [enabled]);

  return drifting;
}

function shuffleIds(ids: string[]): string[] {
  const next = ids.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

function bucketize(items: Project[], count: number): Project[][] {
  const columns = Array.from({ length: count }, () => [] as Project[]);
  items.forEach((item, index) => {
    columns[index % count]!.push(item);
  });
  return columns;
}

export function WorkGrid({ lang }: { lang: Lang }) {
  const catalog = publishedProjects();
  const [order, setOrder] = useState<string[] | null>(null);
  const categories = workCategories(catalog);
  const cols = useColumnCount();
  const drifting = useDrift(cols > 1);
  const stageRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    col: number;
    gutterClosed: number;
    gutterOpen: number;
  } | null>(null);

  useEffect(() => {
    const close = () => setFilterOpen(false);
    window.addEventListener("weita:work-filter-close", close);
    return () => window.removeEventListener("weita:work-filter-close", close);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("weita:work-filter", { detail: filterOpen && cols > 1 }));
    return () => {
      window.dispatchEvent(new CustomEvent("weita:work-filter", { detail: false }));
    };
  }, [filterOpen, cols]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || cols < 2) {
      setMetrics(null);
      return;
    }
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const columns = el.querySelector(".work-columns");
      const gap = columns ? parseFloat(getComputedStyle(columns).columnGap) || rem : rem;
      const gutterClosed = 2.6 * rem;
      const width = el.clientWidth;
      const col = (width - gutterClosed - cols * gap) / cols;
      const gutterOpen = Math.min(Math.max(width * 0.28, 18 * rem), 26 * rem);
      setMetrics({ col: Math.max(col, 80), gutterClosed, gutterOpen });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cols]);

  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  useEffect(() => {
    setOrder(shuffleIds(publishedProjects().map((project) => project.id)));
  }, []);

  const projects = order
    ? order.flatMap((id) => {
        const project = catalog.find((item) => item.id === id);
        return project ? [project] : [];
      })
    : catalog;

  const visible = projects.filter((project) => {
    if (!active) return true;
    return projectCategories(project).some((category) => category.en === active);
  });

  const choose = (key: string | null) => {
    setActive(key);
  };

  const columns = cols === 1 ? [visible] : bucketize(visible, cols);
  const mid = Math.floor(Math.max(columns.length, 1) / 2);
  const left = cols === 1 ? columns : columns.slice(0, mid);
  const right = cols === 1 ? [] : columns.slice(mid);
  const gutter = metrics ? (filterOpen ? metrics.gutterOpen : metrics.gutterClosed) : null;
  const template =
    cols > 1 && metrics && gutter != null
      ? cols === 2
        ? `${metrics.col}px ${gutter}px ${metrics.col}px`
        : `${metrics.col}px ${metrics.col}px ${gutter}px ${metrics.col}px ${metrics.col}px`
      : undefined;

  return (
    <div
      ref={stageRef}
      className="work-stage"
      data-cols={cols}
      data-filter={filterOpen ? "open" : "closed"}
      data-drifting={drifting ? "true" : "false"}
      data-measured={metrics ? "true" : "false"}
      data-shuffled={order ? "true" : "false"}
    >
      {cols === 1 ? (
        <MobileFilter
          lang={lang}
          total={projects.length}
          categories={categories}
          active={active}
          onChoose={choose}
        />
      ) : null}
      <div className="work-clip">
        <div className="work-columns" style={template ? { gridTemplateColumns: template } : undefined}>
          {cols === 1 ? (
            <Column projects={visible} lang={lang} drift={DRIFT[0]!} lead="0px" start={0} />
          ) : (
            <>
              <ColumnGroup columns={left} lang={lang} />
              <div className="filter-gutter" />
              <ColumnGroup columns={right} lang={lang} offset={left.length} />
            </>
          )}
        </div>
      </div>
      {cols > 1 ? (
        <div className="filter-overlay" style={gutter != null ? { width: `${gutter}px` } : undefined}>
          <FilterSlot
            lang={lang}
            open={filterOpen}
            total={projects.length}
            categories={categories}
            active={active}
            onOpen={() => setFilterOpen(true)}
            onChoose={choose}
          />
        </div>
      ) : null}
    </div>
  );
}

function ColumnGroup({
  columns,
  lang,
  offset = 0,
}: {
  columns: Project[][];
  lang: Lang;
  offset?: number;
}) {
  let cursor = 0;
  return columns.map((projects, index) => {
    const columnIndex = offset + index;
    const start = cursor;
    cursor += projects.length;
    const preset = DRIFT[columnIndex % DRIFT.length]!;
    return (
      <Column
        key={columnIndex}
        projects={projects}
        lang={lang}
        drift={preset}
        lead={preset.lead}
        start={start}
      />
    );
  });
}

function Column({
  projects,
  lang,
  drift,
  lead,
  start,
}: {
  projects: Project[];
  lang: Lang;
  drift: { y: string; time: string; delay: string };
  lead: string;
  start: number;
}) {
  return (
    <div
      className="work-col"
      style={
        {
          "--drift-y": drift.y,
          "--drift": drift.time,
          "--drift-delay": drift.delay,
          "--lead": lead,
        } as CSSProperties
      }
    >
      {projects.map((project, index) => (
        <Tile
          key={project.id}
          project={project}
          lang={lang}
          priority={start + index === 0}
        />
      ))}
    </div>
  );
}

function Tile({
  project,
  lang,
  priority,
}: {
  project: Project;
  lang: Lang;
  priority: boolean;
}) {
  const cover = coverOf(project);
  if (!cover) return null;
  const ratio = `${cover.width} / ${cover.height}`;
  const cats = projectCategories(project).map((category) => t(category, lang));
  const place = project.location ? t(project.location, lang) : "";
  const sub =
    [...cats, place].filter(Boolean).join(" · ") ||
    (project.awaiting ? t(site.forthcoming, lang) : "");
  return (
    <Link
      to="/photography/$lang/work/$slug"
      params={{ lang, slug: project.slug }}
      className="work-tile"
    >
      <div className="tile-media" style={{ aspectRatio: ratio }}>
        <Frame photo={cover} lang={lang} priority={priority} ratio={false} sizes={photoSizes.tile} />
      </div>
      <span className="tile-caption">
        <span className="tile-title">{t(project.title, lang)}</span>
        {sub ? <span className="tile-sub">{sub}</span> : null}
      </span>
    </Link>
  );
}

function FilterSlot({
  lang,
  open,
  total,
  categories,
  active,
  onOpen,
  onChoose,
}: {
  lang: Lang;
  open: boolean;
  total: number;
  categories: ReturnType<typeof workCategories>;
  active: string | null;
  onOpen: () => void;
  onChoose: (key: string | null) => void;
}) {
  return (
    <div className="filter-slot">
      <div className="filter-sticky">
        <button
          type="button"
          className="filter-tab"
          aria-expanded={open}
          aria-controls="work-filter"
          onClick={onOpen}
        >
          {t(site.filterWork, lang)}
        </button>
        <div
          className="filter-panel"
          id="work-filter"
          role="region"
          aria-label={t(site.categoriesHeading, lang)}
          aria-hidden={!open}
          inert={!open}
        >
          <p className="filter-kicker">{t(site.categoriesHeading, lang)}</p>
          <CategoryList
            lang={lang}
            total={total}
            categories={categories}
            active={active}
            onChoose={onChoose}
          />
        </div>
      </div>
    </div>
  );
}

function MobileFilter({
  lang,
  total,
  categories,
  active,
  onChoose,
}: {
  lang: Lang;
  total: number;
  categories: ReturnType<typeof workCategories>;
  active: string | null;
  onChoose: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mobile-filter" data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="mobile-filter-toggle"
        aria-expanded={open}
        aria-controls="mobile-work-filter"
        onClick={() => setOpen((value) => !value)}
      >
        {t(site.filterWork, lang)}
      </button>
      <div className="mobile-filter-panel" id="mobile-work-filter">
        <div>
          <CategoryList
            lang={lang}
            total={total}
            categories={categories}
            active={active}
            onChoose={onChoose}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryList({
  lang,
  total,
  categories,
  active,
  onChoose,
}: {
  lang: Lang;
  total: number;
  categories: ReturnType<typeof workCategories>;
  active: string | null;
  onChoose: (key: string | null) => void;
}) {
  return (
    <ul className="filter-list">
      <li>
        <button type="button" aria-pressed={active === null} onClick={() => onChoose(null)}>
          <span>{t(site.allWork, lang)}</span>
          <span className="filter-count">{total}</span>
        </button>
      </li>
      {categories.map((category) => (
        <li key={category.key}>
          <button
            type="button"
            aria-pressed={active === category.key}
            onClick={() => onChoose(active === category.key ? null : category.key)}
          >
            <span>{t(category.label, lang)}</span>
            <span className="filter-count">{category.count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
