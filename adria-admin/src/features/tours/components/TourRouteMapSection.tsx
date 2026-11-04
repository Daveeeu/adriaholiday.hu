import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  Lightbulb,
  MapPin,
  Search,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api-client';
import { createClientId } from '@/lib/client-id';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';

import {
  getRouteStopSuggestions,
  previewRouteMap,
  searchRouteStopPlaces,
} from '../lib/tours.api';
import type {
  RouteStopPlace,
  TourFormValues,
  TourRouteStop,
} from '../lib/tours.types';

type TourRouteMapSectionProps = {
  form: UseFormReturn<TourFormValues>;
  /** Saved tours can suggest stops from their program. */
  tourId?: string;
};

const SEARCH_MIN_LENGTH = 2;

/**
 * The stops of the tour's route map, in travel order: found with the place
 * search (or started from the program's suggestions), renamed as the map
 * should show them, marked where the tour stays overnight, with a preview of
 * the map the site, the program PDF and the travel book show.
 */
export function TourRouteMapSection({
  form,
  tourId,
}: TourRouteMapSectionProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'routeStops',
  });
  const stops = useWatch({ control: form.control, name: 'routeStops' }) ?? [];
  const [search, setSearch] = useState('');
  const [suggestionsRequested, setSuggestionsRequested] = useState(false);
  const query = useDebouncedValue(search.trim(), 400);

  const placesQuery = useQuery({
    queryKey: ['tours', 'route-stop-places', query],
    queryFn: ({ signal }) => searchRouteStopPlaces(query, signal),
    enabled: query.length >= SEARCH_MIN_LENGTH,
    staleTime: Infinity,
    retry: false,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['tours', 'route-stop-suggestions', tourId],
    queryFn: () => getRouteStopSuggestions(tourId as string),
    enabled: suggestionsRequested && Boolean(tourId),
  });

  function addPlace(place: RouteStopPlace) {
    append({
      clientId: createClientId(),
      name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      accommodation: false,
    });
    setSearch('');
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        A megállók sorrendjében rajzolt térkép az utazás oldalán a jobb oldali
        panelben, a program PDF-ben és az utazási könyvben jelenik meg. A
        szállás helye piros, a többi megálló fekete. Üresen hagyva nincs térkép.
      </p>

      <div className="space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Megálló hozzáadása: kezdd el írni a város nevét (pl. Belgrád)..."
            className="pl-9"
          />
        </div>
        <PlaceResults
          visible={query.length >= SEARCH_MIN_LENGTH && search.trim() !== ''}
          loading={placesQuery.isFetching}
          error={placesQuery.error}
          places={placesQuery.data ?? []}
          onSelect={addPlace}
        />
      </div>

      {tourId ? (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSuggestionsRequested(true)}
          >
            <Lightbulb className="size-4" />
            Javaslat a programleírásból
          </Button>
          {suggestionsRequested ? (
            <div className="flex flex-wrap gap-2">
              {suggestionsQuery.isFetching ? (
                <span className="text-sm text-muted-foreground">
                  Keresés...
                </span>
              ) : null}
              {suggestionsQuery.data?.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  A mentett programleírás napcímeiből nem sikerült helyneveket
                  kiolvasni.
                </span>
              ) : null}
              {suggestionsQuery.data?.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSearch(name)}
                  className="rounded-full border bg-background px-3 py-1 text-sm hover:bg-muted"
                  title="Keresés erre a helyre"
                >
                  {name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {fields.length > 0 ? (
        <ol className="space-y-2">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="flex flex-wrap items-start gap-2 rounded-xl border bg-background p-2"
            >
              <span className="mt-2 w-6 text-center text-sm font-semibold text-muted-foreground">
                {index + 1}.
              </span>
              <FormField
                control={form.control}
                name={`routeStops.${index}.name`}
                render={({ field: nameField }) => (
                  <FormItem className="min-w-[180px] flex-1">
                    <FormControl>
                      <Input
                        {...nameField}
                        aria-label="A megálló neve a térképen"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`routeStops.${index}.accommodation`}
                render={({ field: accommodationField }) => (
                  <label
                    className={cn(
                      'flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm',
                      accommodationField.value &&
                        'border-red-200 bg-red-50 text-red-700',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={accommodationField.value}
                      onChange={(event) =>
                        accommodationField.onChange(event.target.checked)
                      }
                    />
                    <BedDouble className="size-4" />
                    Szállás
                  </label>
                )}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Feljebb"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => move(index, index + 1)}
                  disabled={index === fields.length - 1}
                  aria-label="Lejjebb"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Megálló törlése"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          Még nincs megálló.
        </p>
      )}

      <RouteMapPreview stops={stops} />
    </div>
  );
}

function PlaceResults({
  visible,
  loading,
  error,
  places,
  onSelect,
}: {
  visible: boolean;
  loading: boolean;
  error: Error | null;
  places: RouteStopPlace[];
  onSelect: (place: RouteStopPlace) => void;
}) {
  if (!visible) {
    return null;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof ApiError
          ? error.message
          : 'A keresés most nem sikerült.'}
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Keresés...</p>;
  }

  if (places.length === 0) {
    return <p className="text-sm text-muted-foreground">Nincs találat.</p>;
  }

  return (
    <div className="space-y-1">
      <ul className="divide-y overflow-hidden rounded-xl border bg-background">
        {places.map((place) => (
          <li key={`${place.latitude},${place.longitude}`}>
            <button
              type="button"
              onClick={() => onSelect(place)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="font-medium">{place.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {place.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Helyadatok: © OpenStreetMap közreműködők
      </p>
    </div>
  );
}

/** The map as it will be drawn, refreshed shortly after the stops change. */
function RouteMapPreview({ stops }: { stops: TourRouteStop[] }) {
  const drawable = useMemo(
    () =>
      stops
        .filter((stop) => stop.name.trim() !== '')
        .map(({ name, latitude, longitude, accommodation }) => ({
          name: name.trim(),
          latitude,
          longitude,
          accommodation,
        })),
    [stops],
  );
  const debouncedStops = useDebouncedValue(drawable, 600);

  const previewQuery = useQuery({
    queryKey: ['tours', 'route-map-preview', debouncedStops],
    queryFn: ({ signal }) => previewRouteMap(debouncedStops, signal),
    enabled: debouncedStops.length > 0,
    staleTime: Infinity,
  });

  const imageUrl = useMemo(
    () =>
      previewQuery.data && debouncedStops.length > 0
        ? URL.createObjectURL(previewQuery.data)
        : null,
    [previewQuery.data, debouncedStops.length],
  );

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (drawable.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Előnézet</div>
      <div className="relative aspect-[3/2] w-full max-w-md overflow-hidden rounded-xl border bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Az útvonal térkép előnézete"
            className="size-full object-cover"
          />
        ) : null}
        {previewQuery.isFetching ? (
          <span className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            Rajzolás...
          </span>
        ) : null}
        {previewQuery.isError ? (
          <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-destructive">
            Az előnézet most nem készült el.
          </span>
        ) : null}
      </div>
    </div>
  );
}
