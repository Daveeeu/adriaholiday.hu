import { Minus, Plus } from 'lucide-react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  allTourFormSections,
  type TourFormSectionKey,
  type TourFormSectionState,
} from '../lib/tour-form-sections';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourBookingFormSection } from './TourBookingFormSection';
import { TourContentSections } from './TourContentSections';
import { TourDatesSection } from './TourDatesSection';
import { TourFilterSections } from './TourFilterSections';
import { TourFormSection } from './TourFormSection';
import { TourGallerySection } from './TourGallerySection';
import { TourPartnerXmlSection } from './TourPartnerXmlSection';
import { TourPriceBoxSection } from './TourPriceBoxSection';
import { TourPriceItemsSection } from './TourPriceItemsSection';
import { TourProgramDaysSection } from './TourProgramDaysSection';
import { TourRouteMapSection } from './TourRouteMapSection';
import { TourSeoSection } from './TourSeoSection';
import { TourStaySection } from './TourStaySection';
import { TourFieldHelp, TourFormLabel } from './TourFieldHelp';

type TourFormProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
  openSections: TourFormSectionState;
  onOpenSectionsChange: (sections: TourFormSectionState) => void;
};

function BooleanField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<TourFormValues>;
  name: 'active' | 'listed' | 'xmlEnabled' | 'couponable';
  label: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
            {label}
            <TourFieldHelp name={name} />
          </label>
        </FormItem>
      )}
    />
  );
}

/** Every section of a tour, each collapsible; the editor page holds which are open. */
export function TourForm({
  form,
  tour,
  openSections,
  onOpenSectionsChange,
}: TourFormProps) {
  const dateCount = (useWatch({ control: form.control, name: 'dates' }) ?? [])
    .length;
  const galleryCount = (
    useWatch({ control: form.control, name: 'gallery' }) ?? []
  ).length;
  const programDayCount = (
    useWatch({ control: form.control, name: 'programDays' }) ?? []
  ).length;
  const priceItemCount = (
    useWatch({ control: form.control, name: 'priceItems' }) ?? []
  ).length;
  const routeStopCount = (
    useWatch({ control: form.control, name: 'routeStops' }) ?? []
  ).length;

  const sectionProps = (key: TourFormSectionKey) => ({
    open: openSections[key],
    onToggle: () =>
      onOpenSectionsChange({ ...openSections, [key]: !openSections[key] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Körutazás szekciók
          </div>
          <div className="text-xs text-muted-foreground">
            Nyisd le csak azt, amin dolgozol.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenSectionsChange(allTourFormSections(true))}
          >
            <Plus className="size-4" />
            Összes lenyitása
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenSectionsChange(allTourFormSections(false))}
          >
            <Minus className="size-4" />
            Összes csukása
          </Button>
        </div>
      </div>

      <TourFormSection
        title="Alapadatok"
        description="Aktív-e az út, és hol jelenjen meg."
        {...sectionProps('basic')}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <TourFormLabel>Sorrend</TourFormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <BooleanField form={form} name="active" label="Aktív?" />
          <BooleanField
            form={form}
            name="listed"
            label="Megjelenik az ajánlatlistákban?"
          />
          <BooleanField
            form={form}
            name="xmlEnabled"
            label="Partnerportálokon megjelenik?"
          />
          <BooleanField form={form} name="couponable" label="Kuponozható?" />
        </div>
      </TourFormSection>

      <TourFormSection
        title="Név és webcím"
        description="Név, alcím, webcím és keresőbeállítások."
        {...sectionProps('seo')}
      >
        <TourSeoSection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Galéria és média"
        description="Az utazás fő képe és galériája."
        countLabel={`${galleryCount} elem`}
        {...sectionProps('gallery')}
      >
        <TourGallerySection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Árdoboz"
        description="Az ajánlatkártyán és az utazás oldalán látszó ár és a hozzá tartozó szövegek."
        {...sectionProps('priceBox')}
      >
        <TourPriceBoxSection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Tartalmi blokkok"
        description="Leírások, keresési kulcsszavak és szolgáltatási információk."
        {...sectionProps('content')}
      >
        <TourContentSections form={form} />
      </TourFormSection>

      <TourFormSection
        title="Program napok"
        description="Napi bontás, ikonok, képek és címkék."
        countLabel={`${programDayCount} nap`}
        {...sectionProps('programDays')}
      >
        <TourProgramDaysSection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Útvonal térkép"
        description="A megállók, amelyekből a rendszer térképet rajzol az utazás oldalára és a PDF-ekbe."
        countLabel={`${routeStopCount} megálló`}
        {...sectionProps('routeMap')}
      >
        <TourRouteMapSection
          form={form}
          tourId={tour?.id ? String(tour.id) : undefined}
        />
      </TourFormSection>

      <TourFormSection
        title="Szállás és ellátás"
        description="Az utazás oldalán a felső kártyákon látszik, kiegészítő információval."
        {...sectionProps('stay')}
      >
        <TourStaySection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Ár tartalma"
        description="Mit tartalmaz és mit nem tartalmaz az ár."
        countLabel={`${priceItemCount} tétel`}
        {...sectionProps('priceItems')}
      >
        <TourPriceItemsSection form={form} />
      </TourFormSection>

      <TourFormSection
        title="Szűrők és kapcsolatok"
        description="Régió, kategóriák, címkék, országok, felszállási helyek és kiemelés."
        {...sectionProps('filters')}
      >
        <TourFilterSections form={form} tour={tour} />
      </TourFormSection>

      <TourFormSection
        title="Időpontok"
        description="Indulási dátumok, állapotok és az időpontokhoz tartozó árak."
        countLabel={`${dateCount} időpont`}
        {...sectionProps('dates')}
      >
        <TourDatesSection form={form} tour={tour} />
      </TourFormSection>

      <TourFormSection
        title="Partnerportálok (Travelgate, Travelmax, Cesys)"
        description="Amit az út a partnerportálokon mutat: régió, utazástípusok, szállás, biztosítás."
        {...sectionProps('partnerXml')}
      >
        <TourPartnerXmlSection form={form} />
      </TourFormSection>

      <TourBookingFormSection form={form} {...sectionProps('bookingForm')} />
    </div>
  );
}
