import { useEffect, useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useAnalytics } from "../analytics/useAnalytics";
import { type PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import BookingFieldInput from "./BookingFieldInput";
import {
  emptyValues,
  fieldsOfGroup,
  requiredFieldErrors,
  type BookingFieldErrors,
  type BookingFieldGroup,
  type BookingFieldValues,
  type BookingFormField,
} from "./booking-form-fields";
import { submitBooking, BookingApiError, BookingValidationError } from "./bookings-api";

type FieldErrorState = {
  form: BookingFieldErrors;
  passengers: Record<number, BookingFieldErrors>;
};

const NO_ERRORS: FieldErrorState = { form: {}, passengers: {} };

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

const STEP_OF_GROUP: Record<BookingFieldGroup, number> = {
  contact: 2,
  passenger: 3,
  extra: 4,
};

function passengerErrorsOf(
  passengerFields: BookingFormField[],
  passengers: BookingFieldValues[],
): Record<number, BookingFieldErrors> {
  const errors: Record<number, BookingFieldErrors> = {};

  passengers.forEach((passenger, index) => {
    const passengerErrors = requiredFieldErrors(passengerFields, passenger);

    if (Object.keys(passengerErrors).length > 0) {
      errors[index] = passengerErrors;
    }
  });

  return errors;
}

/** The earliest step showing one of the errors, so the customer lands on it. */
function firstStepWithError(fields: BookingFormField[], errors: FieldErrorState): number | null {
  const steps = fields
    .filter((field) => field.key in errors.form)
    .map((field) => STEP_OF_GROUP[field.inputGroup]);

  if (Object.keys(errors.passengers).length > 0) {
    steps.push(STEP_OF_GROUP.passenger);
  }

  return steps.length > 0 ? Math.min(...steps) : null;
}

type BookingTrip = {
  id: number | string;
  slug: string;
  title: string;
  transport: string;
  meals?: string | null;
  hotel?: string | null;
  couponable?: boolean;
  bookingFormFields?: BookingFormField[];
};

type BookingDateOption = {
  id: number | string;
  label: string;
  status?: string | null;
  seatsLeft?: number | null;
};

type BookingSectionProps = {
  selectedDate: BookingDateOption;
  trip: BookingTrip;
  priceBox: PortfolioPriceBox | null;
};

export default function BookingSection({ selectedDate, trip, priceBox }: BookingSectionProps) {
  const { trackEvent } = useAnalytics();
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [formValues, setFormValues] = useState<BookingFieldValues>({});
  const [couponCode, setCouponCode] = useState("");
  const [passengers, setPassengers] = useState<BookingFieldValues[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>(NO_ERRORS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | number | null>(null);

  const fields: BookingFormField[] = useMemo(() => trip.bookingFormFields ?? [], [trip]);
  const contactFields = useMemo(() => fieldsOfGroup(fields, "contact"), [fields]);
  const passengerFields = useMemo(() => fieldsOfGroup(fields, "passenger"), [fields]);
  const extraFields = useMemo(() => fieldsOfGroup(fields, "extra"), [fields]);

  useEffect(() => {
    setPassengers((current) => (current.length > 0 ? current : [emptyValues(passengerFields)]));
  }, [passengerFields]);

  const steps = [
    { id: 1, title: "Utazás" },
    { id: 2, title: "Kapcsolat" },
    { id: 3, title: "Utasok" },
    { id: 4, title: "Véglegesítés" },
  ];

  function markStarted() {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    trackEvent("booking_start", {
      entity: { type: "tour", slug: trip.slug },
      metadata: { transport: trip.transport },
    });
  }

  function setFormValue(key: string, value: string) {
    markStarted();
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  function setPassengerValue(index: number, key: string, value: string) {
    markStarted();
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger,
      ),
    );
  }

  function addPassenger() {
    setPassengers((current) => {
      const next = [...current, emptyValues(passengerFields)];
      trackEvent("participants_change", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { participants: next.length },
      });
      return next;
    });
  }

  function removePassenger(index: number) {
    setPassengers((current) => {
      if (current.length <= 1) {
        return current;
      }

      const next = current.filter((_, passengerIndex) => passengerIndex !== index);
      trackEvent("participants_change", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { participants: next.length },
      });
      return next;
    });
  }

  function validateAll(): FieldErrorState {
    return {
      form: requiredFieldErrors([...contactFields, ...extraFields], formValues),
      passengers: passengerErrorsOf(passengerFields, passengers),
    };
  }

  function nextStep() {
    if (step === STEP_OF_GROUP.contact) {
      const errors = requiredFieldErrors(contactFields, formValues);
      setFieldErrors((current) => ({ ...current, form: errors }));
      if (Object.keys(errors).length > 0) {
        return;
      }
    }

    if (step === STEP_OF_GROUP.passenger) {
      const errors = passengerErrorsOf(passengerFields, passengers);
      setFieldErrors((current) => ({ ...current, passengers: errors }));
      if (Object.keys(errors).length > 0) {
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  async function handleSubmit() {
    const errors = validateAll();
    setFieldErrors(errors);

    const errorStep = firstStepWithError(fields, errors);
    if (errorStep !== null) {
      setStep(errorStep);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const tourDateId = selectedDate?.id && selectedDate.id !== "default" ? selectedDate.id : null;

    try {
      const response = await submitBooking({
        tourId: trip.id,
        tourDateId,
        participants: passengers.length,
        formData: formValues,
        passengers,
        note: formValues.note,
        couponCode: couponCode.trim() || undefined,
        type: "tour_booking",
      });

      setBookingId(response.id);
      setStatus("success");
      trackEvent("booking_success", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { booking_id: response.id, participants: passengers.length },
      });
    } catch (submitError) {
      setStatus("error");

      if (submitError instanceof BookingValidationError) {
        const errors: FieldErrorState = { form: {}, passengers: {} };

        Object.entries(submitError.errors).forEach(([key, messages]) => {
          const message = messages[0] ?? "Érvénytelen mező.";
          const passengerMatch = key.match(/^passengers\.(\d+)\.(.+)$/);
          const formMatch = key.match(/^formData\.(.+)$/);

          if (passengerMatch) {
            const index = Number(passengerMatch[1]);
            errors.passengers[index] = { ...errors.passengers[index], [passengerMatch[2]]: message };
          } else if (formMatch) {
            errors.form[formMatch[1]] = message;
          }
        });

        setFieldErrors(errors);
        setErrorMessage(submitError.message);

        const errorStep = firstStepWithError(fields, errors);
        if (errorStep !== null) {
          setStep(errorStep);
        }
      } else if (submitError instanceof BookingApiError) {
        setErrorMessage(submitError.message);
      } else {
        setErrorMessage("Váratlan hiba történt a foglalás elküldése közben.");
      }

      trackEvent("booking_error", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { message: submitError instanceof Error ? submitError.message : "unknown_error" },
      });
    }
  }

  if (status === "success") {
    return (
      <section id="foglalas" className="scroll-mt-[92px]">
        <div className="rounded-[40px] bg-[#07111f] p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00c389]/15 text-[#00c389]">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Köszönjük a foglalást!
          </h2>
          <p className="text-white/65 text-lg max-w-xl mx-auto">
            Foglalásod azonosítója: <span className="font-bold text-white">#{bookingId}</span>.
            Munkatársunk hamarosan felveszi veled a kapcsolatot a visszaigazolás érdekében.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="foglalas" className="scroll-mt-[92px]">
      <div className="relative overflow-hidden rounded-[40px] bg-[#07111f] p-5 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,195,137,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(22,184,255,0.15),transparent_30%)]" />

        <div className="relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 mb-5">
              <ShieldCheck className="w-4 h-4 text-[#00c389]" />
              Biztonságos online foglalás
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              Foglalás
            </h2>

            <p className="max-w-2xl text-white/65 text-lg leading-relaxed">
              Válaszd ki az adatokat pár egyszerű lépésben.
            </p>
          </div>

          <div className="rounded-[30px] bg-white/8 border border-white/10 backdrop-blur-xl p-4 md:p-6">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {steps.map((item) => {
                const active = step === item.id;
                const done = step > item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setStep(item.id)}
                    className={`h-12 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white"
                        : done
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                      {done ? <Check className="w-4 h-4" /> : item.id}
                    </div>

                    <span className="hidden md:block text-sm font-bold">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] bg-white p-5 md:p-7">
              {step === 1 && (
                <StepPanel
                  title="Utazás adatai"
                  text="Ellenőrizd a kiválasztott adatokat."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <FormReadonly label="Utazás" value={trip.title} />
                    <FormReadonly label="Dátum" value={selectedDate.label} />
                    <FormReadonly
                      label="Utazás módja"
                      value={trip.transport === "bus" ? "Buszos út" : "Repülős út"}
                    />
                    <FormReadonly label="Ellátás" value={trip.meals || "-"} />
                    <FormReadonly label="Szállás" value={trip.hotel || "-"} />
                    <FormReadonly
                      label="Részvételi díj"
                      value={priceBox?.displayedPrice ?? ""}
                    />
                  </div>
                </StepPanel>
              )}

              {step === 2 && (
                <StepPanel
                  title="Kapcsolattartó"
                  text="Kapcsolati adatok megadása."
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactFields.map((field) => (
                      <BookingFieldInput
                        key={field.key}
                        field={field}
                        value={formValues[field.key] ?? ""}
                        onChange={(value) => setFormValue(field.key, value)}
                        error={fieldErrors.form[field.key]}
                      />
                    ))}
                  </div>
                </StepPanel>
              )}

              {step === 3 && (
                <StepPanel
                  title="Utas adatai"
                  text="Add meg az utasok alapadatait."
                >
                  <div className="space-y-5">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-bold text-[#0f172a]">{index + 1}. utas</div>
                          {passengers.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="text-sm text-gray-400 hover:text-red-500"
                            >
                              Eltávolítás
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {passengerFields.map((field) => (
                            <BookingFieldInput
                              key={field.key}
                              field={field}
                              value={passenger[field.key] ?? ""}
                              onChange={(value) => setPassengerValue(index, field.key, value)}
                              error={fieldErrors.passengers[index]?.[field.key]}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addPassenger}
                      className="text-sm font-bold text-[#00a878] hover:text-[#00c389]"
                    >
                      + Újabb utas hozzáadása
                    </button>
                  </div>
                </StepPanel>
              )}

              {step === 4 && (
                <StepPanel title="Véglegesítés" text="Extra opciók és megjegyzés.">
                  <div className="space-y-5">
                    {extraFields.map((field) => (
                      <BookingFieldInput
                        key={field.key}
                        field={field}
                        value={formValues[field.key] ?? ""}
                        onChange={(value) => setFormValue(field.key, value)}
                        error={fieldErrors.form[field.key]}
                      />
                    ))}

                    {trip.couponable ? (
                      <div className="max-w-sm">
                        <BookingFieldInput field={COUPON_FIELD} value={couponCode} onChange={setCouponCode} />
                      </div>
                    ) : null}
                  </div>

                  {errorMessage ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  ) : null}
                </StepPanel>
              )}

              <div className="mt-8 border-t border-gray-100 pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Összesen</div>
                  {priceBox?.displayedPrice ? (
                    <div className="text-3xl font-extrabold text-[#00a878]">
                      {priceBox.displayedPrice}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="h-12 px-6 rounded-xl bg-gray-100 text-[#0f172a] font-bold disabled:opacity-40"
                  >
                    Vissza
                  </button>

                  <button
                    onClick={step < 4 ? nextStep : handleSubmit}
                    disabled={status === "submitting"}
                    className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#00c389] to-[#16b8ff] text-white font-bold disabled:opacity-60"
                  >
                    {status === "submitting" ? "Küldés..." : step < 4 ? "Következő" : "Foglalás elküldése"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] bg-white/10 border border-white/10 backdrop-blur-xl p-5 md:p-6">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="min-w-0">
      <div className="text-white/50 text-sm mb-1">Kiválasztott utazás</div>

      <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
        {trip.title}
      </h3>

      <div className="flex flex-wrap gap-2 mt-4">
        <SummaryChip label="Időpont" value={selectedDate.label} />
        <SummaryChip label="Státusz" value={selectedDate.status} />
        <SummaryChip
          label="Szabad hely"
          value={
            priceBox?.availableSeats !== null &&
            priceBox?.availableSeats !== undefined
              ? `Még ${priceBox.availableSeats} szabad hely`
              : selectedDate.seatsLeft !== null &&
                  selectedDate.seatsLeft !== undefined
                ? `Még ${selectedDate.seatsLeft} szabad hely`
                : null
          }
        />
        <SummaryChip label="Ellátás" value={trip.meals || null} />
        <SummaryChip label="Szállás" value={trip.hotel || null} />
      </div>
    </div>

    <div className="lg:text-right shrink-0">
      <div className="text-white/50 text-sm mb-1">Teljes összeg</div>

      <div className="text-4xl md:text-5xl font-extrabold text-[#00c389] whitespace-nowrap">
        {priceBox?.displayedPrice}
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}

function StepPanel({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-500 text-base leading-relaxed">{text}</p>
      </div>

      {children}
    </div>
  );
}

function FormReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f5f9fc] p-5 border border-gray-100">
      <div className="text-gray-500 text-sm mb-1">{label}</div>
      <div className="text-[#0f172a] font-bold leading-tight">{value}</div>
    </div>
  );
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!hasText(value)) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-4 py-2">
      <span className="text-white/45 text-xs">{label}</span>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}

function hasText(value?: string | null) {
  return typeof value === "string" && value.trim() !== "";
}
