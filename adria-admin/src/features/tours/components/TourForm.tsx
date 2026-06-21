import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TOUR_DATE_STATUSES } from '../lib/tours.constants';
import type { TourFormValues } from '../lib/tours.types';
import { TourContentSections } from './TourContentSections';
import { TourFilterSections } from './TourFilterSections';
import { TourSeoSection } from './TourSeoSection';

type TourFormProps = {
  form: UseFormReturn<TourFormValues>;
};

function BooleanField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<TourFormValues>;
  name:
    | 'active'
    | 'xmlEnabled'
    | 'featured'
    | 'recommended'
    | 'partnerOffer'
    | 'imageOffer'
    | 'sliderImageEnabled'
    | 'sliderTextEnabled';
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
          </label>
        </FormItem>
      )}
    />
  );
}

export function TourForm({ form }: TourFormProps) {
  const dates = useFieldArray({
    control: form.control,
    name: 'dates',
  });

  const bonuses = useFieldArray({
    control: form.control,
    name: 'partnerBonuses',
  });

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Alapadatok</h3>
          <p className="text-sm text-muted-foreground">
            Aktív, kiemelt és megjelenési beállítások.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sorrend</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <BooleanField form={form} name="active" label="Aktív?" />
          <BooleanField form={form} name="xmlEnabled" label="XML-ben szerepel?" />
          <BooleanField form={form} name="imageOffer" label="Képes ajánlat?" />
          <BooleanField form={form} name="sliderImageEnabled" label="Slider kép" />
          <BooleanField form={form} name="sliderTextEnabled" label="Slider szöveg" />
        </div>
      </section>

      <TourSeoSection form={form} />

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Árazás és megjelenítés</h3>
          <p className="text-sm text-muted-foreground">
            Fő ár és megjelenített speciális cím.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fő ár</FormLabel>
                <FormControl>
                  <Input placeholder="1200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Megjelenített speciális cím</FormLabel>
                <FormControl>
                  <Input placeholder="Kiemelt ár" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <TourContentSections form={form} />
      <TourFilterSections form={form} />

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Időpontok</h3>
          <p className="text-sm text-muted-foreground">
            Több indulási és érkezési dátum kezelése.
          </p>
        </div>

        <div className="space-y-3">
          {dates.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`dates.${index}.startDate`}
                render={({ field: dateField }) => (
                  <FormItem>
                    <FormLabel>Indulás</FormLabel>
                    <FormControl>
                      <Input type="date" {...dateField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dates.${index}.endDate`}
                render={({ field: dateField }) => (
                  <FormItem>
                    <FormLabel>Érkezés</FormLabel>
                    <FormControl>
                      <Input type="date" {...dateField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dates.${index}.price`}
                render={({ field: dateField }) => (
                  <FormItem>
                    <FormLabel>Ár</FormLabel>
                    <FormControl>
                      <Input placeholder="1200" {...dateField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dates.${index}.status`}
                render={({ field: dateField }) => (
                  <FormItem>
                    <FormLabel>Státusz</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        {...dateField}
                      >
                        {TOUR_DATE_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => dates.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              dates.append({
                id: crypto.randomUUID(),
                startDate: '',
                endDate: '',
                price: '',
                status: 'planned',
              })
            }
          >
            <Plus className="size-4" />
            Időpont hozzáadása
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Partner bónuszok</h3>
          <p className="text-sm text-muted-foreground">
            Partner bónuszok listája és értékei.
          </p>
        </div>

        <div className="space-y-3">
          {bonuses.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`partnerBonuses.${index}.label`}
                render={({ field: bonusField }) => (
                  <FormItem>
                    <FormLabel>Név</FormLabel>
                    <FormControl>
                      <Input placeholder="Bónusz neve" {...bonusField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`partnerBonuses.${index}.value`}
                render={({ field: bonusField }) => (
                  <FormItem>
                    <FormLabel>Érték</FormLabel>
                    <FormControl>
                      <Input placeholder="Érték" {...bonusField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => bonuses.remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              bonuses.append({
                id: crypto.randomUUID(),
                label: '',
                value: '',
              })
            }
          >
            <Plus className="size-4" />
            Bónusz hozzáadása
          </Button>
        </div>
      </section>
    </div>
  );
}
