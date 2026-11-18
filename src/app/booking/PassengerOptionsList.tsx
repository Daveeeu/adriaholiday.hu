import { useState } from "react";

import BookingExtraOption from "./BookingExtraOption";
import BookingOptionRow, { BookingOptionList } from "./BookingOptionRow";
import InfoPopover from "../components/InfoPopover";
import {
  cancellationInsuranceFee,
  extraPriceLabel,
  isChargedAutomatically,
  travelInsuranceFee,
  type BookingExtra,
  type BookingInsurances,
  type PassengerOptions,
} from "./booking-pricing";
import {
  hasPassengerOption,
  optionKeyId,
  passengerOptionCoverage,
  setPassengerOption,
  togglePassengerOption,
  type PassengerOptionKey,
} from "./passenger-option-rows";
import { formatHuf } from "../lib/price";

type PassengerOptionsListProps = {
  /** The passengers' names as typed so far, or "2. utas" while empty. */
  passengerNames: string[];
  /** The per-person supplements a passenger can have (see passengerCardExtras). */
  extras: BookingExtra[];
  /** One entry per passenger. */
  options: PassengerOptions[];
  onChange: (options: PassengerOptions[]) => void;
  /** A missing supplement choice (single room: alone / roommate), by passenger. */
  choiceErrors: Record<number, string>;
  insurances: BookingInsurances | null;
  travelInsuranceAvailable: boolean;
  cancellationInsuranceAvailable: boolean;
  /** The travel days the travel insurance is charged for. */
  travelDays: number | null;
  /** Each passenger's part of the trip total, which the cancellation insurance is a percentage of. */
  passengerShares: number[];
};

type OptionRow = {
  key: PassengerOptionKey;
  title: string;
  note?: string;
  info?: string | null;
  price: string;
  extra?: BookingExtra;
};

type Coverage = "none" | "all" | "custom";

const COVERAGE_LABELS: Record<Coverage, string> = {
  none: "Senkinek",
  all: "Mindenkinek",
  custom: "Egyénileg",
};

/**
 * The per-person supplements ("felár") or the insurances. With one passenger a
 * row is a tick box; in a group a row is given to nobody, everyone, or picked
 * passenger by passenger, so a group does not tick the same box for everyone.
 * The passengers always show under the row: green who has it, red when nobody
 * does, and a tap on one changes just that passenger.
 */
