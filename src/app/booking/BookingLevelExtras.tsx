import BookingExtraOption from "./BookingExtraOption";
import { BookingOptionList } from "./BookingOptionRow";
import { isChargedAutomatically, isSelectable, type BookingExtra } from "./booking-pricing";

type BookingLevelExtrasProps = {
  /** Booking-level extras and the per-person ones everyone pays (see tripStepExtras). */
  extras: BookingExtra[];
  passengers: number;
  selectedIds: number[];
  onToggle: (id: number) => void;
  choices: Record<number, string>;
  onChoiceChange: (id: number, choice: string) => void;
  choiceError?: string | null;
};

/**
 * The supplements ("felár") that apply to the whole booking, each a tick box;
 * mandatory ones are shown ticked and locked.
 */
export default function BookingLevelExtras({
  extras,
  passengers,
  selectedIds,
  onToggle,
  choices,
  onChoiceChange,
  choiceError,
}: BookingLevelExtrasProps) {
  if (extras.length === 0) {
    return null;
  }

  return (
    <BookingOptionList>
      {extras.map((extra) => {
        const automatic = isChargedAutomatically(extra, passengers);

        return (
          <BookingExtraOption
            key={extra.id}
            extra={extra}
            name={`extra-choice-${extra.id}`}
            automatic={automatic}
            charged={automatic || (isSelectable(extra, passengers) && selectedIds.includes(extra.id))}
            onToggle={() => onToggle(extra.id)}
            choice={choices[extra.id]}
            onChoiceChange={(choice) => onChoiceChange(extra.id, choice)}
            choiceError={choiceError ?? undefined}
          />
        );
      })}
    </BookingOptionList>
  );
}
