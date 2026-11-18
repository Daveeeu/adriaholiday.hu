import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { tourItem } from "../analytics/analytics-items";
import type { AnalyticsEcommerce } from "../analytics/event-catalog";
import { useAnalytics } from "../analytics/useAnalytics";
import { useBookingFunnelTracking } from "../analytics/useBookingFunnelTracking";
import { parseDiscountPercent } from "../content/discount-badge";
import type { PortfolioBookingPayment, PortfolioPriceBox } from "../content/portfolio-offer-detail-api";
import { bringIntoView } from "../lib/bringIntoView";
import { formatHuf } from "../lib/price";
import { seatsLeftLabel } from "../lib/seatsLeft";
import {
  EMPTY_PASSENGER_OPTIONS,
  chargedBookingExtras,
  chargedPassengerExtras,
  estimateBookingPrice,
  estimateDeposit,
  isCancellationInsuranceAvailable,
  passengerCardExtras,
  travelDays,
  type BookingDeparturePlace,
  type BookingExtra,
  type BookingInsurances,
  type PassengerOptions,
} from "./booking-pricing";
import {
  fieldError,
  fieldErrorsOf,
  fieldsOfGroup,
  initialValues,
  type BookingFieldErrors,
  type BookingFieldValues,
  type BookingFormField,
} from "./booking-form-fields";
import { BookingApiError, BookingValidationError, submitBooking } from "./bookings-api";
import { clearBookingDraft, readBookingDraft, saveBookingDraft } from "./booking-draft";

