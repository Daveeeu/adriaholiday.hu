import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  slugifyTourText,
  TOUR_SEO_ROBOTS_OPTIONS,
} from '../lib/tours.constants';
import type { TourFormValues } from '../lib/tours.types';
import { TourFieldHelp, TourFormLabel } from './TourFieldHelp';

type TourSeoSectionProps = {
  form: UseFormReturn<TourFormValues>;
};

export function TourSeoSection({ form }: TourSeoSectionProps) {
  const name = useWatch({ control: form.control, name: 'name' });
  const seoAutoGenerate = useWatch({
    control: form.control,
    name: 'seoAutoGenerate',
  });

  useEffect(() => {
    if (!seoAutoGenerate) {
      return;
    }

    form.setValue('seoName', slugifyTourText(name || ''), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [form, name, seoAutoGenerate]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            form.setValue('seoName', slugifyTourText(name || ''), {
              shouldValidate: true,
            })
          }
        >
          <WandSparkles className="size-4" />
          Generálás
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Név</TourFormLabel>
              <FormControl>
                <Input placeholder="Körutazás neve" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Alcím</TourFormLabel>
              <FormControl>
                <Input placeholder="Opcionális alcím" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoName"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Webcím</TourFormLabel>
              <FormControl>
                <Input
                  placeholder="korutazasok"
                  {...field}
                  readOnly={seoAutoGenerate}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="seoTitle"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Keresőben megjelenő cím</TourFormLabel>
              <FormControl>
                <Input placeholder="Üresen az utazás neve" {...field} />
              </FormControl>
              <FormDescription>
                A böngésző fülén és a találati listában jelenik meg.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoRobots"
          render={({ field }) => (
            <FormItem>
              <TourFormLabel>Megjelenjen a keresőkben?</TourFormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  {...field}
                >
                  {TOUR_SEO_ROBOTS_OPTIONS.map((option) => (
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

        <FormField
          control={form.control}
          name="seoDescription"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <TourFormLabel>Keresőben megjelenő leírás</TourFormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Üresen az ismertető szöveg eleje"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value.length} karakter; 120–160 karakter az ideális.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="seoAutoGenerate"
        render={({ field }) => (
          <FormItem>
            <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
              Automatikus generálás
              <TourFieldHelp name={field.name} />
            </label>
          </FormItem>
        )}
      />
    </div>
  );
}
