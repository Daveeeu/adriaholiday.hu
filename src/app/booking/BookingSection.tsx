import { type ReactNode, useEffect, useRef } from "react";
import { Check, CreditCard, Mail, Minus, Plus, ShieldCheck } from "lucide-react";

import type { PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import SimplePayLogo from "../components/SimplePayLogo";
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
import {
  MAX_PASSENGERS,
  useTourBookingForm,
  type BookingDateOption,
  type BookingTrip,
  type TourBookingForm,
} from "./useTourBookingForm";

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
  selectedDate: BookingDateOption;
  trip: BookingTrip;
  priceBox: PortfolioPriceBox | null;
  /** Lets the date be changed in the form; without it the date is only shown in the summary. */
  datePicker?: ReactNode;
};

/**
 * The tour booking form on one page, without steps: trip, passengers,
 * supplements and contact details one under the other. Next to it on wide
 * screens, and stuck to the bottom of the screen on narrow ones, the live
 * price with the booking button.
 */
export default function BookingSection({ selectedDate, trip, priceBox, datePicker }: BookingSectionProps) {
  const booking = useTourBookingForm({ trip, selectedDate, priceBox });

  if (booking.status === "redirecting" || booking.status === "success") {
    return <BookingConfirmation redirecting={booking.status === "redirecting"} email={booking.formValues.contact_email} />;
  }

  const bookingExtras = tripStepExtras(booking.extras);
  const hasExtras =
    bookingExtras.length > 0 ||
    booking.cardExtras.length > 0 ||
    booking.travelInsuranceAvailable ||
    booking.cancellationInsuranceAvailable;
  const departurePlace = booking.departurePlaces.find((place) => String(place.id) === booking.departurePlaceId);
  const summary = {
    estimate: booking.priceEstimate,
    displayedTotal: booking.displayedTotal,
    deposit: booking.onlineDeposit,
    onlinePayment: booking.onlinePayment !== null,
    submitting: booking.status === "submitting",
    onSubmit: booking.submit,
  };
  const facts = [
    selectedDate.label,
    transportLabel(trip.transport),
    trip.hotel,
    departurePlace?.name,
    `${booking.passengerCount} fő`,
  ].filter((fact): fact is string => typeof fact === "string" && fact.trim() !== "");

  return (
    <section id="foglalas" data-clarity-mask="true" className="@container/booking scroll-mt-[92px]">
      <div className="grid gap-6 @3xl/booking:grid-cols-[minmax(0,1fr)_320px] @3xl/booking:items-start">
        <div
          ref={booking.formRef}
          onFocusCapture={booking.trackFieldFocus}
          className="@container rounded-[30px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] md:p-8"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e6faf3] px-3 py-1.5 text-xs font-bold text-[#00865f]">
            <ShieldCheck className="h-4 w-4" />
            Biztonságos online foglalás
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0f172a] md:text-4xl">Foglalás</h2>
          <p className="mt-1 text-gray-500">Töltsd ki, és a végén egyben elküldöd.</p>

          <FormSection number={1} title="Utazás">
            {datePicker ? (
              <div className="mb-5">
                <div className="mb-2 text-sm font-bold text-[#0f172a]">Időpont</div>
                {datePicker}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PassengerCountField count={booking.passengerCount} onChange={booking.changePassengerCount} />
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

          <FormSection number={2} title="Utasok" hint="a név a személyi igazolvány szerint">
            <PassengerFields booking={booking} />
          </FormSection>

          {hasExtras ? (
            <FormSection number={3} title="Felárak és biztosítás">
              <div className="space-y-4">
                <BookingLevelExtras
                  extras={bookingExtras}
                  passengers={booking.passengerCount}
                  selectedIds={booking.selectedExtraIds}
                  onToggle={booking.toggleExtra}
                  choices={booking.extraChoices}
                  onChoiceChange={booking.changeExtraChoice}
                  choiceError={booking.extraChoiceError}
                />
                <PassengerOptionsList
                  passengerNames={passengerNames(booking)}
                  extras={booking.cardExtras}
                  options={booking.passengerOptions}
                  onChange={booking.changePassengerOptions}
                  choiceErrors={booking.passengerChoiceErrors}
                  insurances={booking.insurances}
                  travelInsuranceAvailable={booking.travelInsuranceAvailable}
                  cancellationInsuranceAvailable={booking.cancellationInsuranceAvailable}
                  travelDays={booking.travelDays}
                  passengerShares={booking.priceEstimate.passengerShares}
                />
                {booking.travelInsuranceAvailable || booking.cancellationInsuranceAvailable ? (
                  <p className="text-sm text-gray-500">
                    A biztosítások szolgáltatásait, díjait és feltételeit a{" "}
                    <a href={INSURANCE_PATH} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
                      Biztosítások
                    </a>{" "}
                    oldalon találod.
                  </p>
                ) : null}
              </div>
            </FormSection>
          ) : null}

          <FormSection number={hasExtras ? 4 : 3} title="Elérhetőség és véglegesítés">
            <ContactAndFinalFields booking={booking} couponable={Boolean(trip.couponable)} />
          </FormSection>

          <BookingSubmitBar {...summary} className="-mx-5 -mb-5 @3xl/booking:hidden md:-mx-8 md:-mb-8" />
        </div>

        <aside className="sticky top-[155px] hidden @3xl/booking:block">
          <BookingSummaryPanel title={trip.title} facts={facts} {...summary} />
        </aside>
      </div>
    </section>
  );
}

function FormSection({ number, title, hint, children }: { number: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
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

/** The head count, asked first so the price and the supplements (a single room) follow it. */
function PassengerCountField({ count, onChange }: { count: number; onChange: (count: number) => void }) {
  const buttonClass =
    "flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#0f172a] transition-colors hover:bg-[#e6faf3] disabled:opacity-40";

  return (
    <div>
      <div className="mb-2 text-sm font-bold text-[#0f172a]">Utasok száma</div>
      <div className="flex h-14 items-center justify-between rounded-2xl border border-gray-200 bg-white px-3">
        <button type="button" aria-label="Eggyel kevesebb utas" disabled={count <= 1} onClick={() => onChange(count - 1)} className={buttonClass}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-lg font-bold text-[#0f172a]" aria-live="polite">
          {count} fő
        </span>
        <button
          type="button"
          aria-label="Eggyel több utas"
          disabled={count >= MAX_PASSENGERS}
          onClick={() => onChange(count + 1)}
          className={buttonClass}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
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

      {booking.onlinePayment ? <SimplePayLogo className="@3xl/booking:hidden" /> : null}

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
