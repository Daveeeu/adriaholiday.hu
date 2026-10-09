import BookingOptionRow from "./BookingOptionRow";
import { extraPriceLabel, type BookingExtra } from "./booking-pricing";

type BookingExtraOptionProps = {
  extra: BookingExtra;
  /** Unique per rendered option, so the choice radios of different passengers do not share a group. */
  name: string;
  charged: boolean;
  /** Charged without the customer selecting it: shown ticked and locked. */
  automatic: boolean;
  onToggle: () => void;
  choice?: string;
  onChoiceChange: (choice: string) => void;
  choiceError?: string;
};

const RULE_NOTES: Partial<Record<BookingExtra["chargeRule"], string>> = {
  mandatory: "Kötelező tétel",
  solo_traveller: "Egyedül utazóknak kötelező",
};

/**
 * One supplement ("felár") as an option row with its price; once charged, a
 * supplement offering choices (single room: alone / roommate) asks for one.
 */
export default function BookingExtraOption({
  extra,
  name,
  charged,
  automatic,
  onToggle,
  choice,
  onChoiceChange,
  choiceError,
}: BookingExtraOptionProps) {
  return (
    <BookingOptionRow
      title={extra.name}
      note={automatic ? RULE_NOTES[extra.chargeRule] : undefined}
      price={extraPriceLabel(extra)}
      checked={charged}
      locked={automatic}
      onToggle={onToggle}
    >
      {extra.choices.length > 0 ? (
        <div className="space-y-2">
          {extra.choices.map((option) => (
            <label key={option} className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
              <input
                type="radio"
                name={name}
                checked={choice === option}
                onChange={() => onChoiceChange(option)}
                className="mt-1 accent-[#00c389]"
              />
              <span>{option}</span>
            </label>
          ))}
          {!choice && choiceError ? (
            <span className="block text-sm font-medium text-red-500">{choiceError}</span>
          ) : null}
        </div>
      ) : null}
    </BookingOptionRow>
  );
}
