import type { ReactNode } from "react";

type BookingOptionRowProps = {
  title: string;
  /** A short line under the title, e.g. "Kötelező tétel". */
  note?: string;
  price: string;
  checked: boolean;
  /** Charged without the customer selecting it: shown ticked and locked. */
  locked?: boolean;
  onToggle: () => void;
  /** Shown under the row while it is ticked, e.g. the single room choices. */
  children?: ReactNode;
};

/**
 * One supplement or insurance of the booking form as a list row: tick box
 * and name on the left, the price right-aligned in the same column on every row.
 */
export default function BookingOptionRow({ title, note, price, checked, locked = false, onToggle, children }: BookingOptionRowProps) {
  return (
    <li className={locked ? "bg-[#f5f9fc]" : undefined}>
      <label
        className={`flex items-center gap-4 px-5 py-4 transition-colors ${
          locked ? "cursor-default" : "cursor-pointer hover:bg-[#00c389]/5"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={onToggle}
          className="size-4 shrink-0 accent-[#00c389]"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[#0f172a]">{title}</span>
          {note ? <span className="block text-sm text-gray-500">{note}</span> : null}
        </span>
        <span className="shrink-0 text-right font-bold tabular-nums text-[#00a878] sm:min-w-[9.5rem]">{price}</span>
      </label>

      {checked && children ? <div className="px-5 pb-4 pl-[3.25rem]">{children}</div> : null}
    </li>
  );
}

/** The bordered list the option rows sit in. */
export function BookingOptionList({ children }: { children: ReactNode }) {
  return <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">{children}</ul>;
}
