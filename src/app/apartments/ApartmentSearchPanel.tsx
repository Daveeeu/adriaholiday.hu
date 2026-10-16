import { CalendarDays, Hash, Search, SlidersHorizontal, Users } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import { todayDateString } from "../booking/booking-form-fields";
import type { ApartmentStay } from "./apartment-search-params";
import type { ApartmentLocationFilters, ApartmentSearch } from "./apartments-api";

type ApartmentSearchPanelProps = {
  filters: ApartmentLocationFilters;
  stay: ApartmentStay;
  search: ApartmentSearch;
  onSearch: (stay: ApartmentStay, search: ApartmentSearch) => void;
};

const INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-[15px] text-[#0f172a] outline-none transition-all focus:border-[#00c389] focus:ring-4 focus:ring-[#00c389]/10";

function toggle<T>(values: T[] | undefined, value: T): T[] {
  const current = values ?? [];

  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#00a878]">{icon}</span>
        {children}
      </span>
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "border-[#00c389] bg-[#00c389]/10 text-[#047857]"
          : "border-gray-200 bg-white text-[#334155] hover:border-[#00c389]/40"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The location page's apartment search: the stay (carried on to the booking
 * form), the number of guests and the apartment's code, and on request the
 * layout, category and service filters.
 */
export default function ApartmentSearchPanel({ filters, stay, search, onSearch }: ApartmentSearchPanelProps) {
  const [draftStay, setDraftStay] = useState(stay);
  const [draftSearch, setDraftSearch] = useState(search);
  const hasDetailedFilters = Boolean(search.layouts?.length || search.stars?.length || search.services?.length);
  const [detailed, setDetailed] = useState(hasDetailedFilters);
  const today = todayDateString();

  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(draftStay, { ...draftSearch, guests: draftStay.guests, page: 1 });
  }

  function reset() {
    const empty: ApartmentStay = { arrival: "", departure: "", guests: null };

    setDraftStay(empty);
    setDraftSearch({});
    onSearch(empty, {});
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-8"
      aria-label="Apartmankereső"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_0.8fr_auto] xl:items-end">
        <Field label="Érkezés" icon={<CalendarDays className="h-4 w-4" />}>
          <input
            type="date"
            min={today}
            value={draftStay.arrival}
            onChange={(event) => setDraftStay((current) => ({ ...current, arrival: event.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Távozás" icon={<CalendarDays className="h-4 w-4" />}>
          <input
            type="date"
            min={draftStay.arrival || today}
            value={draftStay.departure}
            onChange={(event) => setDraftStay((current) => ({ ...current, departure: event.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Személyek" icon={<Users className="h-4 w-4" />}>
          <input
            type="number"
            min={1}
            max={30}
            inputMode="numeric"
            placeholder="Fő"
            value={draftStay.guests ?? ""}
            onChange={(event) => {
              const guests = Number(event.target.value);
              setDraftStay((current) => ({ ...current, guests: Number.isInteger(guests) && guests > 0 ? guests : null }));
            }}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Kódszám" icon={<Hash className="h-4 w-4" />}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={20}
            placeholder="pl. 42"
            value={draftSearch.code ?? ""}
            onChange={(event) => setDraftSearch((current) => ({ ...current, code: event.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-7 font-semibold text-white shadow-[0_14px_44px_rgba(0,195,137,0.22)] transition-all hover:shadow-[0_18px_56px_rgba(0,195,137,0.28)] md:col-span-2 xl:col-span-1"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Keresés
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-expanded={detailed}
          onClick={() => setDetailed((open) => !open)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a878] hover:text-[#0f8fc9]"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {detailed ? "Részletes keresés elrejtése" : "Részletes keresés"}
        </button>
        <button type="button" onClick={reset} className="text-sm font-medium text-gray-500 hover:text-[#0f172a]">
          Szűrők törlése
        </button>
      </div>

      {detailed ? (
        <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6 lg:grid-cols-3">
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Elrendezés</legend>
            <div className="flex flex-wrap gap-2">
              {filters.layouts.map((layout) => (
                <Chip
                  key={layout.value}
                  active={draftSearch.layouts?.includes(layout.value) ?? false}
                  onClick={() => setDraftSearch((current) => ({ ...current, layouts: toggle(current.layouts, layout.value) }))}
                >
                  {layout.label}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Kategória</legend>
            <div className="flex flex-wrap gap-2">
              {filters.stars.map((stars) => (
                <Chip
                  key={stars}
                  active={draftSearch.stars?.includes(stars) ?? false}
                  onClick={() => setDraftSearch((current) => ({ ...current, stars: toggle(current.stars, stars) }))}
                >
                  {"★".repeat(stars)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Szolgáltatások</legend>
            <div className="flex flex-wrap gap-2">
              {filters.services.map((service) => (
                <Chip
                  key={service.key}
                  active={draftSearch.services?.includes(service.key) ?? false}
                  onClick={() => setDraftSearch((current) => ({ ...current, services: toggle(current.services, service.key) }))}
                >
                  {service.label}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}
    </form>
  );
}
