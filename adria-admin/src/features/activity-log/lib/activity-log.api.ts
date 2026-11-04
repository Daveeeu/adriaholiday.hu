import { apiClient } from '@/lib/api-client';

import type {
  ActivityLogFilterOptions,
  ActivityLogListResponse,
  ActivityLogQuery,
} from './activity-log.types';

export const activityLogQueryKey = ['activity-log'];

export function getActivityLog(query: ActivityLogQuery) {
  return apiClient.get<ActivityLogListResponse>('/api/admin/activity-log', {
    query,
  });
}

export function getActivityLogFilterOptions() {
  return apiClient.get<{ data: ActivityLogFilterOptions }>(
    '/api/admin/activity-log/filters',
  );
}