export type BookingTrip = {
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

export type BookingDateOption = {
  id: number | string;
  label: string;
  status?: string | null;
  seatsLeft?: number | null;
  extras?: BookingExtra[];
  depositPercent?: number | null;
  instalmentsMinTripTotal?: number | null;
  departurePlaceIds?: number[];
  startDate?: string | null;
  endDate?: string | null;
};

export type FieldErrorState = {
  form: BookingFieldErrors;
  passengers: Record<number, BookingFieldErrors>;
};

type ExtraSelection = {
  dateId: BookingDateOption["id"];
  ids: number[];
  choices: Record<number, string>;
};

export type BookingStatus = "idle" | "submitting" | "redirecting" | "success" | "error";

const NO_ERRORS: FieldErrorState = { form: {}, passengers: {} };
const NO_EXTRAS: BookingExtra[] = [];
const NO_DEPARTURE_PLACES: BookingDeparturePlace[] = [];

/** As many passengers as one booking takes; a larger group asks for a group quote. */
const MAX_PASSENGERS = 20;

const TERMS_REQUIRED_MESSAGE = "Az ÁSZF és az adatkezelési tájékoztató elfogadása kötelező.";
const DATA_TRANSFER_REQUIRED_MESSAGE = "Az adattovábbítási nyilatkozat elfogadása kötelező.";

/** The furthest form section the visitor has scrolled to, reported to the funnel as its step. */
type ReachedSection = { step: number; stepName: string };

function passengerErrorsOf(
  passengerFields: BookingFormField[],
  passengers: BookingFieldValues[],
): Record<number, BookingFieldErrors> {
  const errors: Record<number, BookingFieldErrors> = {};

  passengers.forEach((passenger, index) => {
    const passengerErrors = fieldErrorsOf(passengerFields, passenger);

    if (Object.keys(passengerErrors).length > 0) {
      errors[index] = passengerErrors;
    }
  });

  return errors;
}

function withoutKey(errors: BookingFieldErrors, key: string): BookingFieldErrors {
  const rest = { ...errors };
  delete rest[key];

  return rest;
}

/** The picked choices of the charged extras offering one, keyed by extra id. */
function chosenOptions(charged: BookingExtra[], choices: Record<number, string>): Record<number, string> {
  return Object.fromEntries(charged.filter((extra) => choices[extra.id]).map((extra) => [extra.id, choices[extra.id]]));
}

/** The names (never the values) of the fields with an error, passenger fields prefixed. */
function errorFieldNames(errors: FieldErrorState): string[] {
  return [
    ...Object.keys(errors.form),
    ...Object.values(errors.passengers).flatMap((fieldErrors) => Object.keys(fieldErrors).map((key) => `passenger.${key}`)),
  ];
}

/** The first charged extra of the list that offers choices but has none picked. */
function missingChoice(charged: BookingExtra[], choices: Record<number, string>): BookingExtra | undefined {
  return charged.find((extra) => extra.choices.length > 0 && !extra.choices.includes(choices[extra.id] ?? ""));
}

/**
 * The state, live price, validation and submission of the one-page tour
 * booking form. Everything is checked together on submit, and the first
 * error on the page is brought into view.
 */
export function useTourBookingForm({
  trip,
  selectedDate,
  priceBox,
}: {
  trip: BookingTrip;
  selectedDate: BookingDateOption;
  priceBox: PortfolioPriceBox | null;
}) {
  const { trackEvent } = useAnalytics();
  // A date with few seats left takes no more passengers than it has seats.
  const seatsLeft = selectedDate.seatsLeft ?? null;
  const maxPassengers = seatsLeft !== null && seatsLeft > 0 ? Math.min(MAX_PASSENGERS, seatsLeft) : MAX_PASSENGERS;
  // The head count and supplements of an earlier visit in this tab, so a reload does not wipe them.
  const [draft] = useState(() => readBookingDraft(trip.slug, maxPassengers));
  const [hasStarted, setHasStarted] = useState(false);
  const [formValues, setFormValues] = useState<BookingFieldValues>(() =>
    initialValues((trip.bookingFormFields ?? []).filter((field) => field.inputGroup !== "passenger")),
  );
  const [couponCode, setCouponCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataTransferAccepted, setDataTransferAccepted] = useState(false);
  const [dataTransferError, setDataTransferError] = useState<string | null>(null);
  const [newsletterSubscribe, setNewsletterSubscribe] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<BookingFieldValues[]>(() =>
    draft
      ? Array.from({ length: draft.passengerCount }, () => initialValues(fieldsOfGroup(trip.bookingFormFields ?? [], "passenger")))
      : [],
  );
  const [passengerCountError, setPassengerCountError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>(NO_ERRORS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [departurePlaceId, setDeparturePlaceId] = useState(draft?.departurePlaceId ?? "");
  const [departurePlaceError, setDeparturePlaceError] = useState<string | null>(null);
  const [extraSelection, setExtraSelection] = useState<ExtraSelection>(
    draft
      ? { dateId: draft.dateId, ids: draft.bookingExtraIds, choices: draft.bookingExtraChoices }
      : { dateId: selectedDate.id, ids: [], choices: {} },
  );
  const [extraChoiceError, setExtraChoiceError] = useState<string | null>(null);
  const [passengerOptions, setPassengerOptions] = useState<PassengerOptions[]>(
    draft?.passengerOptions ?? [EMPTY_PASSENGER_OPTIONS],
  );
  const [reachedSection, setReachedSection] = useState<ReachedSection>({ step: 1, stepName: "Utazás" });
  const [passengerChoiceErrors, setPassengerChoiceErrors] = useState<Record<number, string>>({});

  // A date may offer only some of the tour's departure places.
  const departurePlaces = useMemo(() => {
    const places = trip.departurePlaces ?? NO_DEPARTURE_PLACES;
    const offered = selectedDate.departurePlaceIds ?? [];

    return offered.length > 0 ? places.filter((place) => offered.includes(Number(place.id))) : places;
  }, [trip.departurePlaces, selectedDate.departurePlaceIds]);
  const extras = selectedDate.extras ?? NO_EXTRAS;
  const passengerCount = Math.max(1, passengers.length);
  const insurances = trip.bookingInsurances ?? null;
  const onlinePayment = trip.bookingPayment ?? null;
  const startDate = selectedDate.startDate ?? null;
  const endDate = selectedDate.endDate ?? null;
  const days = travelDays(startDate, endDate);
  const travelInsuranceAvailable = insurances !== null && days !== null;
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
  const selectedDeparturePlace = departurePlaces.find((place) => String(place.id) === departurePlaceId) ?? null;
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
  const displayedTotal = priceEstimate.total !== null ? formatHuf(priceEstimate.total) : priceBox?.displayedPrice ?? null;
  const onlineDeposit = estimateDeposit(
    priceEstimate,
    selectedDate.depositPercent ?? null,
    selectedDate.instalmentsMinTripTotal ?? null,
  );

  const fields: BookingFormField[] = useMemo(() => trip.bookingFormFields ?? [], [trip]);
  const contactFields = useMemo(() => fieldsOfGroup(fields, "contact"), [fields]);
  const passengerFields = useMemo(() => fieldsOfGroup(fields, "passenger"), [fields]);
  const extraFields = useMemo(() => fieldsOfGroup(fields, "extra"), [fields]);

  useEffect(() => {
    setPassengers((current) => (current.length > 0 ? current : [initialValues(passengerFields)]));
  }, [passengerFields]);

  // After a failed check the first error on the page is brought to the middle
  // of the screen, with focus on its field.
  const formRef = useRef<HTMLElement>(null);
  const [errorFocusRequest, setErrorFocusRequest] = useState(0);

  useEffect(() => {
    const form = formRef.current;

    if (errorFocusRequest === 0 || !form) {
      return;
    }

    const error = form.querySelector<HTMLElement>("[data-booking-error]");
    const block = error?.closest<HTMLElement>("label, fieldset, li") ?? error;

    if (block) {
      bringIntoView(block, block.querySelector<HTMLElement>("input, select, textarea") ?? block);
    }
  }, [errorFocusRequest]);

  const focusFirstError = () => setErrorFocusRequest((current) => current + 1);

  // The booking is in: the form gives way to the confirmation.
  const completed = status === "success" || status === "redirecting";
  const funnel = useBookingFunnelTracking({
    entity: { type: "tour", slug: trip.slug },
    bookingType: "tour_booking",
    started: hasStarted,
    ...reachedSection,
    completed,
  });

  /** Called as each form section scrolls into view; only a further one moves the funnel on. */
  const reachSection = useCallback((step: number, stepName: string) => {
    setReachedSection((current) => (step > current.step ? { step, stepName } : current));
  }, []);

  // Kept from the first change on, until the booking is sent.
  useEffect(() => {
    if (!hasStarted || completed) {
      return;
    }

    saveBookingDraft(trip.slug, {
      dateId: extraSelection.dateId,
      passengerCount: passengers.length,
      departurePlaceId,
      bookingExtraIds: extraSelection.ids,
      bookingExtraChoices: extraSelection.choices,
      passengerOptions,
    });
  }, [hasStarted, completed, trip.slug, extraSelection, passengers.length, departurePlaceId, passengerOptions]);

  function markStarted() {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    trackEvent("booking_start", {
      entity: { type: "tour", slug: trip.slug },
      metadata: { transport: trip.transport, booking_type: "tour_booking" },
      ecommerce: bookingEcommerce(),
    });
  }

  /** The booked tour as a commerce item, priced from the current estimate. */
  function bookingEcommerce(transactionId?: string | number): AnalyticsEcommerce {
    const quantity = Math.max(passengers.length, 1);
    const total = priceEstimate.total;

    return {
      ...(total !== null ? { value: total } : {}),
      ...(transactionId !== undefined ? { transactionId } : {}),
      items: [
        tourItem(
          { slug: trip.slug, name: trip.title },
          {
            quantity,
            ...(startDate ? { variant: startDate } : {}),
            ...(total !== null ? { price: Math.round(total / quantity) } : {}),
          },
        ),
      ],
    };
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
      ids: selectedExtraIds.includes(id) ? selectedExtraIds.filter((extraId) => extraId !== id) : [...selectedExtraIds, id],
      choices: extraChoices,
    });
  }

  function changeExtraChoice(id: number, choice: string) {
    markStarted();
    setExtraChoiceError(null);
    setExtraSelection({ dateId: selectedDate.id, ids: selectedExtraIds, choices: { ...extraChoices, [id]: choice } });
  }

  function changePassengerOptions(options: PassengerOptions[]) {
    markStarted();
    setPassengerChoiceErrors({});
    setPassengerOptions(options);
  }

  function setFormValue(key: string, value: string) {
    markStarted();
    setFormValues((current) => ({ ...current, [key]: value }));
    // A corrected field's error goes away as soon as it is edited.
    setFieldErrors((current) => (key in current.form ? { ...current, form: withoutKey(current.form, key) } : current));
  }

  function setPassengerValue(index: number, key: string, value: string) {
    markStarted();
    setPassengers((current) =>
      current.map((passenger, passengerIndex) => (passengerIndex === index ? { ...passenger, [key]: value } : passenger)),
    );
    setFieldErrors((current) =>
      current.passengers[index] && key in current.passengers[index]
        ? { ...current, passengers: { ...current.passengers, [index]: withoutKey(current.passengers[index], key) } }
        : current,
    );
  }

  /** Checks a filled-in field as soon as the visitor leaves it; an empty one waits for the submit. */
  function checkFormValue(field: BookingFormField) {
    const value = formValues[field.key] ?? "";
    const error = value.trim() !== "" ? fieldError(field, value) : null;

    if (error !== null) {
      setFieldErrors((current) => ({ ...current, form: { ...current.form, [field.key]: error } }));
    }
  }

  function checkPassengerValue(index: number, field: BookingFormField) {
    const value = passengers[index]?.[field.key] ?? "";
    const error = value.trim() !== "" ? fieldError(field, value) : null;

    if (error !== null) {
      setFieldErrors((current) => ({
        ...current,
        passengers: { ...current.passengers, [index]: { ...current.passengers[index], [field.key]: error } },
      }));
    }
  }

  /** Sets the head count: passengers are added empty or taken off the end. */
  function changePassengerCount(count: number) {
    const next = Math.min(maxPassengers, Math.max(1, count));

    if (next === passengers.length) {
      return;
    }

    markStarted();
    setPassengerCountError(null);

    if (next < passengers.length) {
      setPassengerChoiceErrors({});
      setFieldErrors((current) => ({ ...current, passengers: {} }));
    }

    setPassengerOptions(Array.from({ length: next }, (_, index) => currentPassengerOptions[index] ?? EMPTY_PASSENGER_OPTIONS));
    setPassengers((current) => Array.from({ length: next }, (_, index) => current[index] ?? initialValues(passengerFields)));
    trackEvent("participants_change", {
      entity: { type: "tour", slug: trip.slug },
      metadata: { participants: next },
    });
  }

  function acceptTerms(checked: boolean) {
    setTermsAccepted(checked);
    setTermsError(null);
  }

  function acceptDataTransfer(checked: boolean) {
    setDataTransferAccepted(checked);
    setDataTransferError(null);
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

  /** A tour with departure places needs one chosen before it can be booked. */
  function validateDeparturePlace(): boolean {
    const valid = departurePlaces.length === 0 || selectedDeparturePlace !== null;

    setDeparturePlaceError(valid ? null : "Válassz felszállási helyet.");

    return valid;
  }

  /** A date with few seats left can't take more passengers than it has seats. */
  function validatePassengerCount(): boolean {
    const valid = passengers.length <= maxPassengers;

    setPassengerCountError(valid ? null : `Erre az időpontra már csak ${maxPassengers} szabad hely van.`);

    return valid;
  }

  /** Checks the whole form at once, so every error shows together. */
  function validateBeforeSubmit(): boolean {
    const passengerCountValid = validatePassengerCount();
    const departureValid = validateDeparturePlace();
    const extraChoicesValid = validateExtraChoices();
    const passengerChoicesValid = validatePassengerChoices();
    const errors: FieldErrorState = {
      form: fieldErrorsOf([...contactFields, ...extraFields], formValues),
      passengers: passengerErrorsOf(passengerFields, passengers),
    };
    const dataTransferValid = !onlinePayment || dataTransferAccepted;

    setFieldErrors(errors);
    setTermsError(termsAccepted ? null : TERMS_REQUIRED_MESSAGE);
    setDataTransferError(dataTransferValid ? null : DATA_TRANSFER_REQUIRED_MESSAGE);

    const failed = [
      ...(passengerCountValid ? [] : ["participants"]),
      ...(departureValid ? [] : ["departure_place"]),
      ...(extraChoicesValid ? [] : ["extra_choices"]),
      ...(passengerChoicesValid ? [] : ["passenger_options"]),
      ...errorFieldNames(errors),
      ...(termsAccepted ? [] : ["terms_accepted"]),
      ...(dataTransferValid ? [] : ["payment_data_transfer_accepted"]),
    ];

    funnel.trackFieldErrors(failed);

    return failed.length === 0;
  }

  /** Shows the backend's validation errors next to their fields. */
  function showServerErrors(submitError: BookingValidationError) {
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
    setDeparturePlaceError(submitError.errors.departurePlaceId?.[0] ?? null);
    setExtraChoiceError(submitError.errors.extraChoices?.[0] ?? null);
    setTermsError(submitError.errors.terms_accepted?.[0] ?? submitError.errors.termsAccepted?.[0] ?? null);
    setDataTransferError(submitError.errors.payment_data_transfer_accepted?.[0] ?? null);
    // The seats are checked again when the booking is saved; someone may have booked them meanwhile.
    setPassengerCountError(submitError.errors.tour_date_id?.[0] ?? submitError.errors.tourDateId?.[0] ?? null);
    setErrorMessage(submitError.message);
  }

  async function submit() {
    markStarted();

    if (!validateBeforeSubmit()) {
      focusFirstError();
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const tourDateId = selectedDate.id !== "default" ? selectedDate.id : null;
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
        paymentDataTransferAccepted: dataTransferAccepted,
        newsletterSubscribe,
      });

      trackEvent("booking_success", {
        entity: { type: "tour", slug: trip.slug },
        metadata: {
          booking_id: response.id,
          participants: passengers.length,
          booking_type: "tour_booking",
          online_payment: Boolean(response.paymentUrl),
        },
        ecommerce: bookingEcommerce(response.id),
      });

      clearBookingDraft(trip.slug);

      if (response.paymentUrl) {
        setStatus("redirecting");
        window.location.assign(response.paymentUrl);
        return;
      }

      setStatus("success");
    } catch (submitError) {
      setStatus("error");

      if (submitError instanceof BookingValidationError) {
        showServerErrors(submitError);
      } else if (submitError instanceof BookingApiError) {
        setErrorMessage(submitError.message);
      } else {
        setErrorMessage("Váratlan hiba történt a foglalás elküldése közben.");
      }

      focusFirstError();
      trackEvent("booking_error", {
        entity: { type: "tour", slug: trip.slug },
        metadata: { message: submitError instanceof Error ? submitError.message : "unknown_error" },
      });
    }
  }

  return {
    formRef,
    trackFieldFocus: funnel.trackFieldFocus,
    status,
    completed,
    errorMessage,

    departurePlaces,
    departurePlaceId,
    departurePlaceError,
    changeDeparturePlace,

    extras,
    selectedExtraIds,
    extraChoices,
    extraChoiceError,
    toggleExtra,
    changeExtraChoice,

    passengers,
    passengerCount,
    passengerFields,
    setPassengerValue,
    checkPassengerValue,
    changePassengerCount,
    maxPassengers,
    seatsLeftNote: seatsLeftLabel(seatsLeft),
    passengerCountError,
    reachSection,

    cardExtras,
    passengerOptions: currentPassengerOptions,
    passengerChoiceErrors,
    changePassengerOptions,
    insurances,
    travelDays: days,
    travelInsuranceAvailable,
    cancellationInsuranceAvailable,

    contactFields,
    extraFields,
    formValues,
    fieldErrors,
    setFormValue,
    checkFormValue,

    couponCode,
    setCouponCode,
    termsAccepted,
    termsError,
    acceptTerms,
    onlinePayment,
    dataTransferAccepted,
    dataTransferError,
    acceptDataTransfer,
    newsletterSubscribe,
    setNewsletterSubscribe,

    priceEstimate,
    displayedTotal,
    onlineDeposit,
    submit,
  };
}

export type TourBookingForm = ReturnType<typeof useTourBookingForm>;
