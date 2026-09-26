export type BookingFormFieldVisibility = 'required' | 'optional' | 'hidden';

export type BookingFormInputGroup = 'contact' | 'passenger' | 'extra';

export type BookingFormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'date'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox';

export type BookingFormField = {
  id: string | number;
  key: string;
  label: string;
  description: string | null;
  priceLabel: string | null;
  fieldType: BookingFormFieldType;
  inputGroup: BookingFormInputGroup;
  sortOrder: number;
  options: string[] | null;
  isSystem: boolean;
};

export type BookingFormFieldUpsertInput = {
  label: string;
  description: string;
  priceLabel: string;
  fieldType: BookingFormFieldType;
  inputGroup: BookingFormInputGroup;
  options: string[];
};

export type BookingFormTemplateField = {
  id: string | number;
  fieldId: string | number;
  key: string;
  label: string;
  fieldType: BookingFormFieldType;
  inputGroup: BookingFormInputGroup;
  options: string[] | null;
  description: string | null;
  priceLabel: string | null;
  visibility: BookingFormFieldVisibility;
  sortOrder: number;
};

export type BookingFormTemplate = {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  isDefault: boolean;
  fields: BookingFormTemplateField[];
  createdAt: string;
  updatedAt: string;
};

export type BookingFormTemplateFieldInput = {
  fieldId: string | number;
  visibility: BookingFormFieldVisibility;
  sortOrder: number;
};

export type BookingFormTemplateFormValues = {
  name: string;
  slug: string;
  description: string;
  active: boolean;
  isDefault: boolean;
  fields: BookingFormTemplateFieldInput[];
};

export type BookingFormTemplateUpsertInput = BookingFormTemplateFormValues;

export type BookingFormTemplatesListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  active?: 'true' | 'false';
};

export type BookingFormTemplatesListResponse = {
  items: BookingFormTemplate[];
  totalCount: number;
  page: number;
  perPage: number;
};

export function getBookingFormTemplateFormDefaults(
  template: BookingFormTemplate | undefined,
  allFields: BookingFormField[],
): BookingFormTemplateFormValues {
  const existingByFieldId = new Map(
    (template?.fields ?? []).map((field) => [String(field.fieldId), field]),
  );

  const fields: BookingFormTemplateFieldInput[] = allFields
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((field, index) => {
      const existing = existingByFieldId.get(String(field.id));

      return {
        fieldId: field.id,
        visibility: existing?.visibility ?? 'hidden',
        sortOrder: existing?.sortOrder ?? index + 1,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    name: template?.name ?? '',
    slug: template?.slug ?? '',
    description: template?.description ?? '',
    active: template?.active ?? true,
    isDefault: template?.isDefault ?? false,
    fields,
  };
}
