import { Copy, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createClientId } from '@/lib/client-id';

import { TOUR_EXTRA_PRICE_UNITS } from '../lib/tours.constants';
import type { TourFormValues } from '../lib/tours.types';

type TourDateExtrasEditorProps = {
  form: UseFormReturn<TourFormValues>;
  dateIndex: number;
  dateCount: number;
};

/**
 * Priced supplements ("felárak") of one tour date. Prices can differ per
 * date, so each date keeps its own list; copying makes setting up a tour
 * with many identical dates quick.
 */
export function TourDateExtrasEditor({
  form,
  dateIndex,
  dateCount,
}: TourDateExtrasEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `dates.${dateIndex}.extras`,
    keyName: 'fieldKey',
  });

  const copyToOtherDates = () => {
    if (
      !window.confirm(
        'A többi időpont felárai lecserélődnek ennek az időpontnak a feláraira. Folytatod?',
      )
    ) {
      return;
    }

    const extras = form.getValues(`dates.${dateIndex}.extras`);

    form.getValues('dates').forEach((_, index) => {
      if (index === dateIndex) {
        return;
      }

      form.setValue(
        `dates.${index}.extras`,
        extras.map((extra) => ({ ...extra, clientId: createClientId() })),
        { shouldDirty: true },
      );
    });

    toast.success('Felárak átmásolva a többi időpontra.');
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">Felárak</h4>
          <p className="text-xs text-muted-foreground">
            A foglaláskor választható vagy kötelezően felszámított tételek ennél
            az időpontnál.
          </p>
        </div>

        {dateCount > 1 && fields.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToOtherDates}
          >
            <Copy className="size-4" />
            Másolás a többi időpontra
          </Button>
        ) : null}
      </div>

      {fields.map((field, extraIndex) => (
        <div
          key={field.fieldKey}
          className="grid gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto] md:items-end"
        >
          <FormField
            control={form.control}
            name={`dates.${dateIndex}.extras.${extraIndex}.name`}
            render={({ field: extraField }) => (
              <FormItem>
                <FormLabel>Megnevezés</FormLabel>
                <FormControl>
                  <Input placeholder="Vacsora" {...extraField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`dates.${dateIndex}.extras.${extraIndex}.price`}
            render={({ field: extraField }) => (
              <FormItem>
                <FormLabel>Ár (Ft)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="12000"
                    {...extraField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`dates.${dateIndex}.extras.${extraIndex}.priceUnit`}
            render={({ field: extraField }) => (
              <FormItem>
                <FormLabel>Felszámítás</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    {...extraField}
                  >
                    {TOUR_EXTRA_PRICE_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`dates.${dateIndex}.extras.${extraIndex}.mandatory`}
            render={({ field: extraField }) => (
              <FormItem>
                <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={extraField.value}
                    onChange={(event) =>
                      extraField.onChange(event.target.checked)
                    }
                  />
                  Kötelező
                </label>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Felár törlése"
            onClick={() => remove(extraIndex)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            clientId: createClientId(),
            name: '',
            price: '',
            priceUnit: 'per_person',
            mandatory: false,
          })
        }
      >
        <Plus className="size-4" />
        Felár hozzáadása
      </Button>
    </div>
  );
}