export default function PassengerOptionsList({
  passengerNames,
  extras,
  options,
  onChange,
  choiceErrors,
  insurances,
  travelInsuranceAvailable,
  cancellationInsuranceAvailable,
  travelDays,
  passengerShares,
}: PassengerOptionsListProps) {
  // Rows switched to "Egyénileg" while everyone or nobody has them yet.
  const [customRows, setCustomRows] = useState<string[]>([]);
  const rows = optionRows({ extras, insurances, travelInsuranceAvailable, cancellationInsuranceAvailable, travelDays, passengerShares });

  if (rows.length === 0) {
    return null;
  }

  if (options.length === 1) {
    return (
      <BookingOptionList>
        {rows.map(({ extra, ...row }) =>
          extra ? (
            <BookingExtraOption
              key={optionKeyId(row.key)}
              extra={extra}
              name={`passenger-0-extra-choice-${extra.id}`}
              automatic={isChargedAutomatically(extra, 1)}
              charged={isChargedAutomatically(extra, 1) || hasPassengerOption(options[0], row.key)}
              onToggle={() => onChange(togglePassengerOption(options, row.key, 0))}
              choice={options[0].extraChoices[extra.id]}
              onChoiceChange={(choice) => onChange(withChoice(options, 0, extra.id, choice))}
              choiceError={choiceErrors[0]}
            />
          ) : (
            <BookingOptionRow
              key={optionKeyId(row.key)}
              title={row.title}
              note={row.note}
              info={row.info}
              price={row.price}
              checked={hasPassengerOption(options[0], row.key)}
              onToggle={() => onChange(togglePassengerOption(options, row.key, 0))}
            />
          ),
        )}
      </BookingOptionList>
    );
  }

  function coverageOf(row: OptionRow): Coverage {
    const coverage = passengerOptionCoverage(options, row.key);

    return coverage === "some" || customRows.includes(optionKeyId(row.key)) ? "custom" : coverage;
  }

  function changeCoverage(row: OptionRow, coverage: Coverage) {
    const id = optionKeyId(row.key);

    setCustomRows((current) => (coverage === "custom" ? [...current, id] : current.filter((rowId) => rowId !== id)));

    if (coverage !== "custom") {
      onChange(setPassengerOption(options, row.key, () => coverage === "all"));
    }
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const id = optionKeyId(row.key);
        const { extra } = row;
        const coverage = coverageOf(row);
        const ticked = options.flatMap((passenger, index) => (hasPassengerOption(passenger, row.key) ? [index] : []));

        return (
          <li
            key={id}
            className={`rounded-2xl border p-3 transition-colors @md:p-4 ${
              ticked.length > 0 ? "border-[#00c389] bg-[#00c389]/5" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-bold text-[#0f172a]">
                  {row.title}
                  {row.info ? <InfoPopover label={`${row.title}: információ`} text={row.info} tone="light" /> : null}
                </div>
                <div className="text-sm text-gray-500">{[row.price, row.note].filter(Boolean).join(" · ")}</div>
              </div>

              <CoverageSwitch name={`coverage-${id}`} label={row.title} value={coverage} onChange={(value) => changeCoverage(row, value)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-gray-300 pt-3">
              <span className="mr-1 text-sm text-gray-500">Kinek?</span>
              {passengerNames.map((name, index) => (
                <PassengerChip
                  key={index}
                  name={name}
                  state={ticked.includes(index) ? "on" : coverage === "none" ? "off" : "idle"}
                  onClick={() => onChange(togglePassengerOption(options, row.key, index))}
                />
              ))}
              <span className={`ml-auto text-sm font-bold ${coverage === "none" ? "text-red-500" : "text-[#00865f]"}`}>
                {coverage === "none" ? "senkinek" : coverage === "all" ? "mindenkinek" : `${ticked.length} főnek`}
              </span>
            </div>

            {extra && extra.choices.length > 0 && ticked.length > 0 ? (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                {ticked.map((index) => (
                  <ExtraChoice
                    key={index}
                    extra={extra}
                    passengerName={passengerNames[index]}
                    name={`passenger-${index}-extra-choice-${extra.id}`}
                    choice={options[index].extraChoices[extra.id]}
                    error={choiceErrors[index]}
                    onChange={(choice) => onChange(withChoice(options, index, extra.id, choice))}
                  />
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function optionRows({
  extras,
  insurances,
  travelInsuranceAvailable,
  cancellationInsuranceAvailable,
  travelDays,
  passengerShares,
}: Pick<
  PassengerOptionsListProps,
  "extras" | "insurances" | "travelInsuranceAvailable" | "cancellationInsuranceAvailable" | "travelDays" | "passengerShares"
>): OptionRow[] {
  const rows: OptionRow[] = extras.map((extra) => ({
    key: { kind: "extra", extraId: extra.id },
    title: extra.name,
    price: extraPriceLabel(extra),
    extra,
  }));

  if (insurances && travelInsuranceAvailable && travelDays !== null) {
    rows.push({
      key: { kind: "travelInsurance" },
      title: insurances.travelInsurance.name,
      note: `${formatHuf(insurances.travelInsurance.dailyFee)} / nap × ${travelDays} nap`,
      info: insurances.travelInsurance.info,
      price: `${formatHuf(travelInsuranceFee(insurances, travelDays))} / fő`,
    });
  }

  if (insurances && cancellationInsuranceAvailable) {
    const percent = insurances.cancellationInsurance.percent.toLocaleString("hu-HU");
    const share = passengerShares[0];

    rows.push({
      key: { kind: "cancellationInsurance" },
      title: insurances.cancellationInsurance.name,
      note: `az útdíj ${percent}%-a`,
      info: insurances.cancellationInsurance.info,
      price: share !== undefined ? `${formatHuf(cancellationInsuranceFee(insurances, share))} / fő` : `az útdíj ${percent}%-a`,
    });
  }

  return rows;
}

function withChoice(options: PassengerOptions[], index: number, extraId: number, choice: string): PassengerOptions[] {
  return options.map((passenger, passengerIndex) =>
    passengerIndex === index ? { ...passenger, extraChoices: { ...passenger.extraChoices, [extraId]: choice } } : passenger,
  );
}

/** Nobody / everyone / passenger by passenger, as one row of three radio buttons. */
function CoverageSwitch({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: Coverage;
  onChange: (value: Coverage) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid shrink-0 grid-cols-3 rounded-xl bg-[#f1f5f9] p-1 @2xl:w-[330px]">
      {(Object.keys(COVERAGE_LABELS) as Coverage[]).map((coverage) => (
        <label key={coverage} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === coverage}
            onChange={() => onChange(coverage)}
            className="peer sr-only"
          />
          <span className="block rounded-lg px-0.5 py-2 text-center text-xs font-bold @md:text-[13px] text-gray-500 transition-colors peer-checked:bg-white peer-checked:text-[#00865f] peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[#00c389]">
            {COVERAGE_LABELS[coverage]}
          </span>
        </label>
      ))}
    </div>
  );
}

/** The pick a supplement asks of one passenger who has it, e.g. a single room alone or with a roommate. */
function ExtraChoice({
  extra,
  passengerName,
  name,
  choice,
  error,
  onChange,
}: {
  extra: BookingExtra;
  passengerName: string;
  name: string;
  choice?: string;
  error?: string;
  onChange: (choice: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-[#0f172a]">{passengerName}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {extra.choices.map((option) => (
          <label key={option} className="flex cursor-pointer items-start gap-2 text-sm text-[#0f172a]">
            <input type="radio" name={name} checked={choice === option} onChange={() => onChange(option)} className="mt-1 accent-[#00c389]" />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {!choice && error ? <span data-booking-error className="mt-1 block text-sm font-medium text-red-500">{error}</span> : null}
    </fieldset>
  );
}

/**
 * One passenger under a supplement or insurance row. on: has it (green);
 * off: the row is given to nobody (red); idle: picked one by one, not this one.
 */
function PassengerChip({ name, state, onClick }: { name: string; state: "on" | "off" | "idle"; onClick: () => void }) {
  const styles = {
    on: "border-[#00c389] bg-[#00c389] text-white",
    off: "border-red-200 bg-red-50 text-red-600 hover:border-red-300",
    idle: "border-gray-200 bg-white text-gray-600 hover:border-[#00c389]",
  };

  return (
    <button
      type="button"
      aria-pressed={state === "on"}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${styles[state]}`}
    >
      {state === "on" ? "✓ " : state === "off" ? "✕ " : ""}
      {name}
    </button>
  );
}
