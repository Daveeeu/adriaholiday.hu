import { EMPTY_PASSENGER_OPTIONS, type PassengerOptions } from "./booking-pricing.ts";

/**
 * One row of the supplements and insurances list: a per-person supplement
 * (by its id) or one of the two insurances. Every passenger has it or not.
 */
export type PassengerOptionKey =
  | { kind: "extra"; extraId: number }
  | { kind: "travelInsurance" }
  | { kind: "cancellationInsurance" };

/** Who of the passengers has a row ticked. */
export type PassengerOptionCoverage = "none" | "all" | "some";

export function optionKeyId(key: PassengerOptionKey): string {
  return key.kind === "extra" ? `extra-${key.extraId}` : key.kind;
}

export function hasPassengerOption(options: PassengerOptions, key: PassengerOptionKey): boolean {
  if (key.kind === "extra") {
    return options.extraIds.includes(key.extraId);
  }

  return options[key.kind];
}

function withPassengerOption(options: PassengerOptions, key: PassengerOptionKey, on: boolean): PassengerOptions {
  if (key.kind !== "extra") {
    return { ...options, [key.kind]: on };
  }

  const others = options.extraIds.filter((id) => id !== key.extraId);

  return { ...options, extraIds: on ? [...others, key.extraId] : others };
}

/** Ticks the row for the passengers `isOn` picks and unticks it for the rest; their other choices stay. */
export function setPassengerOption(
  all: PassengerOptions[],
  key: PassengerOptionKey,
  isOn: (index: number) => boolean,
): PassengerOptions[] {
  return all.map((options, index) => withPassengerOption(options ?? EMPTY_PASSENGER_OPTIONS, key, isOn(index)));
}

/** Ticks or unticks the row for one passenger only. */
export function togglePassengerOption(all: PassengerOptions[], key: PassengerOptionKey, passengerIndex: number): PassengerOptions[] {
  return setPassengerOption(all, key, (index) =>
    index === passengerIndex ? !hasPassengerOption(all[index], key) : hasPassengerOption(all[index], key),
  );
}

export function passengerOptionCoverage(all: PassengerOptions[], key: PassengerOptionKey): PassengerOptionCoverage {
  const ticked = all.filter((options) => hasPassengerOption(options, key)).length;

  if (ticked === 0) {
    return "none";
  }

  return ticked === all.length ? "all" : "some";
}
