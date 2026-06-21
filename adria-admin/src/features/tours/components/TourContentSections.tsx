import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import type { TourFormValues } from '../lib/tours.types';

type TourContentSectionsProps = {
  form: UseFormReturn<TourFormValues>;
};

function TextareaField({
  form,
  name,
  label,
  placeholder,
}: {
  form: UseFormReturn<TourFormValues>;
  name: keyof TourFormValues;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-28"
              placeholder={placeholder}
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TourContentSections({ form }: TourContentSectionsProps) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Tartalmi blokkok</h3>
        <p className="text-sm text-muted-foreground">
          A régi admin külön szerkeszthető szövegblokkjai.
        </p>
      </div>

      <div className="grid gap-4">
        <TextareaField
          form={form}
          name="listDescription"
          label="Leírás"
          placeholder="Lista rövid leírása"
        />
        <TextareaField
          form={form}
          name="shortDescription"
          label="Ismertető szöveg"
          placeholder="Rövid ismertető"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="programPdf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program PDF</FormLabel>
                <FormControl>
                  <Input placeholder="/files/programok/korutazasok.pdf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="programPdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program PDF fájl</FormLabel>
                <FormControl>
                  <Input placeholder="korutazasok.pdf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <TextareaField
          form={form}
          name="programBefore"
          label="Programok előtti szöveg"
          placeholder="Bevezető szöveg"
        />
        <TextareaField
          form={form}
          name="program"
          label="Programok"
          placeholder="Program részletei"
        />
        <TextareaField
          form={form}
          name="inclusions"
          label="Belefoglalva"
          placeholder="Mit tartalmaz az ár"
        />
        <TextareaField
          form={form}
          name="paymentProgram"
          label="Fizetési program"
          placeholder="Fizetési feltételek"
        />
        <TextareaField
          form={form}
          name="prices"
          label="Árak"
          placeholder="Árazási információk"
        />
        <TextareaField
          form={form}
          name="discounts"
          label="Kedvezmények"
          placeholder="Kedvezmények"
        />
        <TextareaField
          form={form}
          name="notes"
          label="Jegyzet / egyéb információ"
          placeholder="Jegyzetek"
        />
      </div>
    </section>
  );
}
