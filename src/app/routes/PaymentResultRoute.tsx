import { useEffect, useRef, useState } from "react";
import { Check, Clock, CreditCard, Home, RotateCcw, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { trackEvent } from "../analytics/trackEvent";
import SimplePayLogo from "../components/SimplePayLogo";
import ResultHeading from "../components/ResultHeading";
import Seo from "../seo/Seo";
import {
  BookingApiError,
  fetchBookingPayment,
  fetchReturnedBookingPayment,
  retryBookingPayment,
  type BookingPaymentResult,
} from "../booking/bookings-api";
import { formatHuf } from "../booking/booking-pricing";

/** SimplePay may still be settling the payment when the customer returns. */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; payment: BookingPaymentResult }
  | { kind: "error"; message: string };

function formatAmount(amount: number, currency: string) {
  return currency === "HUF"
    ? formatHuf(amount)
    : new Intl.NumberFormat("hu-HU", { style: "currency", currency }).format(amount);
}

export default function PaymentResultRoute() {
  const [searchParams] = useSearchParams();
  const result = searchParams.get("r");
  const signature = searchParams.get("s");
  const [state, setState] = useState<LoadState>(
    result && signature ? { kind: "loading" } : { kind: "error", message: "Hiányzó fizetési azonosító." },
  );
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const trackedPaymentRef = useRef<string | null>(null);

  // The paid booking itself reaches GA4 from the server (purchase); this
  // records what the customer saw on returning from SimplePay.
  function trackSettledPayment(payment: BookingPaymentResult) {
    if ((payment.status !== "succeeded" && payment.status !== "failed") || trackedPaymentRef.current === payment.reference) {
      return;
    }

    trackedPaymentRef.current = payment.reference;
    trackEvent("payment_result", {
      entity: { type: "booking", id: payment.bookingId },
      metadata: {
        payment_status: payment.status,
        payment_kind: payment.kind,
        value: payment.amount,
        currency: payment.currency,
      },
    });
  }

  useEffect(() => {
    if (!result || !signature) {
      return;
    }

    const returnResult = result;
    const returnSignature = signature;
    let cancelled = false;
    let timer: number | undefined;

    async function load(poll: number, reference: string | null) {
      try {
        const payment = reference
          ? await fetchBookingPayment(reference)
          : await fetchReturnedBookingPayment(returnResult, returnSignature);
        if (cancelled) {
          return;
        }

        setState({ kind: "loaded", payment });
        trackSettledPayment(payment);

        if ((payment.status === "started" || payment.status === "pending") && poll < MAX_POLLS) {
          timer = window.setTimeout(() => load(poll + 1, payment.reference), POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            kind: "error",
            message:
              error instanceof BookingApiError && error.status === 404
                ? "A fizetés nem található."
                : "A fizetés állapota most nem kérdezhető le, kérjük, frissítsd az oldalt később.",
          });
        }
      }
    }

    load(1, null);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [result, signature]);

  async function handleRetry() {
    if (state.kind !== "loaded") {
      return;
    }

    setRetrying(true);
    setRetryError(null);

    try {
      window.location.assign(await retryBookingPayment(state.payment.reference));
    } catch (error) {
      setRetrying(false);
      setRetryError(
        error instanceof BookingApiError ? error.message : "A fizetés indítása most nem sikerült.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7fff5,transparent_28%),linear-gradient(180deg,#f8fcff_0%,#eef6fb_100%)]">
      <Seo title="Fizetés eredménye" description="Az online fizetés eredménye." canonicalPath="/fizetes/eredmeny" noIndex />

      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 md:px-12">
        <div className="w-full rounded-[40px] border border-[#dce7ef] bg-white p-8 text-center shadow-[0_26px_90px_rgba(15,23,42,0.08)] md:p-14">
          <PaymentResultBody state={state} />

          {retryError ? <p className="mt-4 text-sm font-medium text-rose-600">{retryError}</p> : null}

          <div className="mt-8 flex justify-center">
            <SimplePayLogo />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {state.kind === "loaded" && state.payment.canRetry ? (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-6 py-3 font-semibold text-white disabled:opacity-60"
              >
                <RotateCcw className="size-4" />
                {retrying ? "Átirányítás..." : "Fizetés újrapróbálása"}
              </button>
            ) : null}
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-6 py-3 font-semibold text-[#0f172a]"
            >
              <Home className="size-4" />
              Főoldal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionId({ id }: { id: string | null }) {
  return id ? <span className="mt-3 block font-semibold">SimplePay tranzakcióazonosító: {id}</span> : null;
}

function PaymentResultBody({ state }: { state: LoadState }) {
  if (state.kind === "loading") {
    return (
      <ResultHeading icon={<CreditCard className="size-8" />} tone="neutral" title="Fizetés ellenőrzése...">
        Egy pillanat, lekérdezzük a fizetés állapotát.
      </ResultHeading>
    );
  }

  if (state.kind === "error") {
    return (
      <ResultHeading icon={<X className="size-8" />} tone="danger" title="Hiba történt">
        {state.message}
      </ResultHeading>
    );
  }

  const { payment } = state;
  const amount = formatAmount(payment.amount, payment.currency);
  const subject = payment.kind === "deposit" ? "Az előleg" : "A részvételi díj";
  // The booking number is for the office only; customers never see it.
  const yourBooking = payment.tourName ? `a(z) „${payment.tourName}” foglalásod` : "a foglalásod";
  const YourBooking = `${yourBooking.charAt(0).toUpperCase()}${yourBooking.slice(1)}`;

  if (payment.status === "succeeded") {
    return (
      <ResultHeading icon={<Check className="size-8" />} tone="success" title="Sikeres fizetés!">
        {subject} ({amount}) kifizetése sikerült {yourBooking}hoz. A foglalás részleteit e-mailben is elküldtük, kérjük, nézd meg a postafiókodat (ha nem találod, a Spam vagy Promóciók mappát is). Munkatársunk hamarosan felveszi veled a kapcsolatot a visszaigazolás érdekében.
        <TransactionId id={payment.transactionId} />
      </ResultHeading>
    );
  }

  const nextStep = payment.canRetry
    ? " Újrapróbálhatod most, vagy munkatársunk felveszi veled a kapcsolatot."
    : " Munkatársunk hamarosan felveszi veled a kapcsolatot.";

  // SimplePay's rule: no payment was attempted here, so this may not read as
  // a failed payment and may not show a transaction id.
  if (payment.failure === "cancelled" || payment.failure === "timeout") {
    return (
      <ResultHeading
        icon={<Clock className="size-8" />}
        tone="neutral"
        title={payment.failure === "cancelled" ? "Megszakított fizetés" : "Időtúllépés"}
      >
        {payment.failure === "cancelled"
          ? "Megszakítottad a fizetést, ezért nem történt terhelés."
          : "Túllépted a tranzakció elindításának lehetséges maximális idejét, ezért nem történt terhelés."}{" "}
        {YourBooking}at rögzítettük.
        {nextStep}
      </ResultHeading>
    );
  }

  if (payment.status === "failed") {
    return (
      <ResultHeading icon={<X className="size-8" />} tone="danger" title="Sikertelen tranzakció">
        {YourBooking}at rögzítettük, de a fizetés ({amount}) nem sikerült. Kérjük, ellenőrizd a tranzakció során megadott adatok helyességét. Ha minden adatot helyesen adtál meg, a visszautasítás okának kivizsgálása érdekében lépj kapcsolatba a kártyakibocsátó bankoddal.
        {nextStep}
        <TransactionId id={payment.transactionId} />
      </ResultHeading>
    );
  }

  return (
    <ResultHeading icon={<Clock className="size-8" />} tone="neutral" title="A fizetés feldolgozás alatt">
      {YourBooking}hoz tartozó fizetés ({amount}) még folyamatban van. Sikeres fizetés esetén automatikusan jóváírjuk, később frissítve ezt az oldalt is ellenőrizheted.
    </ResultHeading>
  );
}
