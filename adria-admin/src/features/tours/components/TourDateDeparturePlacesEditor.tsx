import { useQuery } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { getDeparturePlaceOptions } from '../lib/tour-select-options.api';
import type { Tour, TourFormValues } from '../lib/tours.types';

type TourDateDeparturePlacesEditorProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
  dateIndex: number;
};

/**
 * The tour's departure places one date offers (as on the legacy site, where
 * e.g. only the autumn date also starts from Hatvan). None ticked: all of them.
 */
export function TourDateDeparturePlacesEditor({ form, tour, dateIndex }: TourDateDeparturePlacesEditorProps) {
  const tourPlaceIds = useWatch({ control: form.control, name: 'departurePlaceIds' }) ?? [];
  const datePlaceIds = useWatch({ control: form.control, name: `dates.${dateIndex}.departurePlaceIds` }) ?? [];
  const { data: options = [] } = useQuery({
    queryKey: ['tour-select-options', 'departure-places'],
    queryFn: () => getDeparturePlaceOptions(),
  });

  if (tourPlaceIds.length < 2) {
    return null;
  }

  const labelOf = (id: string) =>
    options.find((option) => option.value === id)?.label ??
    tour?.departurePlaces?.find((place) => String(place.id) === id)?.name ??
    id;

  const toggle = (id: string) => {
    const next = datePlaceIds.includes(id) ? datePlaceIds.filter((value) => value !== id) : [...datePlaceIds, id];

    form.setValue(`dates.${dateIndex}.departurePlaceIds`, next, { shouldDirty: true });
  };

  return (
    <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
      <div>
        <h4 className="text-sm font-semibold">Felszállási helyek ennél az időpontnál</h4>
        <p className="text-xs text-muted-foreground">
          Ha egyet sem jelölsz be, az út összes felszállási helye választható.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {tourPlaceIds.map((id) => (
          <label key={id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={datePlaceIds.includes(id)} onChange={() => toggle(id)} />
            {labelOf(id)}
          </label>
        ))}
      </div>
    </div>
  );
}
