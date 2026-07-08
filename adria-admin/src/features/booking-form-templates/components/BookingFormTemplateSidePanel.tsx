import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
  getBookingFormTemplateFormDefaults,
  type BookingFormField,
  type BookingFormFieldVisibility,
  type BookingFormTemplate,
  type BookingFormTemplateFormValues,
  type BookingFormTemplateUpsertInput,
} from '../lib/booking-form-templates.types';

const visibilityLabels: Record<BookingFormFieldVisibility, string> = {
  required: 'Kötelező',
  optional: 'Opcionális',
  hidden: 'Rejtett',
};

const templateFormSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  slug: z.string().trim(),
  description: z.string(),
  active: z.boolean(),
  fields: z.array(
    z.object({
      fieldId: z.union([z.string(), z.number()]),
      visibility: z.enum(['required', 'optional', 'hidden']),
      sortOrder: z.number(),
    }),
  ),
});

type BookingFormTemplateSidePanelProps = {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  template?: BookingFormTemplate;
  fields: BookingFormField[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BookingFormTemplateUpsertInput) => void;
  onDelete?: () => void;
};

function VisibilityBadge({ visibility }: { visibility: BookingFormFieldVisibility }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        visibility === 'required' && 'bg-emerald-100 text-emerald-700',
        visibility === 'optional' && 'bg-sky-100 text-sky-700',
        visibility === 'hidden' && 'bg-slate-100 text-slate-500',
      )}
    >
      {visibilityLabels[visibility]}
    </span>
  );
}

function BookingFormTemplateDetailView({ template }: { template: BookingFormTemplate }) {
  const sortedFields = template.fields.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.slug}</p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              template.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
            )}
          >
            {template.active ? 'Aktív' : 'Inaktív'}
          </span>
        </div>
        {template.description ? (
          <p className="text-sm text-muted-foreground">{template.description}</p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-4">
        <h4 className="font-semibold">Mezők előnézete</h4>
        <div className="space-y-2">
          {sortedFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between rounded-xl border bg-background px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium">{field.label}</div>
                <div className="text-xs text-muted-foreground">
                  {field.inputGroup === 'contact' ? 'Kapcsolattartó' : 'Utas'} · {field.fieldType}
                </div>
              </div>
              <VisibilityBadge visibility={field.visibility} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function BookingFormTemplateSidePanel({
  open,
  mode,
  template,
  fields,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: BookingFormTemplateSidePanelProps) {
  const form = useForm<BookingFormTemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: getBookingFormTemplateFormDefaults(template, fields),
  });

  const { fields: fieldRows, move } = useFieldArray({ control: form.control, name: 'fields' });

  useEffect(() => {
    if (open) {
      form.reset(getBookingFormTemplateFormDefaults(template, fields));
    }
  }, [fields, form, open, template]);

  const title =
    mode === 'create'
      ? 'Foglalási űrlap sablon hozzáadása'
      : mode === 'edit'
        ? 'Foglalási űrlap sablon szerkesztése'
        : 'Foglalási űrlap sablon részletei';

  const fieldCatalogById = new Map(fields.map((field) => [String(field.id), field]));

  const moveField = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fieldRows.length) {
      return;
    }

    move(index, targetIndex);
    form.setValue(
      'fields',
      form.getValues('fields').map((field, idx) => ({ ...field, sortOrder: idx + 1 })),
      { shouldDirty: true },
    );
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Bezárás"
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[min(100vw,900px)] flex-col bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'detail'
                ? 'A sablon teljes előnézete.'
                : 'Add meg a sablon nevét, majd állítsd be mezőnként, hogy kötelező, opcionális vagy rejtett legyen a foglalási űrlapon.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'detail' && template && onDelete ? (
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                Törlés
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-6 py-5">
            {mode === 'detail' && template ? (
              <BookingFormTemplateDetailView template={template} />
            ) : (
              <Form {...form}>
                <form
                  className="flex min-h-full flex-col gap-5"
                  onSubmit={form.handleSubmit((values) => onSubmit(values))}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sablon neve</FormLabel>
                          <FormControl>
                            <Input placeholder="pl. Buszos út" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="buszos-ut (üresen automatikus)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leírás</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} />
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
                        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                          />
                          Aktív
                        </label>
                      </FormItem>
                    )}
                  />

                  <section className="rounded-2xl border bg-card p-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Mezők
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Állítsd be mezőnként a láthatóságot, és nyilakkal rendezd a sorrendet.
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {fieldRows.map((row, index) => {
                        const catalogField = fieldCatalogById.get(String(row.fieldId));

                        if (!catalogField) {
                          return null;
                        }

                        return (
                          <div
                            key={row.id}
                            className="flex flex-col gap-2 rounded-xl border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium">{catalogField.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {catalogField.inputGroup === 'contact' ? 'Kapcsolattartó' : 'Utas'} ·{' '}
                                {catalogField.fieldType}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`fields.${index}.visibility` as const}
                                render={({ field }) => (
                                  <Select value={field.value} onChange={field.onChange}>
                                    <option value="required">Kötelező</option>
                                    <option value="optional">Opcionális</option>
                                    <option value="hidden">Rejtett</option>
                                  </Select>
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => moveField(index, -1)}
                                disabled={index === 0}
                              >
                                <ArrowUp className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => moveField(index, 1)}
                                disabled={index === fieldRows.length - 1}
                              >
                                <ArrowDown className="size-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <div className="sticky bottom-0 mt-2 border-t bg-background/95 py-4 backdrop-blur">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      {mode === 'edit' && onDelete ? (
                        <Button type="button" variant="destructive" onClick={onDelete} disabled={submitting}>
                          <Trash2 className="size-4" />
                          Törlés
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                      >
                        Mégse
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        Mentés
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
