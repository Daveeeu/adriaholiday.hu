import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, ClipboardList, Home, X } from "lucide-react";
import { Link, useParams } from "react-router";

import ResultHeading from "../components/ResultHeading";
import Seo from "../seo/Seo";
import BookingFieldInput from "../booking/BookingFieldInput";
import {
  fieldErrorsOf,
  initialValues,
  type BookingFieldErrors,
  type BookingFieldValues,
  type BookingFormField,
} from "../booking/booking-form-fields";
import {
  BookingApiError,
  BookingValidationError,
  completeBookingDetails,
  fetchPendingBookingDetails,
  type PendingBookingDetails,
} from "../booking/bookings-api";

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; details: PendingBookingDetails }
  | { kind: "completed" }
  | { kind: "error"; message: string };

type PassengerValues = Record<number, BookingFieldValues>;

/** Every detail asked here is required by now, so the fields are shown as required. */
function asRequired(fields: BookingFormField[]): BookingFormField[] {
  return fields.map((field) => ({ ...field, visibility: "required" }));
}

function prefixed(errors: BookingFieldErrors, prefix: string): BookingFieldErrors {
  return Object.fromEntries(Object.entries(errors).map(([key, message]) => [`${prefix}.${key}`, message]));
}

function formatDate(date: string): string {
  return `${date.replaceAll("-", ".")}.`;
}

/**
 * The page of the link e-mailed to a customer who left deferred booking
 * details empty: it asks only those details and saves them to the booking.
 */
export default function BookingDetailsRoute() {
  const { token = "" } = useParams();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [formData, setFormData] = useState<BookingFieldValues>({});
  const [passengers, setPassengers] = useState<PassengerValues>({});
  const [errors, setErrors] = useState<BookingFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPendingBookingDetails(token)
      .then((details) => {
        if (cancelled) {
          return;
        }

        setFormData(initialValues(details.formDataFields));
        setPassengers(
          Object.fromEntries(details.passengers.map((passenger) => [passenger.index, initialValues(passenger.fields)])),
        );
        setState({ kind: "loaded", details });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            kind: "error",
            message:
              error instanceof BookingApiError && error.status === 404
                ? "Ez a link már nem érvényes: az adatokat már megadtad, vagy újabb linket küldtünk. Ha kérdésed van, keress minket bizalommal."
                : "Az oldal most nem tölthető be, kérjük, próbáld újra később.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent, details: PendingBookingDetails) {
    event.preventDefault();

    const clientErrors = {
      ...prefixed(fieldErrorsOf(asRequired(details.formDataFields), formData), "formData"),
      ...Object.assign(
        {},
        ...details.passengers.map((passenger) =>
          prefixed(fieldErrorsOf(asRequired(passenger.fields), passengers[passenger.index] ?? {}), `passengers.${passenger.index}`),
        ),
      ),
    };

    setErrors(clientErrors);
    setSubmitError(null);

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await completeBookingDetails(token, { formData, passengers });
      setState({ kind: "completed" });
      window.scrollTo({ top: 0 });
    } catch (error) {
      if (error instanceof BookingValidationError) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])));
      } else {
        setSubmitError(
          error instanceof BookingApiError ? error.message : "A mentés most nem sikerült, kérjük, próbáld újra.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7fff5,transparent_28%),linear-gradient(180deg,#f8fcff_0%,#eef6fb_100%)]">
      <Seo title="Hiányzó adatok" description="A foglalásodhoz hiányzó adatok megadása." canonicalPath="/foglalas/adatok" noIndex />

      <div className="mx-auto max-w-3xl px-4 py-16 md:px-12">
        <div className="w-full rounded-[40px] border border-[#dce7ef] bg-white p-8 text-center shadow-[0_26px_90px_rgba(15,23,42,0.08)] md:p-14">
          {state.kind === "loading" ? (
            <ResultHeading icon={<ClipboardList className="size-8" />} tone="neutral" title="Betöltés...">
              Egy pillanat, betöltjük a foglalásodat.
            </ResultHeading>
          ) : null}

          {state.kind === "error" ? (
            <ResultHeading icon={<X className="size-8" />} tone="danger" title="A link nem érvényes">
              {state.message}
            </ResultHeading>
          ) : null}

          {state.kind === "completed" ? (
            <ResultHeading icon={<Check className="size-8" />} tone="success" title="Köszönjük!">
              Az adatokat megkaptuk és a foglalásodhoz rögzítettük. Munkatársunk szükség esetén felveszi veled a kapcsolatot.
            </ResultHeading>
          ) : null}

          {state.kind === "loaded" ? (
            <form noValidate onSubmit={(event) => handleSubmit(event, state.details)}>
              <ResultHeading icon={<ClipboardList className="size-8" />} tone="neutral" title="Hiányzó adatok">
                {state.details.customerName ? `Kedves ${state.details.customerName}! ` : ""}
                Kérjük, add meg az alábbi adatokat
                {state.details.tourName ? ` a(z) „${state.details.tourName}”` : " a"}
                {state.details.departureDate ? ` (${formatDate(state.details.departureDate)})` : ""} foglalásodhoz.
              </ResultHeading>

              <div className="mt-10 space-y-8 text-left">
                {state.details.formDataFields.length > 0 ? (
                  <FieldGroup title="Megrendelő">
                    {asRequired(state.details.formDataFields).map((field) => (
                      <BookingFieldInput
                        key={field.key}
                        field={field}
                        value={formData[field.key] ?? ""}
                        onChange={(value) => setFormData((current) => ({ ...current, [field.key]: value }))}
                        error={errors[`formData.${field.key}`]}
                      />
                    ))}
                  </FieldGroup>
                ) : null}

                {state.details.passengers.map((passenger) => (
                  <FieldGroup key={passenger.index} title={passenger.title}>
                    {asRequired(passenger.fields).map((field) => (
                      <BookingFieldInput
                        key={field.key}
                        field={field}
                        value={passengers[passenger.index]?.[field.key] ?? ""}
                        onChange={(value) =>
                          setPassengers((current) => ({
                            ...current,
                            [passenger.index]: { ...current[passenger.index], [field.key]: value },
                          }))
                        }
                        error={errors[`passengers.${passenger.index}.${field.key}`]}
                      />
                    ))}
                  </FieldGroup>
                ))}
              </div>

              {submitError ? <p className="mt-6 text-center text-sm font-medium text-rose-600">{submitError}</p> : null}

              <div className="mt-10 flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] px-8 py-4 font-semibold text-white disabled:opacity-60"
                >
                  <Check className="size-4" />
                  {submitting ? "Mentés..." : "Adatok elküldése"}
                </button>
              </div>
            </form>
          ) : null}

          {state.kind !== "loaded" && state.kind !== "loading" ? (
            <div className="mt-10 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e7f0] bg-white px-6 py-3 font-semibold text-[#0f172a]"
              >
                <Home className="size-4" />
                Főoldal
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="mb-4 text-lg font-bold text-[#0f172a]">{title}</legend>
      {children}
    </fieldset>
  );
}
