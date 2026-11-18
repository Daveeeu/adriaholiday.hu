import { Check } from "lucide-react";

import type { TripDetail } from "../routes/TripRoute";

type TripDate = TripDetail["dateOptions"][number];

type TripDatePickerProps = {
  dates: TripDate[];
  selectedId: TripDate["id"];
  onSelect: (date: TripDate) => void;
  /** list: one under the other (the side panel); tiles: a grid sized by the surrounding container (the booking form). */
  variant?: "list" | "tiles";
  className?: string;
};

const VARIANT_CLASSES = {
  list: {
    list: "divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100",
    button: "",
    active: "bg-[#00c389]/10",
    idle: "bg-white hover:bg-[#f5f9fc]",
  },
  tiles: {
    list: "grid grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-3",
    button: "rounded-2xl border",
    active: "border-[#00c389] bg-[#00c389]/10",
    idle: "border-gray-200 bg-white hover:border-[#00c389]/50",
  },
};

/**
 * A trip's departures, each with only its dates and price; the selected
 * date's promotions show at the top of the page.
 */
export default function TripDatePicker({ dates, selectedId, onSelect, variant = "list", className = "" }: TripDatePickerProps) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <ul className={`${classes.list} ${className}`}>
      {dates.map((date) => {
        const active = date.id === selectedId;
        const price = date.displayedPrice || date.priceBox?.displayedPrice;
        const originalPrice = date.priceBox?.originalDisplayedPrice;

        return (
          <li key={date.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(date)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${classes.button} ${
                active ? classes.active : classes.idle
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-[#00c389] bg-[#00c389] text-white" : "border-gray-300"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5" /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block whitespace-nowrap font-bold text-[#0f172a]">{date.label}</span>
                <span className="block text-sm">
                  {date.bookable ? (
                    <>
                      {originalPrice ? <s className="mr-1.5 text-gray-400">{originalPrice}</s> : null}
                      <span className="font-semibold text-[#334155]">{price}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-red-600">{date.status}</span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
