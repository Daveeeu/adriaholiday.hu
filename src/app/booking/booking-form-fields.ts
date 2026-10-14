export type BookingFieldVisibility = "required" | "optional";

/**
 * contact: asked once on the contact step.
 * passenger: asked for every passenger.
 * extra: asked once on the final step (extra options, note, consents).
 */
export type BookingFieldGroup = "contact" | "passenger" | "extra";

export type BookingFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "radio"
  | "checkbox";

/**
 * A visible field of a tour's booking form, as resolved by the backend
 * (tour template, default template or built-in default form).
 */
export type BookingFormField = {
  key: string;
  label: string;
  fieldType: BookingFieldType;
  inputGroup: BookingFieldGroup;
  options: string[] | null;
  /** Options listed but not selectable yet ("Fejlesztés alatt"). */
  disabledOptions?: string[];
  description: string | null;
  priceLabel: string | null;
  visibility: BookingFieldVisibility;
};

export type BookingFieldValues = Record<string, string>;

export type BookingFieldErrors = Record<string, string>;

/** Value the backend expects for a ticked checkbox; unticked sends nothing. */
export const CHECKBOX_CHECKED_VALUE = "Igen";

export function fieldsOfGroup(fields: BookingFormField[], group: BookingFieldGroup): BookingFormField[] {
  return fields.filter((field) => field.inputGroup === group);
}

export function selectableOptions(field: BookingFormField): string[] {
  const disabled = field.disabledOptions ?? [];

  return (field.options ?? []).filter((option) => !disabled.includes(option));
}

/**
 * Starting values of the given fields: empty, except a radio field with a single
 * selectable option, which starts with that option chosen.
 */
export function initialValues(fields: BookingFormField[]): BookingFieldValues {
  return Object.fromEntries(
    fields.map((field) => {
      const selectable = field.fieldType === "radio" ? selectableOptions(field) : [];

      return [field.key, selectable.length === 1 ? selectable[0] : ""];
    }),
  );
}

/** The backend accepts at most this many characters per field. */
export const FIELD_MAX_LENGTH = 500;

/** Phone numbers: digits with the usual separators, 8–15 digits in all. */
const PHONE_PATTERN = /^\+?[\d\s()/.-]+$/;
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 15;
/** Hungarian (1051) and foreign postal codes (945 01, SW1A 1AA) alike. */
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** A first word starting with a letter, then at least one more word. */
const FULL_NAME_PATTERN = /\p{L}\S*\s+\S/u;
/** The oldest birth date accepted, in years before today. */
const MAX_AGE_YEARS = 120;

export function isBirthDateField(field: BookingFormField): boolean {
  return field.fieldType === "date" && field.key.includes("birth");
}

/** Today as YYYY-MM-DD in the visitor's time zone, as date inputs hold it. */
export function todayDateString(): string {
  const now = new Date();

  return localDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

export function oldestBirthDateString(): string {
  const now = new Date();

  return localDateString(now.getFullYear() - MAX_AGE_YEARS, now.getMonth(), now.getDate());
}

function localDateString(year: number, monthIndex: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * The error of one field's value, or null when it is fine: required fields
 * filled in, values matching their type and the well-known fields' formats.
 * Mirrors the backend's BookingFormValidationService, messages included.
 */
export function fieldError(field: BookingFormField, rawValue: string | undefined): string | null {
  const value = (rawValue ?? "").trim();

  if (value === "") {
    if (field.visibility !== "required") {
      return null;
    }

    return field.fieldType === "checkbox"
      ? `A(z) "${field.label}" bejelölése kötelező.`
      : `A(z) "${field.label}" mező megadása kötelező.`;
  }

  if (field.fieldType === "email" && !EMAIL_PATTERN.test(value)) {
    return "Adj meg érvényes e-mail címet (pl. nev@example.hu).";
  }

  if (field.fieldType === "tel") {
    const digits = value.replace(/\D/g, "").length;

    if (!PHONE_PATTERN.test(value) || digits < PHONE_MIN_DIGITS || digits > PHONE_MAX_DIGITS) {
      return "Adj meg érvényes telefonszámot (pl. +36 30 123 4567).";
    }
  }

  if (field.fieldType === "number" && !Number.isFinite(Number(value))) {
    return `A(z) "${field.label}" mezőbe számot adj meg.`;
  }

  if (field.fieldType === "date") {
    if (!isValidDate(value)) {
      return "Adj meg érvényes dátumot.";
    }

    if (isBirthDateField(field)) {
      if (value > todayDateString()) {
        return "A születési dátum nem lehet a jövőben.";
      }

      if (value < oldestBirthDateString()) {
        return "Ellenőrizd a születési dátumot.";
      }
    }
  }

  if (field.key.endsWith("_name") && !FULL_NAME_PATTERN.test(value)) {
    return "Add meg a teljes nevet (vezeték- és keresztnevet).";
  }

  if (field.key.endsWith("postal_code") && !POSTAL_CODE_PATTERN.test(value)) {
    return "Adj meg érvényes irányítószámot.";
  }

  return null;
}

export function fieldErrorsOf(fields: BookingFormField[], values: BookingFieldValues): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  fields.forEach((field) => {
    const error = fieldError(field, values[field.key]);

    if (error !== null) {
      errors[field.key] = error;
    }
  });

  return errors;
}
