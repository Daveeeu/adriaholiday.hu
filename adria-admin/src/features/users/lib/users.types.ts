import { z } from 'zod';

export type AdminUser = {
  id: string | number;
  name: string;
  email: string;
  initials: string;
  isActive: boolean;
  roles: string[];
  directPermissions: string[];
  deniedPermissions: string[];
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserListQuery = {
  page: number;
  perPage: number;
  search?: string;
  role?: string;
  isActive?: 'all' | 'true' | 'false';
};

export type UserListResponse = {
  items: AdminUser[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type UserUpsertInput = {
  name: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  deniedPermissions: string[];
};

const baseUserFormSchema = z.object({
  name: z.string().trim().min(1, 'A név megadása kötelező.').max(255),
  email: z.string().trim().email('Érvénytelen email cím.').max(255),
  password: z.string().min(8, 'Legalább 8 karakter szükséges.').optional().or(z.literal('')),
  passwordConfirmation: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  deniedPermissions: z.array(z.string()),
});

export const userFormSchema = baseUserFormSchema.refine(
  (values) => !values.password || values.password === values.passwordConfirmation,
  { message: 'A jelszavak nem egyeznek.', path: ['passwordConfirmation'] },
);

export type UserFormValues = z.infer<typeof baseUserFormSchema>;

export function getUserFormDefaults(user?: AdminUser): UserFormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    passwordConfirmation: '',
    isActive: user?.isActive ?? true,
    roles: user?.roles ?? [],
    permissions: user?.directPermissions ?? [],
    deniedPermissions: user?.deniedPermissions ?? [],
  };
}

export function normalizeUserFormValues(values: UserFormValues): UserUpsertInput {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password || undefined,
    passwordConfirmation: values.passwordConfirmation || undefined,
    isActive: values.isActive,
    roles: values.roles,
    permissions: values.permissions,
    deniedPermissions: values.deniedPermissions,
  };
}
