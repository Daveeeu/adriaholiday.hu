import {
  extraPriceLabel,
  formatHuf,
  type BookingDeparturePlace,
  type BookingExtra,
} from "./booking-pricing";

type BookingOptionsPanelProps = {
  departurePlaces: BookingDeparturePlace[];
  departurePlaceId: string;
  onDeparturePlaceChange: (id: string) => void;
  departurePlaceError?: string;
  extras: BookingExtra[];
  selectedExtraIds: number[];
  onToggleExtra: (id: number) => void;
};

/**
 * Departure place and supplement ("felár") choices of the selected tour
 * date. Mandatory supplements are shown ticked and cannot be removed.
 */
export default function BookingOptionsPanel({
  departurePlaces,
  departurePlaceId,
  onDeparturePlaceChange,
  departurePlaceError,
  extras,
  selectedExtraIds,
  onToggleExtra,
}: BookingOptionsPanelProps) {
  if (departurePlaces.length === 0 && extras.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-5">
      {departurePlaces.length > 0 ? (
        <label className="block">
          <span className="block text-sm font-bold text-[#0f172a] mb-2">Felszállás helye*</span>
          <select
            value={departurePlaceId}
            onChange={(event) => onDeparturePlaceChange(event.target.value)}
            className={`w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:ring-4 transition-all ${
              departurePlaceError
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200 focus:border-[#00c389] focus:ring-[#00c389]/10"
            }`}
          >
            <option value="">Válassz felszállási helyet...</option>
            {departurePlaces.map((place) => (
              <option key={place.id} value={String(place.id)}>
                {place.fee > 0 ? `${place.name} (+${formatHuf(place.fee)} / fő)` : place.name}
              </option>
            ))}
          </select>
          {departurePlaceError ? (
            <span className="mt-1.5 block text-sm font-medium text-red-500">{departurePlaceError}</span>
          ) : null}
        </label>
      ) : null}

      {extras.length > 0 ? (
        <fieldset>
          <legend className="block text-sm font-bold text-[#0f172a] mb-2">Felárak</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extras.map((extra) => {
              const checked = extra.mandatory || selectedExtraIds.includes(extra.id);

              return (
                <label
                  key={extra.id}
                  className={`flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 transition-all ${
                    extra.mandatory
                      ? "bg-[#f5f9fc] cursor-default"
                      : "cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={extra.mandatory}
                      onChange={() => onToggleExtra(extra.id)}
                      className="mt-1 accent-[#00c389]"
                    />
                    <div>
                      <div className="font-bold text-[#0f172a]">{extra.name}</div>
                      {extra.mandatory ? <div className="text-gray-500 text-sm">Kötelező tétel</div> : null}
                    </div>
                  </div>

                  <div className="font-bold text-[#00a878] whitespace-nowrap">{extraPriceLabel(extra)}</div>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
