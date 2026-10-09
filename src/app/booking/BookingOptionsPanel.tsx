import BookingExtraOption from "./BookingExtraOption";
import {
  formatHuf,
  isChargedAutomatically,
  isSelectable,
  type BookingDeparturePlace,
  type BookingExtra,
} from "./booking-pricing";

type BookingOptionsPanelProps = {
  departurePlaces: BookingDeparturePlace[];
  departurePlaceId: string;
  onDeparturePlaceChange: (id: string) => void;
  departurePlaceError?: string;
  /** Booking-level extras and the per-person ones everyone pays. */
  extras: BookingExtra[];
  passengers: number;
  bookingExtraIds: number[];
  onToggleExtra: (id: number) => void;
  extraChoices: Record<number, string>;
  onExtraChoiceChange: (id: number, choice: string) => void;
  extraChoiceError?: string;
  /** Extras or insurances are chosen per passenger on the passengers step. */
  hasPassengerOptions: boolean;
};

/**
 * Departure place and the supplements ("felár") of the selected tour date
 * that apply to the whole booking; mandatory supplements are shown ticked.
 * Supplements and insurances each passenger chooses are on the passengers step.
 */
export default function BookingOptionsPanel({
  departurePlaces,
  departurePlaceId,
  onDeparturePlaceChange,
  departurePlaceError,
  extras,
  passengers,
  bookingExtraIds,
  onToggleExtra,
  extraChoices,
  onExtraChoiceChange,
  extraChoiceError,
  hasPassengerOptions,
}: BookingOptionsPanelProps) {
  if (departurePlaces.length === 0 && extras.length === 0 && !hasPassengerOptions) {
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
              const automatic = isChargedAutomatically(extra, passengers);

              return (
                <BookingExtraOption
                  key={extra.id}
                  extra={extra}
                  name={`extra-choice-${extra.id}`}
                  automatic={automatic}
                  charged={automatic || (isSelectable(extra, passengers) && bookingExtraIds.includes(extra.id))}
                  onToggle={() => onToggleExtra(extra.id)}
                  choice={extraChoices[extra.id]}
                  onChoiceChange={(choice) => onExtraChoiceChange(extra.id, choice)}
                  choiceError={extraChoiceError}
                />
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {hasPassengerOptions ? (
        <p className="rounded-2xl bg-[#f5f9fc] px-5 py-4 text-sm text-gray-600">
          Az utasonként választható felárakat és az utasbiztosítást a <span className="font-bold">3. lépésben</span>,
          az utasok adatainál adhatod meg.
        </p>
      ) : null}
    </div>
  );
}
