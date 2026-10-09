import BookingExtraOption from "./BookingExtraOption";
import {
  formatHuf,
  isChargedAutomatically,
  type BookingExtra,
  type BookingInsurances,
  type PassengerOptions,
} from "./booking-pricing";

type PassengerOptionsPanelProps = {
  passengerIndex: number;
  /** The per-person extras a passenger can have (see passengerCardExtras). */
  extras: BookingExtra[];
  passengers: number;
  options: PassengerOptions;
  onChange: (options: PassengerOptions) => void;
  choiceError?: string;
  insurances: BookingInsurances | null;
  travelInsuranceAvailable: boolean;
  cancellationInsuranceAvailable: boolean;
  /** Copies these choices to every other passenger; offered on the first passenger only. */
  onApplyToEveryone?: () => void;
};

const insuranceCardClassName =
  "flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 transition-all cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5";

/**
 * The supplements ("felár") and insurances one passenger chooses, as fellow
 * travellers often want different ones.
 */
export default function PassengerOptionsPanel({
  passengerIndex,
  extras,
  passengers,
  options,
  onChange,
  choiceError,
  insurances,
  travelInsuranceAvailable,
  cancellationInsuranceAvailable,
  onApplyToEveryone,
}: PassengerOptionsPanelProps) {
  const showInsurances = insurances !== null && (travelInsuranceAvailable || cancellationInsuranceAvailable);

  if (extras.length === 0 && !showInsurances) {
    return null;
  }

  const toggleExtra = (id: number) =>
    onChange({
      ...options,
      extraIds: options.extraIds.includes(id) ? options.extraIds.filter((extraId) => extraId !== id) : [...options.extraIds, id],
    });

  return (
    <fieldset className="mt-5 border-t border-gray-100 pt-5">
      <legend className="mb-3 flex w-full flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-[#0f172a]">Felárak és biztosítás</span>
        {onApplyToEveryone ? (
          <button
            type="button"
            onClick={onApplyToEveryone}
            className="text-sm font-bold text-[#00a878] hover:text-[#00c389]"
          >
            Ugyanez a többi utasnak is
          </button>
        ) : null}
      </legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra) => {
          const automatic = isChargedAutomatically(extra, passengers);

          return (
            <BookingExtraOption
              key={extra.id}
              extra={extra}
              name={`passenger-${passengerIndex}-extra-choice-${extra.id}`}
              automatic={automatic}
              charged={automatic || options.extraIds.includes(extra.id)}
              onToggle={() => toggleExtra(extra.id)}
              choice={options.extraChoices[extra.id]}
              onChoiceChange={(choice) =>
                onChange({ ...options, extraChoices: { ...options.extraChoices, [extra.id]: choice } })
              }
              choiceError={choiceError}
            />
          );
        })}

        {insurances && travelInsuranceAvailable ? (
          <label className={insuranceCardClassName}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={options.travelInsurance}
                onChange={(event) => onChange({ ...options, travelInsurance: event.target.checked })}
                className="mt-1 accent-[#00c389]"
              />
              <div className="font-bold text-[#0f172a]">{insurances.travelInsurance.name}</div>
            </div>
            <div className="font-bold text-[#00a878] whitespace-nowrap">
              {formatHuf(insurances.travelInsurance.dailyFee)} / nap
            </div>
          </label>
        ) : null}

        {insurances && cancellationInsuranceAvailable ? (
          <label className={insuranceCardClassName}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={options.cancellationInsurance}
                onChange={(event) => onChange({ ...options, cancellationInsurance: event.target.checked })}
                className="mt-1 accent-[#00c389]"
              />
              <div className="font-bold text-[#0f172a]">{insurances.cancellationInsurance.name}</div>
            </div>
            <div className="font-bold text-[#00a878] whitespace-nowrap">
              az útdíj {insurances.cancellationInsurance.percent.toLocaleString("hu-HU")}%-a
            </div>
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
