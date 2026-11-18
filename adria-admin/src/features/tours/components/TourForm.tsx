import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  TOUR_FORM_SECTIONS,
  type TourFormSectionKey,
} from '../lib/tour-form-sections';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourBookingFormSection } from './TourBookingFormSection';
import { TourContentSections } from './TourContentSections';
import { TourDatesSection } from './TourDatesSection';
import { TourFieldHelp, TourFormLabel } from './TourFieldHelp';
import { TourFilterSections } from './TourFilterSections';
import { TourGallerySection } from './TourGallerySection';
import { TourPartnerXmlSection } from './TourPartnerXmlSection';
import { TourPriceBoxSection } from './TourPriceBoxSection';
import { TourPriceItemsSection } from './TourPriceItemsSection';
import { TourProgramDaysSection } from './TourProgramDaysSection';
import { TourRouteMapSection } from './TourRouteMapSection';
import { TourSeoSection } from './TourSeoSection';
import { TourStaySection } from './TourStaySection';

type TourFormProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
  section: TourFormSectionKey;
};

type BooleanFieldName = 'active' | 'listed' | 'xmlEnabled' | 'couponable';

const BOOLEAN_FIELDS: Array<{ name: BooleanFieldName; label: string }> = [
  { name: 'active', label: 'Aktív' },
  { name: 'listed', label: 'Megjelenik az ajánlatlistákban' },
  { name: 'xmlEnabled', label: 'Megjelenik a partnerportálokon' },
  { name: 'couponable', label: 'Kuponozható' },
];

function TourBasicsSection({ form }: { form: UseFormReturn<TourFormValues> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {BOOLEAN_FIELDS.map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/40">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  <span className="flex-1">{label}</span>
                  <TourFieldHelp name={name} />
                </label>
              </FormItem>
            )}
          />
        ))}
      </div>

      <FormField
        control={form.control}
        name="sortOrder"
        render={({ field }) => (
          <FormItem className="max-w-40">
            <TourFormLabel>Sorrend</TourFormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/** The form of the section the editor's menu has open. */
export function TourForm({ form, tour, section }: TourFormProps) {
  const meta =
    TOUR_FORM_SECTIONS.find((item) => item.key === section) ??
    TOUR_FORM_SECTIONS[0];
  const tourId = tour?.id ? String(tour.id) : undefined;

  const content: Record<TourFormSectionKey, () => ReactNode> = {
    basic: () => <TourBasicsSection form={form} />,
    seo: () => <TourSeoSection form={form} />,
    gallery: () => <TourGallerySection form={form} />,
    priceBox: () => <TourPriceBoxSection form={form} />,
    dates: () => <TourDatesSection form={form} tour={tour} />,
    priceItems: () => <TourPriceItemsSection form={form} />,
    descriptions: () => (
      <TourContentSections form={form} group="descriptions" />
    ),
    programText: () => <TourContentSections form={form} group="programText" />,
    programDays: () => <TourProgramDaysSection form={form} />,
    routeMap: () => <TourRouteMapSection form={form} tourId={tourId} />,
    stay: () => <TourStaySection form={form} />,
    info: () => <TourContentSections form={form} group="info" />,
    filters: () => <TourFilterSections form={form} tour={tour} />,
    partnerXml: () => <TourPartnerXmlSection form={form} />,
    bookingForm: () => <TourBookingFormSection form={form} />,
  };

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">{meta.title}</h2>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
      </header>
      <div className="px-6 py-5">{content[section]()}</div>
    </section>
  );
}
