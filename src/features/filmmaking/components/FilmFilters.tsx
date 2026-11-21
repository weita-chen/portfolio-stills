import type { FilmCategory, FilmRole } from "../lib/content";
import { getDictionary, type FilmLang } from "../lib/i18n";

const categories: { id: FilmCategory; key: "commercial" | "musicVideo" | "documentary" | "narrative" | "brandFilm" | "event" | "personal" }[] = [
  { id: "commercial", key: "commercial" },
  { id: "music-video", key: "musicVideo" },
  { id: "documentary", key: "documentary" },
  { id: "narrative", key: "narrative" },
  { id: "brand-film", key: "brandFilm" },
  { id: "event", key: "event" },
  { id: "personal", key: "personal" },
];

const roles: { id: FilmRole; label: "director" | "dp" | "editor" }[] = [
  { id: "director", label: "director" },
  { id: "dp", label: "dp" },
  { id: "editor", label: "editor" },
];

export function FilmFilters({
  lang,
  category,
  role,
  onCategory,
  onRole,
}: {
  lang: FilmLang;
  category?: FilmCategory;
  role?: FilmRole;
  onCategory: (category?: FilmCategory) => void;
  onRole: (role?: FilmRole) => void;
}) {
  const dictionary = getDictionary(lang);
  return (
    <div className="film-filters">
      <div className="film-filter-row" role="group" aria-label={dictionary.filters.label}>
        <button type="button" aria-pressed={!category} onClick={() => onCategory(undefined)}>
          {dictionary.filters.all}
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            onClick={() => onCategory(category === item.id ? undefined : item.id)}
          >
            {dictionary.filters[item.key]}
          </button>
        ))}
      </div>
      <div className="film-filter-row" role="group" aria-label={dictionary.filters.roles}>
        <button type="button" aria-pressed={!role} onClick={() => onRole(undefined)}>
          {dictionary.filters.allRoles}
        </button>
        {roles.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={role === item.id}
            onClick={() => onRole(role === item.id ? undefined : item.id)}
          >
            {dictionary.roles[item.label]}
          </button>
        ))}
      </div>
    </div>
  );
}
