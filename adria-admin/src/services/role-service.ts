export {
  createRole,
  deleteRole,
  getAllRoles,
  getRoles,
  updateRole,
} from '@/features/roles/lib/roles.api';

export type { Role, RoleListQuery, RoleListResponse, RoleUpsertInput } from '@/features/roles/lib/roles.types';
