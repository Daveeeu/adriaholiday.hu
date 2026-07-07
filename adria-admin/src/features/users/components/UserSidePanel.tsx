import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { PermissionCheckboxGroup } from '@/components/admin/permission-checkbox-group';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getPermissions } from '@/features/permissions/lib/permissions.api';
import { getAllRoles } from '@/features/roles/lib/roles.api';

import {
  getUserFormDefaults,
  normalizeUserFormValues,
  userFormSchema,
  type AdminUser,
  type UserFormValues,
  type UserUpsertInput,
} from '../lib/users.types';

type UserSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit';
  user?: AdminUser;
  currentUserId?: string | number;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserUpsertInput) => void;
  onDeactivate?: () => void;
};

export function UserSidePanel({
  open,
  mode,
  user,
  currentUserId,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDeactivate,
}: UserSidePanelProps) {
  const { data: roles = [] } = useQuery({ queryKey: ['roles', 'all'], queryFn: getAllRoles });
  const { data: permissions = [] } = useQuery({ queryKey: ['permissions'], queryFn: getPermissions });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: getUserFormDefaults(user),
  });

  const selectedRoles = useWatch({ control: form.control, name: 'roles' }) ?? [];
  const grantedPermissions = useWatch({ control: form.control, name: 'permissions' }) ?? [];
  const deniedPermissions = useWatch({ control: form.control, name: 'deniedPermissions' }) ?? [];

  useEffect(() => {
    if (open) {
      form.reset(getUserFormDefaults(user));
    }
  }, [form, open, user]);

  if (!open) return null;

  const isSelf = user !== undefined && currentUserId !== undefined && user.id === currentUserId;
  const title = mode === 'edit' ? 'Felhasználó szerkesztése' : 'Új felhasználó létrehozása';

  return (
    <EntitySidePanel
      open={open}
      title={title}
      description="Alapadatok, szerepkörök és egyedi jogosultságok kezelése."
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {mode === 'edit' && onDeactivate && !isSelf ? (
            <Button type="button" variant="destructive" onClick={onDeactivate} disabled={submitting}>
              <Trash2 className="size-4" />
              Deaktiválás
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Mégse
          </Button>
          <Button type="submit" disabled={submitting} form="user-panel-form">
            Mentés
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="user-panel-form"
          className="flex min-h-full flex-col gap-5"
          onSubmit={form.handleSubmit((values) => onSubmit(normalizeUserFormValues(values)))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Név</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mode === 'edit' ? 'Új jelszó (opcionális)' : 'Jelszó'}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jelszó megerősítése</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    disabled={isSelf}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  Aktív felhasználó
                </label>
                {isSelf ? (
                  <p className="text-xs text-muted-foreground">
                    Saját fiók nem deaktiválható.
                  </p>
                ) : null}
              </FormItem>
            )}
          />

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Szerepkörök
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {roles.map((role) => (
                <label key={role.name} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.name)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...selectedRoles, role.name]
                        : selectedRoles.filter((name) => name !== role.name);
                      form.setValue('roles', next, { shouldDirty: true });
                    }}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Direkt jogosultság hozzáadása
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A szerepkörön felül, kifejezetten ennek a felhasználónak adott jogosultságok.
            </p>
            <div className="mt-4">
              <PermissionCheckboxGroup
                permissions={permissions}
                selected={grantedPermissions}
                onChange={(next) => form.setValue('permissions', next, { shouldDirty: true })}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Direkt jogosultság tiltása
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ezek a jogosultságok akkor is le vannak tiltva, ha a szerepkör megadná őket.
            </p>
            <div className="mt-4">
              <PermissionCheckboxGroup
                permissions={permissions}
                selected={deniedPermissions}
                onChange={(next) => form.setValue('deniedPermissions', next, { shouldDirty: true })}
              />
            </div>
          </section>
        </form>
      </Form>
    </EntitySidePanel>
  );
}
