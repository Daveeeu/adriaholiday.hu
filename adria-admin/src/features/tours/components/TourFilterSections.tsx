import type { UseFormReturn } from 'react-hook-form';

import { FormField, FormItem } from '@/components/ui/form';

import {
  createCategoryOption,
  createCountryOption,
  createDeparturePlaceOption,
  createDifficultyOption,
  createFitOption,
  createGroupOption,
  getHomepageOfferOptions,
  createOfferGroupOption,
  createProgramTypeOption,
  createRegionOption,
  createTagOption,
  createTravelModeOption,
  getCategoryOptions,
  getCountryOptions,
  getDeparturePlaceOptions,
  getDifficultyOptions,
  getFitOptions,
  getGroupOptions,
  getOfferGroupOptions,
  getProgramTypeOptions,
  getRegionOptions,
  getTagOptions,
  getTravelModeOptions,
} from '../lib/tour-select-options.api';
import { normalizeSelectOption } from '../lib/tour-select-options.api';
import type { SelectOption, Tour, TourFormValues } from '../lib/tours.types';
import { TourCreatableSelectField } from './TourCreatableSelectField';

type TourFilterSectionsProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

function buildOption(id: string | number | null | undefined, label?: string | null): SelectOption[] {
  if (id === null || id === undefined || String(id).trim() === '' || !label || label.trim() === '') {
    return [];
  }

  return [normalizeSelectOption({ id: String(id), value: String(id), label })];
}

function buildOptions(items?: Array<{ id: string | number; label?: string | null; name?: string | null; title?: string | null }>): SelectOption[] {
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
  const homepageOfferFallbackOptions = buildOptions(
    tour?.homepageOffers?.map((offer) => ({
      id: offer.id,
      title: offer.title,
    })),
  ).length > 0
    ? buildOptions(
        tour?.homepageOffers?.map((offer) => ({
          id: offer.id,
          title: offer.title,
        })),
      )
    : buildOption(tour?.homepageOfferId, tour?.homepageOfferLabel);
  const groupFallbackOptions = buildOption(tour?.groupId, tour?.groupLabel);
  const seasonalGroupFallbackOptions = buildOption(tour?.seasonalGroupId, tour?.seasonalGroupLabel);
  const fitFallbackOptions = buildOption(tour?.fitId, tour?.fitLabel);
  const programTypeFallbackOptions = buildOption(tour?.programTypeId, tour?.programTypeLabel);
  const travelModeFallbackOptions = buildOption(tour?.travelModeId, tour?.travelModeLabel);
  const difficultyFallbackOptions = buildOption(tour?.difficultyId, tour?.difficultyLabel);
  const departurePlaceFallbackOptions = buildOptions(tour?.departurePlaces?.map((place) => ({ id: place.id, name: place.name })));
  const countryFallbackOptions = buildOptions(tour?.countries);
  const tagFallbackOptions = buildOptions(tour?.tags);
  const categoryFallbackOptions = buildOptions(tour?.categories);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Szűrők / kapcsolatok</h3>
        <p className="text-sm text-muted-foreground">
          Kapcsolódó régiók, csoportok, címkék és program besorolások.
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
          name="groupId"
          label="Csoportok"
          queryKey={['tour-select-options', 'groups']}
          queryFn={getGroupOptions}
          quickCreateKind="group"
          createFn={createGroupOption}
          fallbackOptions={groupFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="seasonalGroupId"
          label="Ajánlat csoportok"
          queryKey={['tour-select-options', 'offer-groups']}
          queryFn={getOfferGroupOptions}
          quickCreateKind="offer-group"
          createFn={createOfferGroupOption}
          fallbackOptions={seasonalGroupFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="homepageOfferId"
          label="Főoldali ajánlat"
          queryKey={['tour-select-options', 'homepage-offers']}
          queryFn={getHomepageOfferOptions}
          description="Az itt kiválasztott főoldali blokk alá fog megjelenni a körutazás a publikus listában."
          fallbackOptions={homepageOfferFallbackOptions}
        />
        <TourCreatableSelectField
          control={form.control}
          name="fitId"
          label="FIT"
          queryKey={['tour-select-options', 'fits']}
          queryFn={getFitOptions}
          quickCreateKind="fit"
          createFn={createFitOption}
          fallbackOptions={fitFallbackOptions}
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
        <TourCreatableSelectField
          control={form.control}
          name="difficultyId"
          label="Nehézségi szint"
          queryKey={['tour-select-options', 'difficulties']}
          queryFn={getDifficultyOptions}
          quickCreateKind="difficulty"
          createFn={createDifficultyOption}
          fallbackOptions={difficultyFallbackOptions}
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
              </label>
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
              </label>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="partnerOffer"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Kiemelés csempéző ajánlat
              </label>
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
