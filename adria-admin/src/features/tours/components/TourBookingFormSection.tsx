import { useQuery } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import {
  getAllBookingFormTemplates,
  getBookingFormTemplateOptions,
} from '@/features/booking-form-templates/lib/booking-form-templates.api';
import {
  BOOKING_FORM_INPUT_GROUP_LABELS,
  BOOKING_FORM_VISIBILITY_LABELS,
} from '@/features/booking-form-templates/lib/booking-form.constants';

import type { TourFormValues } from '../lib/tours.types';
import { TourCreatableSelectField } from './TourCreatableSelectField';

type TourBookingFormSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

/** The booking form template the tour's public booking form asks its fields by. */
export function TourBookingFormSection({ form }: TourBookingFormSectionProps) {
  const bookingFormTemplateId = useWatch({
    control: form.control,
    name: 'bookingFormTemplateId',
  });

  const { data: bookingFormTemplates = [] } = useQuery({
    queryKey: ['tour-select-options', 'booking-form-templates-detail'],
    queryFn: getAllBookingFormTemplates,
  });

  const selectedTemplate = bookingFormTemplates.find(
    (template) => String(template.id) === bookingFormTemplateId,
  );
  const defaultTemplate = bookingFormTemplates.find(
    (template) => template.isDefault && template.active,
  );
  const previewTemplate = selectedTemplate ?? defaultTemplate;

  return (
    <div className="space-y-4">
      <TourCreatableSelectField
        control={form.control}
        name="bookingFormTemplateId"
        label="Foglalási űrlap sablon"
        placeholder="Buszos út, Repülős út vagy egyedi sablon..."
        queryKey={['tour-select-options', 'booking-form-templates']}
        queryFn={getBookingFormTemplateOptions}
        fallbackOptions={bookingFormTemplates.map((template) => ({
          id: String(template.id),
          value: String(template.id),
          label: template.active ? template.name : `${template.name} (inaktív)`,
        }))}
        description="A sablonokat a Foglalások / Foglalási űrlap sablonok oldalon lehet létrehozni és szerkeszteni. A listában csak az aktív sablonok választhatók."
      />

      {!selectedTemplate ? (
        <p className="text-sm text-muted-foreground">
          {defaultTemplate
            ? `Nincs sablon kiválasztva – az alapértelmezett sablon (${defaultTemplate.name}) mezői jelennek meg.`
            : 'Nincs sablon kiválasztva, és alapértelmezett sablon sincs beállítva – a beépített alap mezők jelennek meg.'}
        </p>
      ) : null}

      {previewTemplate ? (
        <div className="rounded-xl border bg-background p-3">
          <div className="text-sm font-medium text-foreground">
            Mezők előnézete – {previewTemplate.name}
          </div>
          <div className="mt-3 space-y-2">
            {previewTemplate.fields
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{field.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {BOOKING_FORM_INPUT_GROUP_LABELS[field.inputGroup]}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                      field.visibility === 'required' &&
                        'bg-emerald-100 text-emerald-700',
                      field.visibility === 'optional' &&
                        'bg-sky-100 text-sky-700',
                      field.visibility === 'hidden' &&
                        'bg-slate-100 text-slate-500',
                    )}
                  >
                    {BOOKING_FORM_VISIBILITY_LABELS[field.visibility]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
