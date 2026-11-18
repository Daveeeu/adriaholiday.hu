import { useState } from "react";
import { ArrowRight, ChevronUp, Lock } from "lucide-react";

import SimplePayLogo from "../components/SimplePayLogo";
import { useClaimMobileBottomBar } from "../components/mobile/mobileBottomBar";
import { useInView } from "../hooks/useInView";
import { formatHuf } from "../lib/price";
import type { BookingPriceEstimate, BookingPriceLine } from "./booking-pricing";

type BookingPriceSummaryProps = {
  estimate: BookingPriceEstimate;
  displayedTotal: string | null;
  deposit: { amount: number; label: string } | null;
  onlinePayment: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

type BookingSummaryPanelProps = BookingPriceSummaryProps & {
  title: string;
  /** Short facts of the chosen trip: date, transport, accommodation, head count. */
  facts: string[];
};

/** The dark panel in the trip page's sidebar on wide screens: what is booked, the price line by line, and the button. */
export function BookingSummaryPanel({ title, facts, ...summary }: BookingSummaryPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-[#07111f] p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,195,137,0.22),transparent_45%),radial-gradient(circle_at_90%_10%,rgba(22,184,255,0.18),transparent_40%)]" />

      <div className="relative">
        <div className="text-sm text-white/55">Kiválasztott utazás</div>
        <h3 className="mb-4 mt-1 text-xl font-extrabold leading-tight">{title}</h3>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <span key={fact} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/85">
              {fact}
            </span>
          ))}
        </div>

        <PriceLines estimate={summary.estimate} />
        <Total {...summary} />
        <SubmitButton {...summary} className="mt-5" />
        <PaymentNote {...summary} />
      </div>
    </div>
  );
}

/**
 * The bar stuck to the bottom of the screen while the form is in view on
 * phones and narrow screens: the total and the button, with the price lines
 * sliding up on a tap. It has to sit right in the form's box to stick.
 */
export function BookingSubmitBar({ className = "", ...summary }: BookingPriceSummaryProps & { className?: string }) {
  const [open, setOpen] = useState(false);
  const [barRef, onScreen] = useInView<HTMLDivElement>();

  useClaimMobileBottomBar(onScreen);

  return (
    <div
      ref={barRef}
      className={`sticky bottom-0 z-30 mt-6 rounded-t-[26px] bg-[#07111f] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 text-white shadow-[0_-12px_30px_rgba(7,17,31,0.25)] md:px-8 ${className}`}
    >
      {open ? (
        <div className="mb-4 border-b border-white/10 pb-4">
          <PriceLines estimate={summary.estimate} />
          <PaymentNote {...summary} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 @md:flex-row @md:items-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-end justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-xs text-white/55">Összesen</span>
            <span className="block whitespace-nowrap text-2xl font-extrabold text-[#00c389]">{summary.displayedTotal}</span>
          </span>
          <span className="flex items-center gap-1 pb-1 text-xs text-white/70 underline">
            Részletek
            <ChevronUp className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>

        <SubmitButton {...summary} className="@md:w-auto @md:shrink-0 @md:px-6" />
      </div>
    </div>
  );
}

/**
 * The price line by line: the trip's own fees first, then, apart, the
 * insurances, which are always invoiced separately, each with its subtotal.
 */
function PriceLines({ estimate }: { estimate: BookingPriceEstimate }) {
  if (estimate.lines.length === 0) {
    return null;
  }

  if (estimate.insuranceLines.length === 0) {
    return <LineList lines={estimate.lines} />;
  }

  return (
    <div className="space-y-3">
      <LineList lines={estimate.lines} />
      {estimate.tripTotal !== null ? <Subtotal label="Utazás díja" amount={estimate.tripTotal} /> : null}
      <div className="pt-1 text-xs font-bold uppercase tracking-wide text-white/45">Biztosítás – külön számlázzuk</div>
      <LineList lines={estimate.insuranceLines} />
      {estimate.total !== null && estimate.tripTotal !== null ? (
        <Subtotal label="Biztosítás díja" amount={estimate.total - estimate.tripTotal} />
      ) : null}
    </div>
  );
}

function LineList({ lines }: { lines: BookingPriceLine[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {lines.map((line) => (
        <li key={line.key} className="flex justify-between gap-4 text-white/80">
          <span className="min-w-0">
            {line.label}
            {line.perPerson ? (
              <span className="block text-xs text-white/50">
                {line.perPerson.count} fő × {formatHuf(line.perPerson.unitPrice)}
              </span>
            ) : null}
          </span>
          <span className="whitespace-nowrap font-bold text-white">{formatHuf(line.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

function Subtotal({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between gap-4 border-t border-white/10 pt-2 text-sm font-bold text-white">
      <span>{label}</span>
      <span className="whitespace-nowrap">{formatHuf(amount)}</span>
    </div>
  );
}

function Total({ displayedTotal, deposit, onlinePayment }: BookingPriceSummaryProps) {
  return (
    <>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
        <span className="text-sm text-white/55">Összesen</span>
        <span className="whitespace-nowrap text-3xl font-extrabold text-[#00c389]">{displayedTotal}</span>
      </div>
      {onlinePayment && deposit ? (
        <div className="mt-1 flex justify-between gap-4 text-sm text-white/80">
          <span>Most fizetendő előleg ({deposit.label})</span>
          <span className="whitespace-nowrap font-bold text-white">{formatHuf(deposit.amount)}</span>
        </div>
      ) : null}
    </>
  );
}

function SubmitButton({ onlinePayment, submitting, onSubmit, className = "" }: BookingPriceSummaryProps & { className?: string }) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={submitting}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] font-extrabold text-white transition-opacity disabled:opacity-60 ${className}`}
    >
      {submitting ? "Küldés..." : onlinePayment ? "Foglalás és fizetés" : "Foglalás elküldése"}
      {submitting ? null : <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

/** How the price is paid: the deposit or the whole amount online, or by the confirmation's instructions. */
function PaymentNote({ onlinePayment, deposit }: BookingPriceSummaryProps) {
  if (!onlinePayment) {
    return (
      <p className="mt-3 text-center text-xs text-white/55">
        A fizetés módját a visszaigazoló e-mailben küldjük.
      </p>
    );
  }

  return (
    <div className="mt-3 text-xs text-white/55">
      <p className="flex items-start justify-center gap-1.5 text-center">
        <Lock className="mt-px h-3.5 w-3.5 shrink-0" />
        {deposit
          ? "Az előleget online fizeted SimplePay-jel, a további részletek határidejét e-mailben küldjük."
          : "A teljes összeget online fizeted SimplePay-jel."}
      </p>
      <SimplePayLogo className="mt-3" />
    </div>
  );
}
