import { useState } from "react";
import { Info } from "lucide-react";

type InfoPopoverProps = {
  /** The button's accessible name, e.g. "Szállás: információ". */
  label: string;
  text: string;
  /** dark: on the trip hero's glass cards, the box spanning the card; light: on a white form, the box above the ⓘ. */
  tone: "dark" | "light";
};

const BUTTON_TONES = {
  dark: "h-6 w-6 bg-[#00c389]/20 text-[#5eead4] hover:bg-[#00c389] hover:text-white",
  light: "h-5 w-5 bg-[#00c389]/10 text-[#00a878] hover:bg-[#00c389] hover:text-white",
};

/** The dark box spans its nearest positioned ancestor (the card); the light one sits above the ⓘ itself. */
const BOX_PLACEMENTS = {
  dark: "inset-x-0 mb-3",
  light: "left-1/2 mb-2 w-72 max-w-[80vw] -translate-x-1/2",
};

/**
 * An ⓘ with a small box of details, as on the legacy site. A mouse opens it on
 * hover; a tap or click keeps it open until focus moves away.
 */
export default function InfoPopover({ label, text, tone }: InfoPopoverProps) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;

  return (
    <span
      className={`inline-flex ${tone === "light" ? "relative" : ""}`}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          // Inside a form option's label the ⓘ must not tick the option.
          event.preventDefault();
          setPinned((current) => !current);
        }}
        onBlur={() => setPinned(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setPinned(false);
            setHovered(false);
          }
        }}
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${BUTTON_TONES[tone]}`}
      >
        <Info className={tone === "dark" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className={`absolute bottom-full z-30 rounded-2xl bg-white p-4 text-left text-sm font-medium leading-relaxed text-[#334155] shadow-[0_20px_50px_rgba(15,23,42,0.25)] ${BOX_PLACEMENTS[tone]} ${
            tone === "light" ? "border border-gray-100" : ""
          }`}
        >
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#00a878]">Információ</span>
          <span className="whitespace-pre-line">{text}</span>
        </span>
      ) : null}
    </span>
  );
}
