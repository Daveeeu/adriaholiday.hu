import { apiClient } from '@/lib/api-client';

import type {
  PortfolioFilterChip,
  PortfolioFilterChipListQuery,
  PortfolioFilterChipListResponse,
  PortfolioFilterChipUpsertInput,
} from './portfolio-filter-chips.types';

export function getPortfolioFilterChips(query?: PortfolioFilterChipListQuery) {
  return apiClient.get<PortfolioFilterChipListResponse>('/api/admin/portfolio-filter-chips', {
    query,
  });
}

export function createPortfolioFilterChip(values: PortfolioFilterChipUpsertInput) {
  return apiClient.post<PortfolioFilterChip>('/api/admin/portfolio-filter-chips', values);
}

export function updatePortfolioFilterChip(
  id: string | number,
  values: PortfolioFilterChipUpsertInput,
) {
  return apiClient.patch<PortfolioFilterChip>(`/api/admin/portfolio-filter-chips/${id}`, values);
}

export function deletePortfolioFilterChip(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/portfolio-filter-chips/${id}`);
}
