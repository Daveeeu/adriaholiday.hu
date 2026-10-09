import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Mail, ShieldCheck } from "lucide-react";
import { useAnalytics } from "../analytics/useAnalytics";
import { type PortfolioBookingPayment, type PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import BookingFieldInput from "./BookingFieldInput";
import BookingOptionsPanel from "./BookingOptionsPanel";
import PassengerOptionsPanel from "./PassengerOptionsPanel";
import {
  EMPTY_PASSENGER_OPTIONS,
  chargedBookingExtras,
  chargedPassengerExtras,
  estimateBookingPrice,
  formatHuf,
  isCancellationInsuranceAvailable,
  passengerCardExtras,
  travelDays,
  tripStepExtras,
  type BookingDeparturePlace,
  type BookingExtra,
  type BookingInsurances,
  type PassengerOptions,
} from "./booking-pricing";
import { parseDiscountPercent } from "../content/discount-badge";
import {
  initialValues,
  fieldsOfGroup,
  requiredFieldErrors,
  type BookingFieldErrors,
  type BookingFieldGroup,
  type BookingFieldValues,
  type BookingFormField,
} from "./booking-form-fields";
import { submitBooking, BookingApiError, BookingValidationError } from "./bookings-api";
import BarionPaymentBanner from "../components/BarionPaymentBanner";
import { useSiteSettings } from "../site-settings/SiteSettingsProvider";

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

const TERMS_REQUIRED_MESSAGE = "Az ÁSZF és az adatkezelési tájékoztató elfogadása kötelező.";

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

/** The picked choices of the charged extras offering one, keyed by extra id. */
function chosenOptions(charged: BookingExtra[], choices: Record<number, string>): Record<number, string> {
  return Object.fromEntries(charged.filter((extra) => choices[extra.id]).map((extra) => [extra.id, choices[extra.id]]));
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
  departurePlaces?: BookingDeparturePlace[];
  bookingInsurances?: BookingInsurances | null;
  bookingPayment?: PortfolioBookingPayment | null;
};

type BookingDateOption = {
  id: number | string;
  label: string;
  status?: string | null;
  seatsLeft?: number | null;
  extras?: BookingExtra[];
  startDate?: string | null;
  endDate?: string | null;
};

type ExtraSelection = {
  dateId: BookingDateOption["id"];
  ids: number[];
  choices: Record<number, string>;
};

const NO_EXTRAS: BookingExtra[] = [];
const NO_DEPARTURE_PLACES: BookingDeparturePlace[] = [];

type BookingSectionProps = {
  selectedDate: BookingDateOption;
  trip: BookingTrip;
  priceBox: PortfolioPriceBox | null;
};

export default function BookingSection({ selectedDate, trip, priceBox }: BookingSectionProps) {
  const { trackEvent } = useAnalytics();
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [formValues, setFormValues] = useState<BookingFieldValues>(() =>
    initialValues((trip.bookingFormFields ?? []).filter((field) => field.inputGroup !== "passenger")),
  );
  const [couponCode, setCouponCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const { settings } = useSiteSettings();
  const [passengers, setPassengers] = useState<BookingFieldValues[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "redirecting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>(NO_ERRORS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | number | null>(null);
  const [departurePlaceId, setDeparturePlaceId] = useState("");
  const [departurePlaceError, setDeparturePlaceError] = useState<string | null>(null);
  const [extraSelection, setExtraSelection] = useState<ExtraSelection>({
    dateId: selectedDate.id,
    ids: [],
    choices: {},
  });
  const [extraChoiceError, setExtraChoiceError] = useState<string | null>(null);
  const [passengerOptions, setPassengerOptions] = useState<PassengerOptions[]>([EMPTY_PASSENGER_OPTIONS]);
  const [passengerChoiceErrors, setPassengerChoiceErrors] = useState<Record<number, string>>({});

  const departurePlaces = trip.departurePlaces ?? NO_DEPARTURE_PLACES;
  const extras = selectedDate.extras ?? NO_EXTRAS;
  const passengerCount = Math.max(1, passengers.length);
  const insurances = trip.bookingInsurances ?? null;
  const onlinePayment = trip.bookingPayment ?? null;
  const startDate = selectedDate.startDate ?? null;
  const endDate = selectedDate.endDate ?? null;
  const travelInsuranceAvailable = insurances !== null && travelDays(startDate, endDate) !== null;
  const cancellationInsuranceAvailable = isCancellationInsuranceAvailable(startDate, insurances);
  // Extras belong to a date, so a selection made for another date no longer applies.
  const currentSelection = extraSelection.dateId === selectedDate.id ? extraSelection : null;
  const selectedExtraIds = useMemo(() => currentSelection?.ids ?? [], [currentSelection]);
  const extraChoices = useMemo(() => currentSelection?.choices ?? {}, [currentSelection]);
  // Each passenger's options without extras of another date, aligned with the passengers.
  const currentPassengerOptions = useMemo(() => {
    const dateExtraIds = new Set(extras.map((extra) => extra.id));

    return passengers.map((_, index) => {
      const options = passengerOptions[index] ?? EMPTY_PASSENGER_OPTIONS;

      return {
        ...options,
        extraIds: options.extraIds.filter((id) => dateExtraIds.has(id)),
        travelInsurance: travelInsuranceAvailable && options.travelInsurance,
        cancellationInsurance: cancellationInsuranceAvailable && options.cancellationInsurance,
      };
    });
  }, [passengers, passengerOptions, extras, travelInsuranceAvailable, cancellationInsuranceAvailable]);
  const cardExtras = useMemo(() => passengerCardExtras(extras, passengerCount), [extras, passengerCount]);
  const hasPassengerOptions = cardExtras.length > 0 || travelInsuranceAvailable || cancellationInsuranceAvailable;
  const selectedDeparturePlace =
    departurePlaces.find((place) => String(place.id) === departurePlaceId) ?? null;
  const priceEstimate = useMemo(
    () =>
      estimateBookingPrice({
        basePrice: priceBox?.price ?? null,
        discountPercent: parseDiscountPercent(priceBox?.discountBadge),
        departurePlace: selectedDeparturePlace,
        extras,
        bookingExtraIds: selectedExtraIds,
        passengerOptions: currentPassengerOptions,
        insurances,
        startDate,
        endDate,
      }),
    [
      priceBox?.price,
      priceBox?.discountBadge,
      selectedDeparturePlace,
      extras,
      selectedExtraIds,
      currentPassengerOptions,
      insurances,
      startDate,
      endDate,
    ],
  );
  const displayedTotal =
    priceEstimate.total !== null ? formatHuf(priceEstimate.total) : priceBox?.displayedPrice ?? null;

  const fields: BookingFormField[] = useMemo(() => trip.bookingFormFields ?? [], [trip]);
  const contactFields = useMemo(() => fieldsOfGroup(fields, "contact"), [fields]);
  const passengerFields = useMemo(() => fieldsOfGroup(fields, "passenger"), [fields]);
  const extraFields = useMemo(() => fieldsOfGroup(fields, "extra"), [fields]);

  useEffect(() => {
    setPassengers((current) => (current.length > 0 ? current : [initialValues(passengerFields)]));
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

  function changeDeparturePlace(id: string) {
    markStarted();
    setDeparturePlaceId(id);
    setDeparturePlaceError(null);
  }

  function toggleExtra(id: number) {
    markStarted();
    setExtraSelection({
      dateId: selectedDate.id,
      ids: selectedExtraIds.includes(id)
        ? selectedExtraIds.filter((extraId) => extraId !== id)
        : [...selectedExtraIds, id],
      choices: extraChoices,
    });
  }

  function changeExtraChoice(id: number, choice: string) {
    markStarted();
    setExtraChoiceError(null);
    setExtraSelection({
      dateId: selectedDate.id,
      ids: selectedExtraIds,
      choices: { ...extraChoices, [id]: choice },
    });
  }

  function changePassengerOptions(index: number, options: PassengerOptions) {
    markStarted();
    setPassengerChoiceErrors((current) => ({ ...current, [index]: "" }));
    setPassengerOptions(passengers.map((_, passengerIndex) => (passengerIndex === index ? options : currentPassengerOptions[passengerIndex])));
  }

  function applyFirstPassengerOptionsToEveryone() {
    markStarted();
    setPassengerChoiceErrors({});
    setPassengerOptions(passengers.map(() => currentPassengerOptions[0]));
  }

  /** The first charged extra of the list that offers choices but has none picked. */
  function missingChoice(charged: BookingExtra[], choices: Record<number, string>): BookingExtra | undefined {
    return charged.find((extra) => extra.choices.length > 0 && !extra.choices.includes(choices[extra.id] ?? ""));
  }

  /** Charged booking-level extras offering choices need one picked. */
  function validateExtraChoices(): boolean {
    const missing = missingChoice(chargedBookingExtras(extras, selectedExtraIds, passengerCount), extraChoices);

    setExtraChoiceError(missing ? `Válassz egy lehetőséget: ${missing.name}.` : null);

    return !missing;
  }

  /** Each passenger's charged extras offering choices (e.g. single room: alone / roommate) need one picked. */
  function validatePassengerChoices(): boolean {
    const errors: Record<number, string> = {};

    currentPassengerOptions.forEach((options, index) => {
      const missing = missingChoice(chargedPassengerExtras(extras, options, passengerCount), options.extraChoices);

      if (missing) {
        errors[index] = `Válassz egy lehetőséget: ${missing.name}.`;
      }
    });

    setPassengerChoiceErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validateBookingOptions(): boolean {
    const departureValid = validateDeparturePlace();

    return validateExtraChoices() && departureValid;
  }

  /** A tour with departure places needs one chosen before it can be booked. */
  function validateDeparturePlace(): boolean {
    if (departurePlaces.length > 0 && !selectedDeparturePlace) {
      setDeparturePlaceError("Válassz felszállási helyet.");
      return false;
    }

    setDeparturePlaceError(null);
    return true;
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
    setPassengerOptions([...currentPassengerOptions, EMPTY_PASSENGER_OPTIONS]);
    setPassengers((current) => {
      const next = [...current, initialValues(passengerFields)];
      trackEvent("participants_change", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { participants: next.length },
      });
      return next;
    });
  }

  function removePassenger(index: number) {
    if (passengers.length > 1) {
      setPassengerOptions(currentPassengerOptions.filter((_, passengerIndex) => passengerIndex !== index));
      setPassengerChoiceErrors({});
    }

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
    if (step === 1 && !validateBookingOptions()) {
      return;
    }

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
      const choicesValid = validatePassengerChoices();
      if (Object.keys(errors).length > 0 || !choicesValid) {
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 4));
  }

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  async function handleSubmit() {
    if (!validateBookingOptions()) {
      setStep(1);
      return;
    }

    if (!validatePassengerChoices()) {
      setStep(STEP_OF_GROUP.passenger);
      return;
    }

    const errors = validateAll();
    setFieldErrors(errors);

    const errorStep = firstStepWithError(fields, errors);
    if (errorStep !== null) {
      setStep(errorStep);
      return;
    }

    if (!termsAccepted) {
      setTermsError(TERMS_REQUIRED_MESSAGE);
      setStep(4);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const tourDateId = selectedDate?.id && selectedDate.id !== "default" ? selectedDate.id : null;
    const bookingExtras = chargedBookingExtras(extras, selectedExtraIds, passengerCount);

    try {
      const response = await submitBooking({
        tourId: trip.id,
        tourDateId,
        participants: passengers.length,
        formData: formValues,
        passengers,
        note: formValues.note,
        couponCode: couponCode.trim() || undefined,
        departurePlaceId: selectedDeparturePlace?.id ?? null,
        extraIds: bookingExtras.map((extra) => extra.id),
        extraChoices: chosenOptions(bookingExtras, extraChoices),
        passengerOptions: currentPassengerOptions.map((options) => {
          const charged = chargedPassengerExtras(extras, options, passengerCount);

          return {
            ...options,
            extraIds: charged.map((extra) => extra.id),
            extraChoices: chosenOptions(charged, options.extraChoices),
          };
        }),
        type: "tour_booking",
        termsAccepted,
      });

      setBookingId(response.id);
      trackEvent("booking_success", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { booking_id: response.id, participants: passengers.length },
      });

      if (response.paymentUrl) {
        setStatus("redirecting");
        window.location.assign(response.paymentUrl);
        return;
      }

      setStatus("success");
    } catch (submitError) {
      setStatus("error");

      if (submitError instanceof BookingValidationError) {
        const errors: FieldErrorState = { form: {}, passengers: {} };
        const choiceErrors: Record<number, string> = {};

        Object.entries(submitError.errors).forEach(([key, messages]) => {
          const message = messages[0] ?? "Érvénytelen mező.";
          const passengerMatch = key.match(/^passengers\.(\d+)\.(.+)$/);
          const passengerOptionMatch = key.match(/^passengerOptions\.(\d+)\./);
          const formMatch = key.match(/^formData\.(.+)$/);

          if (passengerOptionMatch) {
            choiceErrors[Number(passengerOptionMatch[1])] = message;
          } else if (passengerMatch) {
            const index = Number(passengerMatch[1]);
            errors.passengers[index] = { ...errors.passengers[index], [passengerMatch[2]]: message };
          } else if (formMatch) {
            errors.form[formMatch[1]] = message;
          }
        });

        setFieldErrors(errors);
        setPassengerChoiceErrors(choiceErrors);
        setErrorMessage(submitError.message);

        const tripOptionErrorKeys = ["departurePlaceId", "extraIds", "extraChoices"];
        if (tripOptionErrorKeys.some((key) => submitError.errors[key]?.[0])) {
          setDeparturePlaceError(submitError.errors.departurePlaceId?.[0] ?? null);
          setExtraChoiceError(submitError.errors.extraChoices?.[0] ?? null);
          setStep(1);
          return;
        }

        const passengerOptionErrors = Object.keys(choiceErrors).length > 0
          || ["travelInsurance", "cancellationInsurance"].some((key) => submitError.errors[key]?.[0]);
        if (passengerOptionErrors) {
          setStep(STEP_OF_GROUP.passenger);
          return;
        }

        const termsMessage = submitError.errors.terms_accepted?.[0] ?? submitError.errors.termsAccepted?.[0];
        if (termsMessage) {
          setTermsError(termsMessage);
          setStep(4);
          return;
        }

        if (submitError.errors.couponCode?.[0]) {
          setStep(4);
          return;
        }

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

  if (status === "redirecting") {
    return (
      <section id="foglalas" className="scroll-mt-[92px]">
        <div className="rounded-[40px] bg-[#07111f] p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00c389]/15 text-[#00c389]">
            <CreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Foglalásodat rögzítettük!
          </h2>
          <p className="text-white/65 text-lg max-w-xl mx-auto">
            Foglalásod azonosítója: <span className="font-bold text-white">#{bookingId}</span>.
            Átirányítunk a Barion biztonságos fizetőoldalára…
          </p>
          <ConfirmationEmailNote email={formValues.contact_email} />
          <div className="mt-6 flex justify-center">
            <BarionPaymentBanner variant="dark" />
          </div>
        </div>
      </section>
    );
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
            {onlinePayment ? " A fizetés részleteiről is tőle kapsz tájékoztatást." : null}
          </p>
          <ConfirmationEmailNote email={formValues.contact_email} />
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
                      value={trip.transport === "bus" ? "Autóbuszos út" : "Repülős út"}
                    />
                    <FormReadonly label="Ellátás" value={trip.meals || "-"} />
                    <FormReadonly label="Szállás" value={trip.hotel || "-"} />
                    <FormReadonly
                      label="Részvételi díj"
                      value={priceBox?.displayedPrice ?? ""}
                    />
                  </div>

                  <BookingOptionsPanel
                    departurePlaces={departurePlaces}
                    departurePlaceId={departurePlaceId}
                    onDeparturePlaceChange={changeDeparturePlace}
                    departurePlaceError={departurePlaceError ?? undefined}
                    extras={tripStepExtras(extras)}
                    passengers={passengerCount}
                    bookingExtraIds={selectedExtraIds}
                    onToggleExtra={toggleExtra}
                    extraChoices={extraChoices}
                    onExtraChoiceChange={changeExtraChoice}
                    extraChoiceError={extraChoiceError ?? undefined}
                    hasPassengerOptions={hasPassengerOptions}
                  />
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

                        <PassengerOptionsPanel
                          passengerIndex={index}
                          extras={cardExtras}
                          passengers={passengerCount}
                          options={currentPassengerOptions[index] ?? EMPTY_PASSENGER_OPTIONS}
                          onChange={(options) => changePassengerOptions(index, options)}
                          choiceError={passengerChoiceErrors[index] || undefined}
                          insurances={insurances}
                          travelInsuranceAvailable={travelInsuranceAvailable}
                          cancellationInsuranceAvailable={cancellationInsuranceAvailable}
                          onApplyToEveryone={
                            index === 0 && passengers.length > 1 ? applyFirstPassengerOptionsToEveryone : undefined
                          }
                        />
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

                    {priceEstimate.lines.length > 0 ? (
                      <div className="rounded-2xl bg-[#f5f9fc] border border-gray-100 p-5">
                        <div className="font-bold text-[#0f172a] mb-3">Árösszesítő</div>
                        <ul className="space-y-2 text-sm">
                          {[...priceEstimate.lines, ...priceEstimate.insuranceLines].map((line) => (
                            <li key={line.key} className="flex justify-between gap-4">
                              <span className="text-gray-600">{line.label}</span>
                              <span className="font-bold text-[#0f172a] whitespace-nowrap">{formatHuf(line.amount)}</span>
                            </li>
                          ))}
                        </ul>
                        {trip.couponable ? (
                          <p className="mt-3 text-xs text-gray-500">
                            A kupon értékét a foglalás beküldésekor vonjuk le a végösszegből. Ha foglaláskor nem adod meg a
                            kuponkódodat, utólag sajnos nem tudjuk érvényesíteni.
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div>
                      <label className="flex items-start gap-3 text-sm text-[#0f172a] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(event) => {
                            setTermsAccepted(event.target.checked);
                            setTermsError(null);
                          }}
                          className="mt-1 accent-[#00c389]"
                        />
                        <span>
                          Az{" "}
                          <a href={settings.termsUrl || "/aszf"} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
                            Általános Szerződési Feltételeket
                          </a>{" "}
                          és az{" "}
                          <a href={settings.privacyUrl || "/adatvedelem"} target="_blank" rel="noreferrer" className="font-bold text-[#00a878] underline">
                            adatkezelési tájékoztatót
                          </a>{" "}
                          elolvastam és elfogadom.*
                        </span>
                      </label>
                      {termsError ? <p className="mt-2 text-sm font-medium text-red-600">{termsError}</p> : null}
                    </div>
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
                  {displayedTotal ? (
                    <div className="text-3xl font-extrabold text-[#00a878]">
                      {displayedTotal}
                    </div>
                  ) : null}
                  {onlinePayment ? (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <CreditCard className="w-4 h-4 text-[#00a878]" />
                      {onlinePayment.kind === "deposit"
                        ? `A foglalás után ${onlinePayment.depositPercent}% előleget fizetsz online, Barionnal.`
                        : "A foglalás után a teljes összeget online fizeted, Barionnal."}
                    </div>
                  ) : null}
                  {onlinePayment && step === 4 ? <BarionPaymentBanner variant="light" className="mt-3" /> : null}
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
                    {status === "submitting"
                      ? "Küldés..."
                      : step < 4
                        ? "Következő"
                        : onlinePayment
                          ? "Foglalás és fizetés"
                          : "Foglalás elküldése"}
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
        {displayedTotal}
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

/** Points the customer to the booking confirmation e-mail sent right after booking. */
function ConfirmationEmailNote({ email }: { email?: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#00c389]" />
      <p className="text-white/80">
        A foglalás részleteit e-mailben is elküldtük
        {email ? (
          <>
            {" "}a(z) <span className="font-bold text-white break-all">{email}</span> címre
          </>
        ) : null}
        . Kérjük, nézd meg a postafiókodat, és ha nem találod a levelet, a Spam vagy Promóciók mappát is.
      </p>
    </div>
  );
}
