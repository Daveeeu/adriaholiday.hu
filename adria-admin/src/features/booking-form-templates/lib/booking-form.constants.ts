import type {
  BookingFormFieldType,
  BookingFormFieldVisibility,
  BookingFormInputGroup,
} from './booking-form-templates.types';

export const BOOKING_FORM_FIELD_TYPE_LABELS: Record<
  BookingFormFieldType,
  string
> = {
  text: 'Szöveg',
  textarea: 'Hosszú szöveg',
  email: 'E-mail',
  tel: 'Telefonszám',
  date: 'Dátum',
  number: 'Szám',
  select: 'Legördülő lista',
};

export const BOOKING_FORM_INPUT_GROUP_LABELS: Record<
  BookingFormInputGroup,
  string
> = {
  contact: 'Kapcsolattartó',
  passenger: 'Utas',
};

export const BOOKING_FORM_VISIBILITY_LABELS: Record<
  BookingFormFieldVisibility,
  string
> = {
  required: 'Kötelező',
  optional: 'Opcionális',
  hidden: 'Rejtett',
};
