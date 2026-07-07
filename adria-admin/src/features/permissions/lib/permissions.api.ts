import { apiClient } from '@/lib/api-client';

import type { Permission } from './permissions.types';

type ResourceCollectionEnvelope<T> = {
  data: T[];
};

export async function getPermissions(): Promise<Permission[]> {
  const response = await apiClient.get<Permission[] | ResourceCollectionEnvelope<Permission>>(
    '/api/admin/permissions',
  );

  return Array.isArray(response) ? response : response.data;
}
