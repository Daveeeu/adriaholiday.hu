import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { SitePage, SitePageUpsertInput } from '../lib/pages.types';

const FORM_ID = 'site-page-panel-form';

const sitePageFormSchema = z
  .object({
    kind: z.enum(['page', 'text_block']),
    title: z.string().trim().min(2, 'A cím megadása kötelező.').max(255),
    slug: z
      .string()
      .trim()
      .max(255)
      .regex(/^[^/?#\s]*$/u, 'Egyetlen szakasz legyen, perjel, kérdőjel és szóköz nélkül.'),
    content: z.string(),
    seoTitle: z.string().trim().max(255),
    seoDescription: z.string().trim().max(512),
    active: z.boolean(),
  })
  .refine((values) => values.kind !== 'page' || values.slug !== '', {
    path: ['slug'],
    message: 'Az oldalnak címet (URL-t) kell adni.',
  });

type SitePageFormValues = z.infer<typeof sitePageFormSchema>;

function getFormDefaults(page?: SitePage): SitePageFormValues {
  return {
    kind: page?.kind ?? 'page',
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    content: page?.content ?? '',
    seoTitle: page?.seoTitle ?? '',
    seoDescription: page?.seoDescription ?? '',
    active: page?.active ?? false,
  };
}

type SitePageSidePanelProps = {
  open: boolean;
  page?: SitePage;
  canEdit: boolean;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SitePageUpsertInput) => void;
  onDelete?: () => void;
};

export function SitePageSidePanel({ open, page, canEdit, submitting = false, onOpenChange, onSubmit, onDelete }: SitePageSidePanelProps) {
  const form = useForm<SitePageFormValues>({
    resolver: zodResolver(sitePageFormSchema),
    defaultValues: getFormDefaults(page),
  });
  const kind = useWatch({ control: form.control, name: 'kind' });

  useEffect(() => {
    if (open) {
      form.reset(getFormDefaults(page));
    }
  }, [form, open, page]);

  return (
    <EntitySidePanel
      open={open}
      eyebrow="Oldalak"
      title={page ? (page.kind === 'page' ? 'Oldal szerkesztése' : 'Szövegblokk szerkesztése') : 'Új oldal'}
      description="Az aktív oldalak a saját címükön (pl. /autobuszaink) jelennek meg. A szövegblokkoknak nincs címük, csak tárolják a szöveget."
      widthClassName="max-w-[min(100vw,880px)]"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {page && onDelete ? (
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
            <div className="grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-end">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fajta</FormLabel>
                    <FormControl>
                      <select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" {...field}>
                        <option value="page">Oldal</option>
                        <option value="text_block">Szövegblokk</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cím</FormLabel>
                    <FormControl>
                      <Input placeholder="pl. Autóbuszaink" {...field} />
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
                    <label className="flex h-10 items-center gap-2 text-sm font-medium">
                      <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                      Megjelenik
                    </label>
                  </FormItem>
                )}
              />
            </div>

            {kind === 'page' ? (
              <>
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oldal címe (URL)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">/</span>
                          <Input placeholder="autobuszaink" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO cím (opcionális)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO leírás (opcionális)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : null}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tartalom</FormLabel>
                  <FormControl>
                    <RichTextEditor minHeight={360} allowPreview value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        </form>
      </Form>
    </EntitySidePanel>
  );
}
