import BookingExtraOption from "./BookingExtraOption";
import BookingOptionRow, { BookingOptionList } from "./BookingOptionRow";
import {
  cancellationInsuranceFee,
  formatHuf,
  isChargedAutomatically,
  travelInsuranceFee,
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
  /** The travel days the travel insurance is charged for. */
  travelDays: number | null;
  /** This passenger's part of the trip total, which the cancellation insurance is a percentage of. */
  tripShare: number | null;
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
  travelDays,
  tripShare,
  onApplyToEveryone,
}: PassengerOptionsPanelProps) {
  const showInsurances = insurances !== null && (travelInsuranceAvailable || cancellationInsuranceAvailable);

  if (extras.length === 0 && !showInsurances) {
    return null;
  }

  const percent = insurances?.cancellationInsurance.percent.toLocaleString("hu-HU");
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

        {insurances && travelInsuranceAvailable && travelDays !== null ? (
          <BookingOptionRow
            title={insurances.travelInsurance.name}
            note={`${formatHuf(insurances.travelInsurance.dailyFee)} / nap × ${travelDays} nap`}
            info={insurances.travelInsurance.info}
            price={formatHuf(travelInsuranceFee(insurances, travelDays))}
            checked={options.travelInsurance}
            onToggle={() => onChange({ ...options, travelInsurance: !options.travelInsurance })}
          />
        ) : null}

        {insurances && cancellationInsuranceAvailable ? (
          <BookingOptionRow
            title={insurances.cancellationInsurance.name}
            note={tripShare !== null ? `Az útdíj ${percent}%-a` : undefined}
            info={insurances.cancellationInsurance.info}
            price={tripShare !== null ? formatHuf(cancellationInsuranceFee(insurances, tripShare)) : `az útdíj ${percent}%-a`}
            checked={options.cancellationInsurance}
            onToggle={() => onChange({ ...options, cancellationInsurance: !options.cancellationInsurance })}
          />
        ) : null}
      </BookingOptionList>
    </fieldset>
  );
}
