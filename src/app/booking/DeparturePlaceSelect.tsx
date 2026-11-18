import type { BookingDeparturePlace } from "./booking-pricing";
import { formatHuf } from "../lib/price";

type DeparturePlaceSelectProps = {
  places: BookingDeparturePlace[];
  value: string;
  onChange: (id: string) => void;
  error?: string | null;
};

/** Where the passengers get on the coach, with its fee per person when it has one. */
export default function DeparturePlaceSelect({ places, value, onChange, error }: DeparturePlaceSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#0f172a]">Felszállás helye*</span>
      <select
        name="departure_place"
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`h-14 w-full rounded-2xl border bg-white px-5 outline-none transition-all focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-[#00c389] focus:ring-[#00c389]/10"
        }`}
      >
        <option value="">Válassz felszállási helyet...</option>
        {places.map((place) => (
          <option key={place.id} value={String(place.id)}>
            {place.fee > 0 ? `${place.name} (+${formatHuf(place.fee)} / fő)` : place.name}
          </option>
        ))}
      </select>
      {error ? <span data-booking-error className="mt-1.5 block text-sm font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
