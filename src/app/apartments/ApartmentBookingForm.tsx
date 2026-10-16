import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import BookingFieldInput from "../booking/BookingFieldInput";
import { BookingTermsConsent, NewsletterConsent } from "../booking/BookingConsents";
import { fieldError, fieldErrorsOf, todayDateString, type BookingFieldValues } from "../booking/booking-form-fields";
import { BookingValidationError, submitApartmentBooking } from "../booking/bookings-api";
import { TRIP_SECTION_HEADING } from "../lib/tripTypography";
import {
  apartmentTypeField,
  CONTACT_FIELDS,
  GUEST_FIELDS,
  MAX_GUESTS,
  MESSAGE_FIELD,
  stayField,
} from "./apartment-booking-fields";
import { formatDate, nightsBetween } from "./apartment-format";
import type { ApartmentStay } from "./apartment-search-params";
import type { ApartmentDetail } from "./apartments-api";

type Insurance = "yes" | "no" | "";

type FormErrors = Record<string, string>;

/** The API's field names (snake_case) as the form's. */
const SERVER_FIELDS: Record<string, string> = {
  customer_name: "contact_name",
  email: "contact_email",
  phone: "contact_phone",
  postal_code: "contact_postal_code",
  city: "contact_city",
  address: "contact_address",
  arrival: "arrival",
  departure: "departure",
  apartment_type: "apartment_type",
  terms_accepted: "terms",
  message: "message",
};

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[28px] border border-[#e7eef5] bg-white p-6 shadow-[0_12px_42px_rgba(15,23,42,0.05)] md:p-8">
      <legend className="sr-only">{title}</legend>
      <h3 className="mb-6 text-xl font-bold tracking-tight text-[#0f172a]">{title}</h3>
      {children}
    </fieldset>
  );
}

