import BookingExtraOption from "./BookingExtraOption";
import BookingOptionRow, { BookingOptionList } from "./BookingOptionRow";
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

      <BookingOptionList>
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
          <BookingOptionRow
            title={insurances.travelInsurance.name}
            price={`${formatHuf(insurances.travelInsurance.dailyFee)} / nap`}
            checked={options.travelInsurance}
            onToggle={() => onChange({ ...options, travelInsurance: !options.travelInsurance })}
          />
        ) : null}

        {insurances && cancellationInsuranceAvailable ? (
          <BookingOptionRow
            title={insurances.cancellationInsurance.name}
            price={`az útdíj ${insurances.cancellationInsurance.percent.toLocaleString("hu-HU")}%-a`}
            checked={options.cancellationInsurance}
            onToggle={() => onChange({ ...options, cancellationInsurance: !options.cancellationInsurance })}
          />
        ) : null}
      </BookingOptionList>
    </fieldset>
  );
}
