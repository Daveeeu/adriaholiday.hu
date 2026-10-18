import { useQuery } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';

import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { getPartnerXmlOptions } from '../lib/tour-select-options.api';
import type { TourFormValues } from '../lib/tours.types';

type TourPartnerXmlSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

const SELECT_CLASS = 'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm';

const TRAVEL_TYPE_FIELDS = [
  { partner: 'travelgate', label: 'Utazás típusa – Travelgate (/xmltravel)' },
  { partner: 'cesys', label: 'Utazás típusa – Cesys (/xmlcesys)' },
  { partner: 'general', label: 'Utazás típusa – általános feed (/xml)' },
] as const;

/**
 * What the partner XML feeds tell the travel portals about the tour beyond
 * its own data: the region they file it under, each partner's travel type,
 * the accommodation and city shown, the travel insurance fee and Travelmax's
 * accommodation description.
 */
export function TourPartnerXmlSection({ form }: TourPartnerXmlSectionProps) {
  const { data: options } = useQuery({
    queryKey: ['tour-select-options', 'partner-xml'],
    queryFn: getPartnerXmlOptions,
    staleTime: Infinity,
  });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Az út a partnerportálok feedjeiben akkor szerepel, ha aktív és be van kapcsolva az „XML-ben szerepel?” jelölés; az
        időpontok közül azok, amelyeknél az időpont saját „XML-ben szerepel” jelölése is be van kapcsolva.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="partnerXml.country_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régió a partnereknél</FormLabel>
              <FormControl>
                <select
                  className={SELECT_CLASS}
                  value={field.value}
                  onChange={(event) => {
                    const region = options?.regions.find((option) => option.value === event.target.value);
                    field.onChange(event.target.value);
                    form.setValue('partnerXml.country_name', region?.label ?? '', { shouldDirty: true });
                  }}
                >
                  <option value="">– az út régiója –</option>
                  {(options?.regions ?? []).map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>Ez alapján sorolják be a portálok az utat.</FormDescription>
            </FormItem>
          )}
        />

        {TRAVEL_TYPE_FIELDS.map((item) => (
          <FormField
            key={item.partner}
            control={form.control}
            name={`partnerXml.travel_types.${item.partner}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label}</FormLabel>
                <FormControl>
                  <select className={SELECT_CLASS} value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                    <option value="">– nincs –</option>
                    {(options?.travelTypes[item.partner] ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <FormField
        control={form.control}
        name="partnerXml.travel_types.travelmax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Utazás típusa – Travelmax (/xmltravelmax)</FormLabel>
            <div className="flex flex-wrap gap-2">
              {(options?.travelTypes.travelmax ?? []).map((option) => {
                const checked = field.value.includes(option.value);

                return (
                  <label key={option.value} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        field.onChange(checked ? field.value.filter((value) => value !== option.value) : [...field.value, option.value])
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </FormItem>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="partnerXml.accommodation_name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Szállás megnevezése a portálokon</FormLabel>
              <FormControl>
                <Input placeholder="Dél-Erdélyi kirándulás a Vaskapu-szorossal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="partnerXml.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Város</FormLabel>
              <FormControl>
                <Input placeholder="Erdély" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="partnerXml.insurance_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biztosítás díja (Ft/fő/nap)</FormLabel>
              <FormControl>
                <Input inputMode="numeric" placeholder="430" {...field} />
              </FormControl>
              <FormDescription>Az általános feedben (/xml) jelenik meg.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="partnerXml.accommodation_description_travelmax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Szállás leírása – Travelmax</FormLabel>
            <FormControl>
              <RichTextEditor value={field.value} onChange={field.onChange} minHeight={140} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
