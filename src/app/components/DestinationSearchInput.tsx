import { useEffect, useId, useState, type KeyboardEvent } from "react";

import {
  SEARCH_SUGGESTION_MIN_LENGTH,
  fetchSearchSuggestions,
  type SearchSuggestion,
} from "../content/search-suggestions-api";

const SUGGESTION_DELAY_MS = 200;

type DestinationSearchInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
};

/**
 * The hero's destination field: while typing it offers the destinations the
 * tours are searchable by (keywords, countries, regions) with their tour count,
 * so visitors pick a term that finds what they mean.
 */
export default function DestinationSearchInput({ id, value, onChange, className }: DestinationSearchInputProps) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = value.trim();

  useEffect(() => {
    if (query.length < SEARCH_SUGGESTION_MIN_LENGTH) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchSearchSuggestions(query, controller.signal)
        .then((items) => {
          setSuggestions(items);
          setActiveIndex(-1);
        })
        .catch(() => {
          // Suggestions are a convenience: the field keeps working without them.
          if (!controller.signal.aborted) {
            setSuggestions([]);
          }
        });
    }, SUGGESTION_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const expanded = open && suggestions.length > 0;

  const select = (suggestion: SearchSuggestion) => {
    onChange(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!expanded) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + step + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Úti cél"
        autoComplete="off"
        maxLength={100}
        className={className}
      />

      {expanded ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Úti cél javaslatok"
          className="absolute left-0 top-full z-30 mt-2 w-full md:min-w-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A1628]/95 py-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.label}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // Keeps the focus in the field, so the blur does not close the list before the pick.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-white ${
                index === activeIndex ? "bg-white/10" : ""
              }`}
            >
              <span className="truncate font-medium">{suggestion.label}</span>
              <span className="shrink-0 text-xs text-white/50">{suggestion.count} út</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
