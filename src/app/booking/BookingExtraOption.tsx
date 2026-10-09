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

const cardClassName = "flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-5 transition-all";
const selectableCardClassName = `${cardClassName} cursor-pointer hover:border-[#00c389]/40 hover:bg-[#00c389]/5`;

const RULE_NOTES: Partial<Record<BookingExtra["chargeRule"], string>> = {
  mandatory: "Kötelező tétel",
  solo_traveller: "Egyedül utazóknak kötelező",
};

/**
 * One supplement ("felár") as a ticked card with its price; once charged, a
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
  const note = automatic ? RULE_NOTES[extra.chargeRule] : undefined;

  return (
    <div className={charged && extra.choices.length > 0 ? "md:col-span-2" : undefined}>
      <label className={automatic ? `${cardClassName} bg-[#f5f9fc] cursor-default` : selectableCardClassName}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={charged}
            disabled={automatic}
            onChange={onToggle}
            className="mt-1 accent-[#00c389]"
          />
          <div>
            <div className="font-bold text-[#0f172a]">{extra.name}</div>
            {note ? <div className="text-gray-500 text-sm">{note}</div> : null}
          </div>
        </div>

        <div className="font-bold text-[#00a878] whitespace-nowrap">{extraPriceLabel(extra)}</div>
      </label>

      {charged && extra.choices.length > 0 ? (
        <div className="mt-3 space-y-2 pl-2">
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
            <span className="mt-1.5 block text-sm font-medium text-red-500">{choiceError}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
