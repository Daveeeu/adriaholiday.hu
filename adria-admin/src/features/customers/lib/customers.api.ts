import { apiClient } from '@/lib/api-client';

import type { Customer, CustomerUpsertInput, CustomersListQuery, CustomersListResponse } from './customers.types';

type ResourceEnvelope<T> = { data: T };

export const customersQueryKey = ['customers'];

export function getCustomers(query?: CustomersListQuery) {
  return apiClient.get<CustomersListResponse>('/api/admin/customers', { query });
}

export function createCustomer(values: CustomerUpsertInput) {
  return apiClient.post<ResourceEnvelope<Customer>>('/api/admin/customers', values);
}

export function updateCustomer(id: string, values: CustomerUpsertInput) {
  return apiClient.patch<ResourceEnvelope<Customer>>(`/api/admin/customers/${id}`, values);
}

export function deleteCustomer(id: string) {
  return apiClient.delete<void>(`/api/admin/customers/${id}`);
}
