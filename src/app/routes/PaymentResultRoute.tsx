import { useEffect, useState } from "react";
import { Check, Clock, CreditCard, Home, RotateCcw, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import BarionPaymentBanner from "../components/BarionPaymentBanner";
import Seo from "../seo/Seo";
import {
  BookingApiError,
  fetchBookingPayment,
  retryBookingPayment,
  type BookingPaymentResult,
} from "../booking/bookings-api";
import { formatHuf } from "../booking/booking-pricing";

/** Barion may still be settling the payment when the customer returns. */
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
  const paymentId = searchParams.get("paymentId");
  const [state, setState] = useState<LoadState>(
    paymentId ? { kind: "loading" } : { kind: "error", message: "Hiányzó fizetési azonosító." },
  );
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    async function load(poll: number) {
      try {
        const payment = await fetchBookingPayment(paymentId as string);
        if (cancelled) {
          return;
        }

        setState({ kind: "loaded", payment });

        if ((payment.status === "started" || payment.status === "pending") && poll < MAX_POLLS) {
          timer = window.setTimeout(() => load(poll + 1), POLL_INTERVAL_MS);
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

    load(1);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [paymentId]);

  async function handleRetry() {
    if (!paymentId) {
      return;
    }

    setRetrying(true);
    setRetryError(null);

    try {
      window.location.assign(await retryBookingPayment(paymentId));
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
            <BarionPaymentBanner variant="light" />
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
  const booking = `#${payment.bookingId}${payment.tourName ? ` – ${payment.tourName}` : ""}`;

  if (payment.status === "succeeded") {
    return (
      <ResultHeading icon={<Check className="size-8" />} tone="success" title="Sikeres fizetés!">
        {subject} ({amount}) kifizetése sikerült a(z) {booking} foglaláshoz. A foglalás részleteit e-mailben is elküldtük, kérjük, nézd meg a postafiókodat (ha nem találod, a Spam vagy Promóciók mappát is). Munkatársunk hamarosan felveszi veled a kapcsolatot a visszaigazolás érdekében.
      </ResultHeading>
    );
  }

  if (payment.status === "failed") {
    return (
      <ResultHeading icon={<X className="size-8" />} tone="danger" title="A fizetés nem sikerült">
        A(z) {booking} foglalásodat rögzítettük, de a fizetés ({amount}) megszakadt vagy elutasították.
        {payment.canRetry
          ? " Újrapróbálhatod most, vagy munkatársunk felveszi veled a kapcsolatot."
          : " Munkatársunk hamarosan felveszi veled a kapcsolatot."}
      </ResultHeading>
    );
  }

  return (
    <ResultHeading icon={<Clock className="size-8" />} tone="neutral" title="A fizetés feldolgozás alatt">
      A(z) {booking} foglaláshoz tartozó fizetés ({amount}) még folyamatban van. Sikeres fizetés esetén automatikusan jóváírjuk, később frissítve ezt az oldalt is ellenőrizheted.
    </ResultHeading>
  );
}

const TONE_CLASSES = {
  success: "bg-[#e8fff6] text-[#00a878]",
  danger: "bg-rose-50 text-rose-600",
  neutral: "bg-sky-50 text-sky-600",
} as const;

function ResultHeading({
  icon,
  tone,
  title,
  children,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE_CLASSES;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
        {icon}
      </div>
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#0f172a] md:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#475569]">{children}</p>
    </>
  );
}
