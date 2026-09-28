import {
  extraPriceLabel,
  formatHuf,
  isChargedAutomatically,
  isSelectable,
  type BookingDeparturePlace,
  type BookingExtra,
  type BookingInsuranceChoice,
  type BookingInsurances,
} from "./booking-pricing";

type BookingOptionsPanelProps = {
  departurePlaces: BookingDeparturePlace[];
  departurePlaceId: string;
  onDeparturePlaceChange: (id: string) => void;
  departurePlaceError?: string;
  extras: BookingExtra[];
  passengers: number;
  selectedExtraIds: number[];
  onToggleExtra: (id: number) => void;
  extraChoices: Record<number, string>;
  onExtraChoiceChange: (id: number, choice: string) => void;
  extraChoiceError?: string;
  insurances: BookingInsurances | null;
  insuranceChoice: BookingInsuranceChoice;
  onInsuranceChange: (choice: BookingInsuranceChoice) => void;
  travelInsuranceAvailable: boolean;
  cancellationInsuranceAvailable: boolean;
};

const cardClassName = "flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 transition-all";
const selectableCardClassName = `${cardClassName} cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5`;

/**
 * Departure place, supplement ("felár") and insurance choices of the
 * selected tour date. Automatically charged supplements are shown ticked
 * and cannot be removed; a charged supplement offering choices (single
 * room: alone / roommate) asks for one.
 */
export default function BookingOptionsPanel({
  departurePlaces,
  departurePlaceId,
  onDeparturePlaceChange,
  departurePlaceError,
  extras,
  passengers,
  selectedExtraIds,
  onToggleExtra,
  extraChoices,
  onExtraChoiceChange,
  extraChoiceError,
  insurances,
  insuranceChoice,
  onInsuranceChange,
  travelInsuranceAvailable,
  cancellationInsuranceAvailable,
}: BookingOptionsPanelProps) {
  const showInsurances = insurances !== null && (travelInsuranceAvailable || cancellationInsuranceAvailable);

  if (departurePlaces.length === 0 && extras.length === 0 && !showInsurances) {
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
          <FieldError error={departurePlaceError} />
        </label>
      ) : null}

      {extras.length > 0 ? (
        <fieldset>
          <legend className="block text-sm font-bold text-[#0f172a] mb-2">Felárak</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extras.map((extra) => {
              const automatic = isChargedAutomatically(extra, passengers);
              const charged = automatic || (isSelectable(extra) && selectedExtraIds.includes(extra.id));

              return (
                <div key={extra.id} className={charged && extra.choices.length > 0 ? "md:col-span-2" : undefined}>
                  <label className={automatic ? `${cardClassName} bg-[#f5f9fc] cursor-default` : selectableCardClassName}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={charged}
                        disabled={automatic}
                        onChange={() => onToggleExtra(extra.id)}
                        className="mt-1 accent-[#00c389]"
                      />
                      <div>
                        <div className="font-bold text-[#0f172a]">{extra.name}</div>
                        {extra.chargeRule === "mandatory" ? (
                          <div className="text-gray-500 text-sm">Kötelező tétel</div>
                        ) : null}
                        {extra.chargeRule === "solo_traveller" ? (
                          <div className="text-gray-500 text-sm">Egyedül utazóknak kötelező</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="font-bold text-[#00a878] whitespace-nowrap">{extraPriceLabel(extra)}</div>
                  </label>

                  {charged && extra.choices.length > 0 ? (
                    <div className="mt-3 space-y-2 pl-2">
                      {extra.choices.map((choice) => (
                        <label key={choice} className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
                          <input
                            type="radio"
                            name={`extra-choice-${extra.id}`}
                            checked={extraChoices[extra.id] === choice}
                            onChange={() => onExtraChoiceChange(extra.id, choice)}
                            className="mt-1 accent-[#00c389]"
                          />
                          <span>{choice}</span>
                        </label>
                      ))}
                      <FieldError error={!extraChoices[extra.id] ? extraChoiceError : undefined} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {showInsurances && insurances ? (
        <fieldset>
          <legend className="block text-sm font-bold text-[#0f172a] mb-2">Ajánlott utasbiztosítás</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {travelInsuranceAvailable ? (
              <label className={selectableCardClassName}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={insuranceChoice.travel}
                    onChange={(event) => onInsuranceChange({ ...insuranceChoice, travel: event.target.checked })}
                    className="mt-1 accent-[#00c389]"
                  />
                  <div className="font-bold text-[#0f172a]">{insurances.travelInsurance.name}</div>
                </div>
                <div className="font-bold text-[#00a878] whitespace-nowrap">
                  {formatHuf(insurances.travelInsurance.dailyFee)} / fő / nap
                </div>
              </label>
            ) : null}

            {cancellationInsuranceAvailable ? (
              <label className={selectableCardClassName}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={insuranceChoice.cancellation}
                    onChange={(event) => onInsuranceChange({ ...insuranceChoice, cancellation: event.target.checked })}
                    className="mt-1 accent-[#00c389]"
                  />
                  <div className="font-bold text-[#0f172a]">{insurances.cancellationInsurance.name}</div>
                </div>
                <div className="font-bold text-[#00a878] whitespace-nowrap">
                  az utazás díjának {insurances.cancellationInsurance.percent.toLocaleString("hu-HU")}%-a
                </div>
              </label>
            ) : null}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? <span className="mt-1.5 block text-sm font-medium text-red-500">{error}</span> : null;
}
