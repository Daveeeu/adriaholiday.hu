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

export function emptyValues(fields: BookingFormField[]): BookingFieldValues {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

export function requiredFieldErrors(fields: BookingFormField[], values: BookingFieldValues): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  fields.forEach((field) => {
    if (field.visibility === "required" && !(values[field.key] ?? "").trim()) {
      errors[field.key] =
        field.fieldType === "checkbox"
          ? `A(z) "${field.label}" bejelölése kötelező.`
          : `A(z) "${field.label}" mező megadása kötelező.`;
    }
  });

  return errors;
}