function InsuranceChoice({
  name,
  title,
  info,
  value,
  error,
  onChange,
}: {
  name: string;
  title: string;
  info?: string | null;
  value: Insurance;
  error?: string;
  onChange: (value: Insurance) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-bold text-[#0f172a]">{title}*</div>
      {info ? <p className="mb-3 text-sm text-gray-500">{info}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {(["yes", "no"] as const).map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all hover:border-[#00c389]/40 hover:bg-[#00c389]/5 ${
              error ? "border-red-300" : "border-gray-200"
            }`}
          >
            <input type="radio" name={name} checked={value === option} onChange={() => onChange(option)} className="accent-[#00c389]" />
            <span className="font-semibold text-[#0f172a]">{option === "yes" ? "Kérem" : "Nem kérem"}</span>
          </label>
        ))}
      </div>
      {error ? <p data-booking-error className="mt-1.5 text-sm font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

/**
 * The booking request of an apartment, as the legacy site took it: the
 * customer, the stay and apartment type, every guest, the insurances asked
 * for and a note. The office confirms it with the price and the deposit
 * invoice.
 */
export default function ApartmentBookingForm({ apartment, stay }: { apartment: ApartmentDetail; stay: ApartmentStay }) {
  const typeField = apartment.apartmentTypes.length > 0 ? apartmentTypeField(apartment.apartmentTypes) : null;
  const [contact, setContact] = useState<BookingFieldValues>({});
  const [stayValues, setStayValues] = useState<BookingFieldValues>({
    arrival: stay.arrival,
    departure: stay.departure,
    apartment_type: apartment.apartmentTypes.length === 1 ? apartment.apartmentTypes[0] : "",
    message: "",
  });
  const [guests, setGuests] = useState<BookingFieldValues[]>(() =>
    Array.from({ length: Math.min(stay.guests ?? 2, MAX_GUESTS) }, () => ({})),
  );
  const [travelInsurance, setTravelInsurance] = useState<Insurance>("");
  const [cancellationInsurance, setCancellationInsurance] = useState<Insurance>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletterSubscribe, setNewsletterSubscribe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<number | string | null>(null);

  const nights = nightsBetween(stayValues.arrival ?? "", stayValues.departure ?? "");

  function setGuestCount(count: number) {
    const next = Math.max(1, Math.min(MAX_GUESTS, count));

    setGuests((current) => (next > current.length ? [...current, ...Array.from({ length: next - current.length }, () => ({}))] : current.slice(0, next)));
  }

  function validate(): FormErrors {
    const found: FormErrors = { ...fieldErrorsOf(CONTACT_FIELDS, contact) };
    const today = todayDateString();

    for (const key of ["arrival", "departure"] as const) {
      const error = fieldError(stayField(key), stayValues[key]);

      if (error) {
        found[key] = error;
      }
    }

    if (!found.arrival && (stayValues.arrival ?? "") < today) {
      found.arrival = "Az érkezés nem lehet a múltban.";
    }

    if (!found.arrival && !found.departure && nights === null) {
      found.departure = "A távozás az érkezés utáni nap vagy későbbi legyen.";
    }

    if (typeField) {
      const error = fieldError(typeField, stayValues.apartment_type);

      if (error) {
        found.apartment_type = error;
      }
    }

    guests.forEach((guest, index) => {
      Object.entries(fieldErrorsOf(GUEST_FIELDS, guest)).forEach(([key, error]) => {
        found[`guest.${index}.${key}`] = error;
      });
    });

    if (!travelInsurance) {
      found.travel_insurance = "Válaszd ki, kérsz-e utasbiztosítást.";
    }

    if (!cancellationInsurance) {
      found.cancellation_insurance = "Válaszd ki, kérsz-e útlemondási biztosítást.";
    }

    if (!termsAccepted) {
      found.terms = "A foglaláshoz el kell fogadnod a feltételeket.";
    }

    return found;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => document.querySelector("[data-booking-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }));

      return;
    }

    setSubmitting(true);

    try {
      const response = await submitApartmentBooking(apartment.slug, {
        customerName: contact.contact_name ?? "",
        email: contact.contact_email ?? "",
        phone: contact.contact_phone || undefined,
        postalCode: contact.contact_postal_code || undefined,
        city: contact.contact_city || undefined,
        address: contact.contact_address || undefined,
        arrival: stayValues.arrival ?? "",
        departure: stayValues.departure ?? "",
        apartmentType: stayValues.apartment_type || undefined,
        passengers: guests.map((guest) => ({
          name: guest.passenger_name ?? "",
          birthDate: guest.passenger_birth_date ?? "",
          address: guest.passenger_address || undefined,
          documentNumber: guest.passenger_document_number || undefined,
        })),
        travelInsurance: travelInsurance === "yes",
        cancellationInsurance: cancellationInsurance === "yes",
        message: stayValues.message || undefined,
        termsAccepted,
        newsletterSubscribe,
      });

      setBookingId(response.id);
      document.getElementById("foglalas")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (error instanceof BookingValidationError) {
        const mapped: FormErrors = {};

        Object.entries(error.errors).forEach(([key, messages]) => {
          const guest = /^passengers\.(\d+)\.(name|birth_date)$/.exec(key);
          const formKey = guest ? `guest.${guest[1]}.passenger_${guest[2]}` : SERVER_FIELDS[key];

          if (formKey) {
            mapped[formKey] = messages[0];
          }
        });

        setErrors(mapped);
        setSubmitError(Object.keys(mapped).length > 0 ? "Kérjük, javítsd a megjelölt mezőket." : error.message);
      } else {
        setSubmitError("A foglalás elküldése nem sikerült. Kérjük, próbáld újra, vagy hívj minket telefonon.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (bookingId !== null) {
    return (
      <div className="rounded-[32px] border border-[#00c389]/20 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-12">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#00c389]" aria-hidden="true" />
        <h3 className="text-2xl font-bold tracking-tight text-[#0f172a]">Köszönjük, megkaptuk a foglalásodat!</h3>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Foglalási azonosító: <strong>#{bookingId}</strong>. A részleteket e-mailben is elküldtük. Kollégáink ellenőrzik az apartman
          szabad helyét, és visszaigazolják a foglalást a fizetés részleteivel és az előlegszámlával együtt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <h2 className={`${TRIP_SECTION_HEADING} mb-2`}>Foglalás</h2>
        <p className="text-base text-gray-500">
          Töltsd ki az űrlapot, és kollégáink visszaigazolják a foglalást a fizetési tudnivalókkal együtt.
        </p>
      </div>

      <Card title="Megrendelő">
        <div className="grid gap-5 md:grid-cols-2">
          {CONTACT_FIELDS.map((field) => (
            <BookingFieldInput
              key={field.key}
              field={field}
              value={contact[field.key] ?? ""}
              error={errors[field.key]}
              onChange={(value) => setContact((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>
      </Card>

      <Card title="Tartózkodás">
        <div className="grid gap-5 md:grid-cols-2">
          {(["arrival", "departure"] as const).map((key) => (
            <BookingFieldInput
              key={key}
              field={stayField(key)}
              value={stayValues[key] ?? ""}
              error={errors[key]}
              onChange={(value) => setStayValues((current) => ({ ...current, [key]: value }))}
            />
          ))}
          {typeField ? (
            <BookingFieldInput
              field={typeField}
              value={stayValues.apartment_type ?? ""}
              error={errors.apartment_type}
              onChange={(value) => setStayValues((current) => ({ ...current, apartment_type: value }))}
            />
          ) : null}
          <div>
            <span className="mb-2 block text-sm font-bold text-[#0f172a]">Személyek száma*</span>
            <div className="flex h-14 items-center justify-between rounded-2xl border border-gray-200 px-3">
              <button
                type="button"
                aria-label="Egy fővel kevesebb"
                onClick={() => setGuestCount(guests.length - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f9fc] text-[#0f172a] disabled:opacity-40"
                disabled={guests.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-[#0f172a]" aria-live="polite">
                {guests.length} fő
              </span>
              <button
                type="button"
                aria-label="Egy fővel több"
                onClick={() => setGuestCount(guests.length + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f9fc] text-[#0f172a] disabled:opacity-40"
                disabled={guests.length >= MAX_GUESTS}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {nights !== null ? (
          <p className="mt-4 text-sm text-gray-500">
            {formatDate(stayValues.arrival ?? "")} – {formatDate(stayValues.departure ?? "")}: {nights} éjszaka
          </p>
        ) : null}
      </Card>

      {guests.map((guest, index) => (
        <Card key={index} title={`${index + 1}. utas`}>
          <div className="grid gap-5 md:grid-cols-2">
            {GUEST_FIELDS.map((field) => (
              <BookingFieldInput
                key={field.key}
                field={field}
                value={guest[field.key] ?? ""}
                error={errors[`guest.${index}.${field.key}`]}
                onChange={(value) =>
                  setGuests((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field.key]: value } : item)))
                }
              />
            ))}
          </div>
        </Card>
      ))}

      <Card title="Biztosítás">
        <div className="space-y-6">
          <InsuranceChoice
            name="travel_insurance"
            title="Utasbiztosítás"
            info={apartment.bookingInsurances?.travelInsurance?.info}
            value={travelInsurance}
            error={errors.travel_insurance}
            onChange={setTravelInsurance}
          />
          <InsuranceChoice
            name="cancellation_insurance"
            title="Útlemondási biztosítás"
            info={apartment.bookingInsurances?.cancellationInsurance?.info}
            value={cancellationInsurance}
            error={errors.cancellation_insurance}
            onChange={setCancellationInsurance}
          />
        </div>
      </Card>

      <Card title="Egyéb">
        <div className="space-y-5">
          <BookingFieldInput
            field={MESSAGE_FIELD}
            value={stayValues.message ?? ""}
            error={errors.message}
            onChange={(value) => setStayValues((current) => ({ ...current, message: value }))}
          />
          <BookingTermsConsent checked={termsAccepted} error={errors.terms} onChange={setTermsAccepted} />
          <NewsletterConsent checked={newsletterSubscribe} onChange={setNewsletterSubscribe} />
          <p className="text-sm text-gray-500">A *-gal jelölt mezők kitöltése kötelező.</p>
        </div>
      </Card>

      {submitError ? (
        <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-8 text-lg font-semibold text-white shadow-[0_14px_44px_rgba(0,195,137,0.22)] transition-all hover:shadow-[0_18px_56px_rgba(0,195,137,0.28)] disabled:opacity-70 md:w-auto"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        Lefoglalom
      </button>
    </form>
  );
}
