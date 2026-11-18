import { type ReactNode, useEffect, useRef } from "react";
import { Check, CreditCard, Flame, Mail, Minus, Plus, ShieldCheck } from "lucide-react";

import SimplePayLogo from "../components/SimplePayLogo";
import { useInView } from "../hooks/useInView";
import { bringIntoView } from "../lib/bringIntoView";
import { transportLabel } from "../lib/transport";
import BookingFieldInput from "./BookingFieldInput";
import BookingLevelExtras from "./BookingLevelExtras";
import { BookingSubmitBar, BookingSummaryPanel } from "./BookingPriceSummary";
import { BookingTermsConsent, NewsletterConsent, PaymentDataTransferConsent } from "./BookingConsents";
import DeparturePlaceSelect from "./DeparturePlaceSelect";
import PassengerOptionsList from "./PassengerOptionsList";
import { tripStepExtras } from "./booking-pricing";
import type { BookingFormField } from "./booking-form-fields";
import { INSURANCE_PATH } from "./insurance";
import { type BookingDateOption, type BookingTrip, type TourBookingForm } from "./useTourBookingForm";

const COUPON_FIELD: BookingFormField = {
  key: "coupon_code",
  label: "Kuponkód (opcionális)",
  fieldType: "text",
  inputGroup: "extra",
  options: null,
  description: null,
  priceLabel: null,
  visibility: "optional",
};

type BookingSectionProps = {
  /** The form's state, kept by the trip page so its sidebar can show the summary (see BookingSidebarSummary). */
  booking: TourBookingForm;
  trip: BookingTrip;
  /** Lets the date be changed in the form; without it the date is only shown in the summary. */
  datePicker?: ReactNode;
};

/**
 * The tour booking form on one page, without steps: trip, supplements and
 * insurance (apart), passengers and contact details one under the other. Below the trip page's
 * sidebar breakpoint (xl) the live price and the button stick to the bottom
 * of the screen; from xl the sidebar shows them instead.
 */
