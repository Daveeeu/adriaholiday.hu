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

import {
  getRoleFormDefaults,
  roleFormSchema,
  type Role,
  type RoleFormValues,
  type RoleUpsertInput,
} from '../lib/roles.types';

type RoleSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoleUpsertInput) => void;
  onDelete?: () => void;
};

export function RoleSidePanel({
  open,
  mode,
  role,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: RoleSidePanelProps) {
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: getRoleFormDefaults(role),
  });

  const selectedPermissions = useWatch({ control: form.control, name: 'permissions' }) ?? [];

  useEffect(() => {
    if (open) {
      form.reset(getRoleFormDefaults(role));
    }
  }, [form, open, role]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Role szerkesztése' : 'Új role létrehozása';
  const isSystemRole = role?.isSystemRole ?? false;

  return (
    <EntitySidePanel
      open={open}
      title={title}
      description="Adja meg a role nevét és jelölje ki a hozzá tartozó jogosultságokat."
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {mode === 'edit' && onDelete && !isSystemRole ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Mégse
          </Button>
          <Button type="submit" disabled={submitting} form="role-panel-form">
            Mentés
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id="role-panel-form"
          className="flex min-h-full flex-col gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Megnevezés</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSystemRole} placeholder="pl. Marketing" />
                </FormControl>
                {isSystemRole ? (
                  <p className="text-xs text-muted-foreground">
                    Ez egy rendszer role, a neve nem módosítható.
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Jogosultságok
            </h3>
            <div className="mt-4">
              <PermissionCheckboxGroup
                permissions={permissions}
                selected={selectedPermissions}
                onChange={(next) => form.setValue('permissions', next, { shouldDirty: true })}
              />
            </div>
          </section>
        </form>
      </Form>
    </EntitySidePanel>
  );
}
