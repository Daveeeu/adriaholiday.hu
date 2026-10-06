import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { Testimonial, TestimonialUpsertInput } from '../lib/testimonials.types';

const FORM_ID = 'testimonial-panel-form';

const testimonialFormSchema = z.object({
  title: z.string().trim().min(2, 'A cím megadása kötelező.').max(255),
  author: z.string().trim().max(255),
  body: z.string().trim().min(1, 'A levél szövege kötelező.'),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Adj meg egy dátumot.'),
  active: z.boolean(),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

function getFormDefaults(testimonial?: Testimonial): TestimonialFormValues {
  return {
    title: testimonial?.title ?? '',
    author: testimonial?.author ?? '',
    body: testimonial?.body ?? '',
    publishedAt: (testimonial?.publishedAt ?? new Date().toISOString()).slice(0, 10),
    active: testimonial?.active ?? true,
  };
}

type TestimonialSidePanelProps = {
  open: boolean;
  testimonial?: Testimonial;
  canEdit: boolean;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TestimonialUpsertInput) => void;
  onDelete?: () => void;
};

export function TestimonialSidePanel({
  open,
  testimonial,
  canEdit,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: TestimonialSidePanelProps) {
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: getFormDefaults(testimonial),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFormDefaults(testimonial));
    }
  }, [form, open, testimonial]);

  return (
    <EntitySidePanel
      open={open}
      eyebrow="Rólunk írták"
      title={testimonial ? 'Levél szerkesztése' : 'Új levél'}
      description="Utasaink levelei és élménybeszámolói. Az aktív levelek közül a legfrissebbek a főoldalon is megjelennek."
      widthClassName="max-w-[min(100vw,820px)]"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {testimonial && onDelete ? (
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
        <form
          id={FORM_ID}
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
        >
          <fieldset disabled={!canEdit} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cím</FormLabel>
                  <FormControl>
                    <Input placeholder="pl. Bosznia 2026.05.07–10." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-[1fr_200px_auto] md:items-end">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aláírás (opcionális)</FormLabel>
                    <FormControl>
                      <Input placeholder="pl. B. Istvánné" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dátum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                      Megjelenik
                    </label>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>A levél szövege</FormLabel>
                  <FormControl>
                    <RichTextEditor minHeight={320} allowPreview value={field.value} onChange={field.onChange} />
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