export default function BookingSection({ booking, trip, datePicker }: BookingSectionProps) {
  if (booking.completed) {
    return <BookingConfirmation redirecting={booking.status === "redirecting"} email={booking.formValues.contact_email} />;
  }

  const bookingExtras = tripStepExtras(booking.extras);
  const hasSupplements = bookingExtras.length > 0 || booking.cardExtras.length > 0;
  const hasInsurances = booking.travelInsuranceAvailable || booking.cancellationInsuranceAvailable;
  // Supplements and insurance come right after the trip; the passengers' details after them.
  const sectionAfterOptions = hasSupplements || hasInsurances ? 3 : 2;

  return (
    <section
      id="foglalas"
      ref={booking.formRef}
      onFocusCapture={booking.trackFieldFocus}
      data-clarity-mask="true"
      className="@container scroll-mt-[92px] rounded-[30px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] md:p-8"
    >
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e6faf3] px-3 py-1.5 text-xs font-bold text-[#00865f]">
        <ShieldCheck className="h-4 w-4" />
        Biztonságos online foglalás
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-[#0f172a] md:text-4xl">Foglalás</h2>
      <p className="mt-1 text-gray-500">Töltsd ki, és a végén egyben elküldöd.</p>

      {booking.urgency ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ff7a45]/30 bg-[#ff7a45]/10 p-4 text-sm text-[#0f172a]">
          <Flame className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5a3c]" />
          <p>
            <span className="font-bold">{booking.urgency.title}</span> {booking.urgency.text}
            {booking.appliedLastSeatsPercent ? " Más kedvezménnyel és kuponnal nem vonható össze." : null}
          </p>
        </div>
      ) : null}

      <FormSection number={1} title="Utazás" onReach={booking.reachSection}>
        {datePicker ? (
          <div className="mb-5">
            <div className="mb-2 text-sm font-bold text-[#0f172a]">Időpont</div>
            {datePicker}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PassengerCountField booking={booking} />
          {booking.departurePlaces.length > 0 ? (
            <DeparturePlaceSelect
              places={booking.departurePlaces}
              value={booking.departurePlaceId}
              onChange={booking.changeDeparturePlace}
              error={booking.departurePlaceError}
            />
          ) : null}
        </div>
      </FormSection>

      {hasSupplements || hasInsurances ? (
        <FormSection number={2} title="Felárak és biztosítás" onReach={booking.reachSection}>
          <div className="space-y-6">
            {hasSupplements ? (
              <OptionGroup title="Felárak">
                <BookingLevelExtras
                  extras={bookingExtras}
                  passengers={booking.passengerCount}
                  selectedIds={booking.selectedExtraIds}
                  onToggle={booking.toggleExtra}
                  choices={booking.extraChoices}
                  onChoiceChange={booking.changeExtraChoice}
                  choiceError={booking.extraChoiceError}
                />
                <PassengerOptionsList {...passengerOptionsProps(booking)} insurances={null} />
              </OptionGroup>
            ) : null}

            {hasInsurances ? (
              <OptionGroup title="Biztosítás" note="külön számlázzuk">
                <PassengerOptionsList {...passengerOptionsProps(booking)} extras={[]} />
                <p className="text-sm text-gray-500">
                  A biztosítások szolgáltatásait, díjait és feltételeit a{" "}
                  <a href={INSURANCE_PATH} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
                    Biztosítások
                  </a>{" "}
                  oldalon találod.
                </p>
              </OptionGroup>
            ) : null}
          </div>
        </FormSection>
      ) : null}

      <FormSection number={sectionAfterOptions} title="Utasok" hint="a név a személyi igazolvány szerint" onReach={booking.reachSection}>
        <PassengerFields booking={booking} />
      </FormSection>

      <FormSection number={sectionAfterOptions + 1} title="Elérhetőség és véglegesítés" onReach={booking.reachSection}>
        <ContactAndFinalFields booking={booking} couponable={Boolean(trip.couponable)} />
      </FormSection>

      <BookingSubmitBar {...summaryProps(booking)} className="-mx-5 -mb-5 xl:hidden md:-mx-8 md:-mb-8" />
    </section>
  );
}

/** A titled block of option rows inside a form section, e.g. the supplements apart from the insurance. */
function OptionGroup({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h4 className="text-base font-extrabold text-[#0f172a]">{title}</h4>
        {note ? <span className="text-sm text-gray-400">{note}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** What both option lists share; the supplements list leaves out the insurances and the other way round. */
function passengerOptionsProps(booking: TourBookingForm) {
  return {
    passengerNames: passengerNames(booking),
    extras: booking.cardExtras,
    options: booking.passengerOptions,
    onChange: booking.changePassengerOptions,
    choiceErrors: booking.passengerChoiceErrors,
    insurances: booking.insurances,
    travelInsuranceAvailable: booking.travelInsuranceAvailable,
    cancellationInsuranceAvailable: booking.cancellationInsuranceAvailable,
    travelDays: booking.travelDays,
    passengerShares: booking.priceEstimate.passengerShares,
  };
}

/** The booking's summary panel for the trip page's sidebar, shown there while the form is on screen and not yet sent. */
export function BookingSidebarSummary({
  booking,
  trip,
  selectedDate,
}: {
  booking: TourBookingForm;
  trip: BookingTrip;
  selectedDate: BookingDateOption;
}) {
  const departurePlace = booking.departurePlaces.find((place) => String(place.id) === booking.departurePlaceId);
  const facts = [
    selectedDate.label,
    transportLabel(trip.transport),
    trip.hotel,
    departurePlace?.name,
    `${booking.passengerCount} fő`,
  ].filter((fact): fact is string => typeof fact === "string" && fact.trim() !== "");

  return <BookingSummaryPanel title={trip.title} facts={facts} {...summaryProps(booking)} />;
}

function summaryProps(booking: TourBookingForm) {
  return {
    estimate: booking.priceEstimate,
    displayedTotal: booking.displayedTotal,
    deposit: booking.onlineDeposit,
    onlinePayment: booking.onlinePayment !== null,
    submitting: booking.status === "submitting",
    onSubmit: booking.submit,
  };
}

function FormSection({
  number,
  title,
  hint,
  onReach,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  /** Reports the section once it scrolls into view, so the funnel shows how far visitors get. */
  onReach: (step: number, stepName: string) => void;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (inView) {
      onReach(number, title);
    }
  }, [inView, onReach, number, title]);

  return (
    <div ref={ref} className="mt-6 border-t border-gray-100 pt-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6faf3] text-sm font-extrabold text-[#00a878]">
          {number}
        </span>
        <h3 className="text-xl font-extrabold text-[#0f172a]">{title}</h3>
        {hint ? <span className="text-sm text-gray-400 md:ml-auto">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/**
 * The head count, asked first so the price and the supplements (a single room)
 * follow it; held to the free seats when the date has only a few left.
 */
function PassengerCountField({ booking }: { booking: TourBookingForm }) {
  const { passengerCount: count, maxPassengers, seatsLeftNote, passengerCountError: error } = booking;
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#0f172a] transition-colors hover:bg-[#e6faf3] disabled:opacity-40";

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-[#0f172a]">Utasok száma</legend>
      <div
        className={`flex h-14 items-center justify-between rounded-2xl border bg-white px-3 ${error ? "border-red-300" : "border-gray-200"}`}
      >
        <button
          type="button"
          aria-label="Eggyel kevesebb utas"
          disabled={count <= 1}
          onClick={() => booking.changePassengerCount(count - 1)}
          className={buttonClass}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-lg font-bold text-[#0f172a]" aria-live="polite">
          {count} fő
        </span>
        <button
          type="button"
          aria-label="Eggyel több utas"
          disabled={count >= maxPassengers}
          onClick={() => booking.changePassengerCount(count + 1)}
          className={buttonClass}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <span data-booking-error className="mt-1.5 block text-sm font-medium text-red-500">
          {error}
        </span>
      ) : seatsLeftNote ? (
        <span className="mt-1.5 block text-sm font-semibold text-[#00865f]">{seatsLeftNote}</span>
      ) : null}
    </fieldset>
  );
}

function PassengerFields({ booking }: { booking: TourBookingForm }) {
  return (
    <div className="space-y-5">
      {booking.passengers.map((passenger, index) => (
        <div key={index}>
          <div className="mb-2 text-sm font-extrabold text-gray-400">{index + 1}. utas</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {booking.passengerFields.map((field) => (
              <BookingFieldInput
                key={field.key}
                field={field}
                value={passenger[field.key] ?? ""}
                onChange={(value) => booking.setPassengerValue(index, field.key, value)}
                onBlur={() => booking.checkPassengerValue(index, field)}
                error={booking.fieldErrors.passengers[index]?.[field.key]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The passengers' names as typed so far, for picking who a supplement is for. */
function passengerNames(booking: TourBookingForm): string[] {
  const nameKey = booking.passengerFields.find((field) => field.key.endsWith("name"))?.key;

  return booking.passengers.map((passenger, index) => (nameKey && passenger[nameKey]?.trim()) || `${index + 1}. utas`);
}

function ContactAndFinalFields({ booking, couponable }: { booking: TourBookingForm; couponable: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {booking.contactFields.map((field) => (
          <BookingFieldInput
            key={field.key}
            field={field}
            value={booking.formValues[field.key] ?? ""}
            onChange={(value) => booking.setFormValue(field.key, value)}
            onBlur={() => booking.checkFormValue(field)}
            error={booking.fieldErrors.form[field.key]}
          />
        ))}
      </div>

      {booking.extraFields.map((field) => (
        <BookingFieldInput
          key={field.key}
          field={field}
          value={booking.formValues[field.key] ?? ""}
          onChange={(value) => booking.setFormValue(field.key, value)}
          onBlur={() => booking.checkFormValue(field)}
          error={booking.fieldErrors.form[field.key]}
        />
      ))}

      {couponable ? (
        <div className="max-w-sm">
          <BookingFieldInput field={COUPON_FIELD} value={booking.couponCode} onChange={booking.setCouponCode} />
          <p className="mt-2 text-xs text-gray-500">
            A kupon értékét a foglalás beküldésekor vonjuk le a végösszegből. Ha foglaláskor nem adod meg a kuponkódodat,
            utólag sajnos nem tudjuk érvényesíteni.
          </p>
          {booking.lastSeatsDiscountDropped ? (
            <p className="mt-2 text-xs font-semibold text-[#b45309]">
              Kuponnal az utolsó helyek kedvezménye ({booking.lastSeatsDiscountPercent}%) nem jár, a kettő nem vonható össze.
            </p>
          ) : null}
        </div>
      ) : null}

      <BookingTermsConsent checked={booking.termsAccepted} error={booking.termsError} onChange={booking.acceptTerms} />

      {booking.onlinePayment ? (
        <PaymentDataTransferConsent
          checked={booking.dataTransferAccepted}
          error={booking.dataTransferError}
          onChange={booking.acceptDataTransfer}
        />
      ) : null}

      <NewsletterConsent checked={booking.newsletterSubscribe} onChange={booking.setNewsletterSubscribe} />

      {booking.onlinePayment ? <SimplePayLogo className="xl:hidden" /> : null}

      <p className="rounded-2xl bg-[#f5f9fc] p-4 text-sm text-gray-600">
        Indulás előtt kb. 1 héttel írásos értesítőt (levélben vagy e-mailben) küldünk az indulással kapcsolatos
        információkról, telefonszámokkal.
      </p>

      {booking.errorMessage ? (
        <div data-booking-error tabIndex={-1} className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 outline-none">
          {booking.errorMessage}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Replaces the form once the booking is in: a much shorter box, brought to the
 * middle of the screen with focus on it so it does not end up off screen.
 */
function BookingConfirmation({ redirecting, email }: { redirecting: boolean; email?: string }) {
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmationRef.current) {
      bringIntoView(confirmationRef.current);
    }
  }, []);

  return (
    <section id="foglalas" data-clarity-mask="true" className="scroll-mt-[92px]">
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="rounded-[40px] bg-[#07111f] p-8 text-center shadow-[0_30px_80px_rgba(0,195,137,0.25)] outline-none ring-4 ring-[#00c389]/40 animate-in fade-in zoom-in-95 duration-500 md:p-12"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00c389]/15 text-[#00c389]">
          {redirecting ? <CreditCard className="h-8 w-8" /> : <Check className="h-8 w-8" />}
        </div>
        <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
          {redirecting ? "Foglalásodat rögzítettük!" : "Köszönjük a foglalást!"}
        </h2>
        <p className="mx-auto max-w-xl text-lg text-white/65">
          {redirecting
            ? "Átirányítunk a SimplePay biztonságos fizetőoldalára…"
            : "Foglalásodat rögzítettük. A visszaigazolásban megtalálod a fizetéssel kapcsolatos tudnivalókat és az utazási könyvet."}
        </p>
        <ConfirmationEmailNote email={email} />
        {redirecting ? (
          <div className="mt-6 flex justify-center">
            <SimplePayLogo />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Points the customer to the booking confirmation e-mail sent right after booking. */
function ConfirmationEmailNote({ email }: { email?: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#00c389]" />
      <p className="text-white/80">
        A foglalás részleteit e-mailben is elküldtük
        {email ? (
          <>
            {" "}a(z) <span className="break-all font-bold text-white">{email}</span> címre
          </>
        ) : null}
        . Kérjük, nézd meg a postafiókodat, és ha nem találod a levelet, a Spam vagy Promóciók mappát is.
      </p>
    </div>
  );
}
