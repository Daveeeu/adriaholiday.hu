import { WandSparkles } from 'lucide-react';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createSlug } from '@/data/generators/core-generators';

import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentSeoSectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
};

export function ApartmentSeoSection({ form }: ApartmentSeoSectionProps) {
  const name = form.watch('name');
  const autoGenerateSeoName = form.watch('autoGenerateSeoName');

  useEffect(() => {
    if (!autoGenerateSeoName) {
      return;
    }

    const generatedSeoName = createSlug(name);
    if (form.getValues('seoName') !== generatedSeoName) {
      form.setValue('seoName', generatedSeoName, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (form.getValues('seo_name') !== generatedSeoName) {
      form.setValue('seo_name', generatedSeoName, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [autoGenerateSeoName, form, name]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">SEO blokk</h3>
        <p className="text-sm text-muted-foreground">
          A név, a SEO név és az azonosító mezők itt kezelhetők.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Név</FormLabel>
              <FormControl>
                <Input placeholder="Villa Adriatica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kód</FormLabel>
              <FormControl>
                <Input placeholder="APT-001" {...field} />
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
              <div className="flex items-center justify-between gap-3">
                <FormLabel>SEO név</FormLabel>
                <FormField
                  control={form.control}
                  name="autoGenerateSeoName"
                  render={({ field: autoField }) => (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={autoField.value}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          autoField.onChange(checked);
                          form.setValue('seo_auto_generate', checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      Automatikus generálás
                    </label>
                  )}
                />
              </div>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="villa-adriatica"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      form.setValue('seo_name', event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const generated = createSlug(form.getValues('name'));
                      form.setValue('seoName', generated, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      form.setValue('seo_name', generated, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <WandSparkles className="size-4" />
                    Generálás
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="villa-adriatica-split"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      form.setValue('slug', createSlug(form.getValues('name')), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <WandSparkles className="size-4" />
                    Generálás
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
