import type { BookingFormField } from "../booking/booking-form-fields";

function field(key: string, label: string, fieldType: BookingFormField["fieldType"], required: boolean, description: string | null = null): BookingFormField {
  return {
    key,
    label,
    fieldType,
    inputGroup: key.startsWith("passenger_") ? "passenger" : "contact",
    options: null,
    description,
    priceLabel: null,
    visibility: required ? "required" : "optional",
  };
}

/** The apartment booking form's customer fields, as the legacy site asked them. */
export const CONTACT_FIELDS: BookingFormField[] = [
  field("contact_name", "Megrendelő neve", "text", true),
  field("contact_email", "E-mail cím", "email", true),
  field("contact_phone", "Telefonszám", "tel", false),
  field("contact_postal_code", "Irányítószám", "text", false),
  field("contact_city", "Település", "text", false),
  field("contact_address", "Utca, házszám", "text", false),
];

/** Asked for every guest. */
export const GUEST_FIELDS: BookingFormField[] = [
  field("passenger_name", "Név", "text", true),
  field("passenger_birth_date", "Születési dátum", "date", true),
  field("passenger_address", "Lakcím", "text", false),
  field("passenger_document_number", "Útiokmány száma", "text", false, "Útlevél vagy személyi igazolvány száma"),
];

export const MESSAGE_FIELD: BookingFormField = {
  ...field("message", "Egyéb kérés, közlendő", "textarea", false),
  inputGroup: "extra",
};

export function apartmentTypeField(types: string[]): BookingFormField {
  return { ...field("apartment_type", "Apartmantípus", "select", true), options: types, inputGroup: "extra" };
}

export function stayField(key: "arrival" | "departure"): BookingFormField {
  return { ...field(key, key === "arrival" ? "Érkezés" : "Távozás", "date", true), inputGroup: "extra" };
}

/** The most guests one booking form takes. */
export const MAX_GUESTS = 20;
