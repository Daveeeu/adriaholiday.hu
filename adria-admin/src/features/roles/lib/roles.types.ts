import { z } from 'zod';

export type Role = {
  id: string | number;
  name: string;
  permissions: string[];
  permissionsCount: number;
  usersCount: number;
  isSystemRole: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RoleListQuery = {
  page: number;
  perPage: number;
  search?: string;
};

export type RoleListResponse = {
  items: Role[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type RoleUpsertInput = {
  name: string;
  permissions: string[];
};

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, 'A megnevezés megadása kötelező.').max(255),
  permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export function getRoleFormDefaults(role?: Role): RoleFormValues {
  return {
    name: role?.name ?? '',
    permissions: role?.permissions ?? [],
  };
}
