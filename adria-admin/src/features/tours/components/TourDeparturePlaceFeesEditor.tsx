import { useQuery } from '@tanstack/react-query';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { ReorderControls } from '@/components/admin/reorder-controls';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDragReorder } from '@/lib/use-drag-reorder';
import { cn } from '@/lib/utils';

import { getDeparturePlaceOptions } from '../lib/tour-select-options.api';
import type { Tour, TourFormValues } from '../lib/tours.types';

type TourDeparturePlaceFeesEditorProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
};

/**
 * The tour's selected departure places in boarding order, reordered by
 * dragging or with the up and down buttons, each with its per-tour surcharge
 * (e.g. "Budapest" +4 700 Ft/fő on one tour only). Left empty, the place's
 * general fee applies.
 */
export function TourDeparturePlaceFeesEditor({
  form,
  tour,
}: TourDeparturePlaceFeesEditorProps) {
  const selectedIds =
    useWatch({ control: form.control, name: 'departurePlaceIds' }) ?? [];
  const { data: options = [] } = useQuery({
    queryKey: ['tour-select-options', 'departure-places'],
    queryFn: () => getDeparturePlaceOptions(),
  });

  const move = (id: string, toPosition: number) => {
    const fromPosition = selectedIds.indexOf(id);

    if (
      fromPosition < 0 ||
      toPosition < 0 ||
      toPosition >= selectedIds.length ||
      fromPosition === toPosition
    ) {
      return;
    }

    const next = [...selectedIds];
    next.splice(fromPosition, 1);
    next.splice(toPosition, 0, id);

    form.setValue('departurePlaceIds', next, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const { draggingKey, handleProps, itemProps } = useDragReorder(move);

  if (selectedIds.length === 0) {
    return null;
  }

  const labelOf = (id: string) =>
    options.find((option) => option.value === id)?.label ??
    tour?.departurePlaces?.find((place) => String(place.id) === id)?.name ??
    id;
  const generalFeeOf = (id: string) =>
    tour?.departurePlaces?.find((place) => String(place.id) === id)?.fee;

  return (
    <div className="space-y-3 rounded-xl border bg-background p-3">
      <div>
        <h4 className="text-sm font-semibold">
          Felszállási helyek sorrendje és felára ennél az útnál
        </h4>
        <p className="text-xs text-muted-foreground">
          A foglalási űrlapon ebben a sorrendben jelennek meg, ezért a busz
          útvonala szerint rendezd őket. Felár: Ft/fő; üresen hagyva a
          felszállási hely általános díja érvényes.
        </p>
      </div>

      <div className="space-y-2">
        {selectedIds.map((id, position) => {
          const generalFee = generalFeeOf(id);

          return (
            <div
              key={id}
              {...itemProps(id, position)}
              className={cn(
                'grid items-end gap-3 rounded-lg border bg-card p-2 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]',
                draggingKey === id && 'opacity-60',
              )}
            >
              <ReorderControls
                position={position}
                count={selectedIds.length}
                itemLabel="felszállási hely"
                onMove={(toPosition) => move(id, toPosition)}
                dragHandleProps={handleProps(id)}
              />
              <FormField
                control={form.control}
                name={`departurePlaceFees.${id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{labelOf(id)} felára</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={
                          generalFee ? `Általános: ${generalFee} Ft` : '0'
                        }
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
