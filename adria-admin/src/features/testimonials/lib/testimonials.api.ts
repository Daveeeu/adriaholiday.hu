import { apiClient } from '@/lib/api-client';

import type {
  Testimonial,
  TestimonialUpsertInput,
  TestimonialsListQuery,
  TestimonialsListResponse,
} from './testimonials.types';

type ResourceEnvelope<T> = { data: T };

export const testimonialsQueryKey = ['testimonials'];

export function getTestimonials(query?: TestimonialsListQuery) {
  return apiClient.get<TestimonialsListResponse>('/api/admin/testimonials', { query });
}

export function createTestimonial(values: TestimonialUpsertInput) {
  return apiClient.post<ResourceEnvelope<Testimonial>>('/api/admin/testimonials', values);
}

export function updateTestimonial(id: number, values: TestimonialUpsertInput) {
  return apiClient.patch<ResourceEnvelope<Testimonial>>(`/api/admin/testimonials/${id}`, values);
}

export function deleteTestimonial(id: number) {
  return apiClient.delete<void>(`/api/admin/testimonials/${id}`);
}
