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
  radio: 'Választógombok (egy választható)',
  checkbox: 'Jelölőnégyzet (igen / nem)',
};

export const BOOKING_FORM_OPTION_FIELD_TYPES: BookingFormFieldType[] = [
  'select',
  'radio',
];

export const BOOKING_FORM_INPUT_GROUP_LABELS: Record<
  BookingFormInputGroup,
  string
> = {
  contact: 'Kapcsolattartó',
  passenger: 'Utas',
  extra: 'Extra opciók és megjegyzés',
};

export const BOOKING_FORM_INPUT_GROUP_HINTS: Record<
  BookingFormInputGroup,
  string
> = {
  contact: 'a 2. lépésben, foglalásonként egyszer',
  passenger: 'a 3. lépésben, minden utasnál külön',
  extra: 'a 4. (véglegesítés) lépésben, foglalásonként egyszer',
};

export const BOOKING_FORM_VISIBILITY_LABELS: Record<
  BookingFormFieldVisibility,
  string
> = {
  required: 'Kötelező',
  optional: 'Opcionális',
  hidden: 'Rejtett',
};
