import { apiClient } from '@/lib/api-client';

import type {
  BookingFormField,
  BookingFormTemplate,
  BookingFormTemplateUpsertInput,
  BookingFormTemplatesListQuery,
  BookingFormTemplatesListResponse,
} from './booking-form-templates.types';

type ResourceEnvelope<T> = {
  data: T;
};

function unwrapResource<T>(response: T | ResourceEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ResourceEnvelope<T>).data;
  }

  return response as T;
}

export function getBookingFormTemplates(
  query?: BookingFormTemplatesListQuery,
): Promise<BookingFormTemplatesListResponse> {
  return apiClient.get<BookingFormTemplatesListResponse>('/api/admin/booking-form-templates', {
    query,
  });
}

export async function getAllBookingFormTemplates(): Promise<BookingFormTemplate[]> {
  const response = await getBookingFormTemplates({ page: 1, perPage: 1000 });
  return response.items;
}

export async function getBookingFormTemplateById(id: string | number): Promise<BookingFormTemplate> {
  const response = await apiClient.get<BookingFormTemplate | ResourceEnvelope<BookingFormTemplate>>(
    `/api/admin/booking-form-templates/${id}`,
  );
  return unwrapResource(response);
}

export function createBookingFormTemplate(values: BookingFormTemplateUpsertInput) {
  return apiClient
    .post<BookingFormTemplate | ResourceEnvelope<BookingFormTemplate>>('/api/admin/booking-form-templates', values)
    .then(unwrapResource);
}

export function updateBookingFormTemplate(id: string | number, values: BookingFormTemplateUpsertInput) {
  return apiClient
    .patch<BookingFormTemplate | ResourceEnvelope<BookingFormTemplate>>(
      `/api/admin/booking-form-templates/${id}`,
      values,
    )
    .then(unwrapResource);
}

export function deleteBookingFormTemplate(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/booking-form-templates/${id}`);
}

export async function getBookingFormTemplateOptions(): Promise<
  { id: string; value: string; label: string }[]
> {
  const templates = await getAllBookingFormTemplates();
  return templates.map((template) => ({
    id: String(template.id),
    value: String(template.id),
    label: template.name,
  }));
}

export async function getBookingFormFields(): Promise<BookingFormField[]> {
  const response = await apiClient.get<BookingFormField[] | { data: BookingFormField[] }>(
    '/api/admin/booking-form-fields',
  );
  return Array.isArray(response) ? response : response.data;
}
