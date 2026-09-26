import { Search, X } from "lucide-react";

import { describeOfferSearch, type OfferSearchCriteria } from "../content/offer-search";

type ActiveOfferSearchProps = {
  criteria: OfferSearchCriteria;
  onRemove: (key: keyof OfferSearchCriteria) => void;
};

export default function ActiveOfferSearch({ criteria, onRemove }: ActiveOfferSearchProps) {
  const items = describeOfferSearch(criteria);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f172a]">
        <Search className="h-4 w-4 text-[#00c389]" />
        Keresési feltételek
      </div>

      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              aria-label={`${item.label} feltétel törlése`}
              className="inline-flex items-center gap-2 rounded-full border border-[#00c389] bg-[#00c389]/15 px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#00c389]/25"
            >
              {item.label}
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
