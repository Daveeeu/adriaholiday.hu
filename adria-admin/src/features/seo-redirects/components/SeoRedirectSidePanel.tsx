import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { SeoRedirect, SeoRedirectUpsertInput } from '../lib/seo-redirects.types';

const FORM_ID = 'seo-redirect-panel-form';

const seoRedirectFormSchema = z.object({
  sourcePath: z.string().trim().min(2, 'Add meg a régi címet.').max(512),
  target: z
    .string()
    .trim()
    .max(1024)
    .regex(/^(\/|https?:\/\/)/i, 'A cél egy "/"-rel kezdődő oldalcím vagy egy teljes http(s) cím legyen.'),
  active: z.boolean(),
});

type SeoRedirectFormValues = z.infer<typeof seoRedirectFormSchema>;

function getFormDefaults(redirect?: SeoRedirect): SeoRedirectFormValues {
  return {
    sourcePath: redirect?.sourcePath ?? '/',
    target: redirect?.target ?? '/',
    active: redirect?.active ?? true,
  };
}

type SeoRedirectSidePanelProps = {
  open: boolean;
  redirect?: SeoRedirect;
  canEdit: boolean;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SeoRedirectUpsertInput) => void;
  onDelete?: () => void;
};

export function SeoRedirectSidePanel({ open, redirect, canEdit, submitting = false, onOpenChange, onSubmit, onDelete }: SeoRedirectSidePanelProps) {
  const form = useForm<SeoRedirectFormValues>({
    resolver: zodResolver(seoRedirectFormSchema),
    defaultValues: getFormDefaults(redirect),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormDefaults(redirect));
    }
  }, [form, open, redirect]);

  return (
    <EntitySidePanel
      open={open}
      eyebrow="SEO átirányítások"
      title={redirect ? 'Átirányítás szerkesztése' : 'Új átirányítás'}
      description="Ha a régi címen nincs oldal, a látogató tartós (301) átirányítással a célra kerül. A módosított átirányítást a régi oldal újabb importja nem írja felül."
      widthClassName="max-w-[min(100vw,640px)]"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {redirect && onDelete ? (
            <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          {canEdit ? (
            <Button type="submit" form={FORM_ID} disabled={submitting}>
              Mentés
            </Button>
          ) : null}
        </div>
      }
    >
      <Form {...form}>
        <form id={FORM_ID} className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
          <fieldset disabled={!canEdit} className="space-y-5">
            <FormField
              control={form.control}
              name="sourcePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Régi cím</FormLabel>
                  <FormControl>
                    <Input placeholder="/apartman/regi-apartman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cél</FormLabel>
                  <FormControl>
                    <Input placeholder="/ajanlat/uj-ajanlat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                    Aktív
                  </label>
                </FormItem>
              )}
            />
          </fieldset>
        </form>
      </Form>
    </EntitySidePanel>
  );
}
