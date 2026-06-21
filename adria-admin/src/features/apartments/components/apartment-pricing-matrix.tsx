import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { apartmentPricingMatrixConfig } from '../lib/apartments.constants';
import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentPricingMatrixProps = {
  form: UseFormReturn<ApartmentFormValues>;
  readOnly?: boolean;
};

function PricingCell({
  form,
  rowIndex,
  columnIndex,
  readOnly = false,
}: {
  form: UseFormReturn<ApartmentFormValues>;
  rowIndex: number;
  columnIndex: number;
  readOnly?: boolean;
}) {
  const name = `pricingMatrix.rows.${rowIndex}.prices.${columnIndex}` as const;

  if (readOnly) {
    return (
      <div className="min-h-10 rounded-lg border border-border bg-muted/40 px-2 py-2 text-sm">
        {form.getValues(name) || '—'}
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              className="h-10 min-w-24"
              placeholder="-"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ApartmentPricingMatrix({
  form,
  readOnly = false,
}: ApartmentPricingMatrixProps) {
  const columns = form.watch('pricingMatrix.columns');
  const rows = form.watch('pricingMatrix.rows');
  const header = form.watch('priceHeader');
  const innerHeader = form.watch('priceInnerHeader');

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">{header || 'Árak'}</h3>
        <p className="text-sm text-muted-foreground">
          Ha egy oszlopban nincs minden dátum kitöltve, vagy egy sorban hiányzik a
          kategória / ágyszám, akkor az érintett rekord törlődhet.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Az árnál megadható a <span className="font-semibold">-</span> karakter is,
        ha az ár jelenleg még nem ismert.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-40 border bg-card px-3 py-2 text-left font-semibold">
                {innerHeader || 'Kategória / ágyszám'}
              </th>
              {columns.slice(0, apartmentPricingMatrixConfig.columns).map((column, index) => (
                <th key={column.id} className="min-w-40 border bg-card px-2 py-2">
                  {readOnly ? (
                    <div className="space-y-1">
                      <div className="font-medium">{column.startDate || 'Kezdő dátum'}</div>
                      <div className="text-xs text-muted-foreground">{column.endDate || 'Vég dátum'}</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`pricingMatrix.columns.${index}.startDate` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="h-9"
                                placeholder="Kezdő dátum"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`pricingMatrix.columns.${index}.endDate` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="h-9"
                                placeholder="Vég dátum"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, apartmentPricingMatrixConfig.rows).map((row, rowIndex) => (
              <tr key={row.id}>
                <td className="sticky left-0 z-10 min-w-40 border bg-card px-2 py-2">
                  {readOnly ? (
                    <div className="space-y-1">
                      <div className="font-medium">{row.category || 'Kategória'}</div>
                      <div className="text-xs text-muted-foreground">{row.beds || 'Ágyszám'}</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`pricingMatrix.rows.${rowIndex}.category` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input className="h-9" placeholder="Kategória" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`pricingMatrix.rows.${rowIndex}.beds` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input className="h-9" placeholder="Ágyszám" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </td>

                {columns.slice(0, apartmentPricingMatrixConfig.columns).map((column, columnIndex) => (
                  <td key={`${row.id}-${column.id}`} className="border px-2 py-2">
                    <PricingCell
                      form={form}
                      rowIndex={rowIndex}
                      columnIndex={columnIndex}
                      readOnly={readOnly}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
