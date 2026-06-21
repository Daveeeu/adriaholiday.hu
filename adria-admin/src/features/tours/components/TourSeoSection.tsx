import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { slugifyTourText } from '../lib/tours.constants';
import type { TourFormValues } from '../lib/tours.types';

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
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">SEO</h3>
          <p className="text-sm text-muted-foreground">
            Név, akciók és SEO név kezelése.
          </p>
        </div>
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
              <FormLabel>Név</FormLabel>
              <FormControl>
                <Input placeholder="Körutazás neve" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="action1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Akció 1</FormLabel>
              <FormControl>
                <Input placeholder="Akció 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="action2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Akció 2</FormLabel>
              <FormControl>
                <Input placeholder="Akció 2" {...field} />
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
              <FormLabel>SEO név</FormLabel>
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
            </label>
          </FormItem>
        )}
      />
    </section>
  );
}
