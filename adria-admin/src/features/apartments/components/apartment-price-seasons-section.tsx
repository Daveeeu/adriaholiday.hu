import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentPriceSeasonsSectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
};

export function ApartmentPriceSeasonsSection({
  form,
}: ApartmentPriceSeasonsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'priceSeasons',
  });

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Árazási szezonok</h3>
          <p className="text-sm text-muted-foreground">
            Több szezon, kategória és ágyszám szerinti ár megadható.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
          append({
            id: crypto.randomUUID(),
            apartmentId: '',
            apartment_id: '',
            startDate: '',
            start_date: '',
            endDate: '',
            end_date: '',
            category: '',
            beds: '',
            price: '',
          })
          }
        >
          <Plus className="size-4" />
          Új szezon
        </Button>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nincs még ár szezonsor.</p>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-2 xl:grid-cols-6"
            >
              <FormField
                control={form.control}
                name={`priceSeasons.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kezdő dátum</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2026-06-01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`priceSeasons.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vég dátum</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2026-06-15" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`priceSeasons.${index}.category`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategória</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kategória 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`priceSeasons.${index}.beds`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ágyszám</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="4 ágy" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`priceSeasons.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ár</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="120" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
