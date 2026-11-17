import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  createCategoryOption,
  createCountryOption,
  createDeparturePlaceOption,
  createProgramTypeOption,
  createRegionOption,
  createTagOption,
  createTravelModeOption,
  getCategoryOptions,
  getCountryOptions,
  getDeparturePlaceOptions,
  getProgramTypeOptions,
  getRegionOptions,
  getTagOptions,
  getTravelModeOptions,
} from '../lib/tour-select-options.api';
import { normalizeSelectOption } from '../lib/tour-select-options.api';
import type { SelectOption, Tour, TourFormValues } from '../lib/tours.types';
import { TourCreatableSelectField } from './TourCreatableSelectField';
import { TourDeparturePlaceFeesEditor } from './TourDeparturePlaceFeesEditor';
import { TourFieldHelp, TourFormLabel } from './TourFieldHelp';

type TourFilterSectionsProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

function buildOption(
  id: string | number | null | undefined,
  label?: string | null,
): SelectOption[] {
  if (
    id === null ||
    id === undefined ||
    String(id).trim() === '' ||
    !label ||
    label.trim() === ''
  ) {
    return [];
  }

  return [normalizeSelectOption({ id: String(id), value: String(id), label })];
}

function buildOptions(
  items?: Array<{
    id: string | number;
    label?: string | null;
    name?: string | null;
    title?: string | null;
  }>,
): SelectOption[] {
  return (items ?? [])
    .map((item) =>
      normalizeSelectOption({
        id: String(item.id),
        value: String(item.id),
        label: item.label ?? item.name ?? item.title ?? '',
      }),
    )
    .filter((item) => item.label.trim() !== '');
}

export function TourFilterSections({ form, tour }: TourFilterSectionsProps) {
  const regionFallbackOptions = buildOption(tour?.regionId, tour?.regionLabel);
  const programTypeFallbackOptions = buildOption(
    tour?.programTypeId,
    tour?.programTypeLabel,
  );
  const travelModeFallbackOptions = buildOption(
    tour?.travelModeId,
    tour?.travelModeLabel,
  );
  const departurePlaceFallbackOptions = buildOptions(
    tour?.departurePlaces?.map((place) => ({ id: place.id, name: place.name })),
  );
  const countryFallbackOptions = buildOptions(tour?.countries);
  const tagFallbackOptions = buildOptions(tour?.tags);
  const categoryFallbackOptions = buildOptions(tour?.categories);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Szűrők / kapcsolatok</h3>
        <p className="text-sm text-muted-foreground">
          Kapcsolódó régió, címkék, országok és program besorolások.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TourCreatableSelectField
          control={form.control}
          name="regionId"
          label="Régiók"
          queryKey={['tour-select-options', 'regions']}
          queryFn={getRegionOptions}
          quickCreateKind="region"
          createFn={createRegionOption}
          fallbackOptions={regionFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="programTypeId"
          label="Program típus"
          queryKey={['tour-select-options', 'program-types']}
          queryFn={getProgramTypeOptions}
          quickCreateKind="program-type"
          createFn={createProgramTypeOption}
          fallbackOptions={programTypeFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="travelModeId"
          label="Közlekedés"
          queryKey={['tour-select-options', 'travel-modes']}
          queryFn={getTravelModeOptions}
          quickCreateKind="travel-mode"
          createFn={createTravelModeOption}
          fallbackOptions={travelModeFallbackOptions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TourCreatableSelectField
          control={form.control}
          name="departurePlaceIds"
          label="Felszállási helyek"
          isMulti
          queryKey={['tour-select-options', 'departure-places']}
          queryFn={getDeparturePlaceOptions}
          quickCreateKind="departure-place"
          createFn={createDeparturePlaceOption}
          fallbackOptions={departurePlaceFallbackOptions}
        />
        <div className="md:col-span-2 md:order-last">
          <TourDeparturePlaceFeesEditor form={form} tour={tour} />
        </div>
        <TourCreatableSelectField
          control={form.control}
          name="countryIds"
          label="Országok"
          isMulti
          queryKey={['tour-select-options', 'countries']}
          queryFn={getCountryOptions}
          quickCreateKind="country"
          createFn={createCountryOption}
          fallbackOptions={countryFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="tagIds"
          label="Címkék"
          isMulti
          queryKey={['tour-select-options', 'tags']}
          queryFn={getTagOptions}
          quickCreateKind="tag"
          createFn={createTagOption}
          fallbackOptions={tagFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="categoryIds"
          label="Kategóriák"
          isMulti
          queryKey={['tour-select-options', 'categories']}
          queryFn={getCategoryOptions}
          quickCreateKind="category"
          createFn={createCategoryOption}
          fallbackOptions={categoryFallbackOptions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelt?
                <TourFieldHelp name={field.name} />
              </label>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featuredOrder"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Kiemelt sorrend</TourFormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={999}
                  placeholder="1"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                A főoldali kiemelt ajánlatok sorrendje; üresen a végére kerül.
                Kényelmesebben a Sorrend listánként oldalon állítható.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="recommended"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelés a pozitív kiemelt ajánlatok között
                <TourFieldHelp name={field.name} />
              </label>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
