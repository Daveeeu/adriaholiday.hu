import { useWatch, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '@/components/media/media-picker';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

import type { TourFormValues } from '../lib/tours.types';

type TourContentSectionsProps = {
  form: UseFormReturn<TourFormValues>;
};

function TextareaField({
  form,
  name,
  label,
  placeholder,
  minHeight = 144,
}: {
  form: UseFormReturn<TourFormValues>;
  name: keyof TourFormValues;
  label: string;
  placeholder?: string;
  minHeight?: number;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RichTextEditor
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(next) => field.onChange(next)}
              placeholder={placeholder}
              minHeight={minHeight}
              allowPreview
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TourContentSections({ form }: TourContentSectionsProps) {
  const tourName = useWatch({
    control: form.control,
    name: 'name',
  });

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Tartalmi blokkok</h3>
        <p className="text-sm text-muted-foreground">
          Általános leírások és kiegészítő szolgáltatási információk.
        </p>
      </div>

      <div className="grid gap-4">
        <TextareaField
          form={form}
          name="listDescription"
          label="Leírás"
          placeholder="Lista rövid leírása"
          minHeight={180}
        />
        <TextareaField
          form={form}
          name="shortDescription"
          label="Ismertető szöveg"
          placeholder="Rövid ismertető"
          minHeight={180}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="programPdf"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormControl>
                  <MediaPicker
                    label="Program PDF"
                    value={field.value || null}
                    onChange={(value, media) => {
                      field.onChange(value ?? '');
                      form.setValue('programPdfFile', media?.fileName || media?.name || '');
                    }}
                    description="A túra program PDF fájlja."
                    defaultCategory="tours"
                    allowedTypes={['pdf']}
                    sourceContext="tour_program_pdf"
                    uploadAlt={tourName || undefined}
                    uploadTitle={tourName || undefined}
                  />
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
                <FormLabel>Program PDF fájlnév</FormLabel>
                <FormControl>
                  <Input placeholder="korutazasok.pdf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sliderImage"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaPicker
                  label="Slider kép"
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? '')}
                  description="A körutazás slider nézetében megjelenő kép."
                  defaultCategory="tours"
                  sourceContext="tour"
                  uploadAlt={tourName || undefined}
                  uploadTitle={tourName || undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextareaField
          form={form}
          name="programBefore"
          label="Program előtti szöveg"
          placeholder="Bevezető szöveg"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="inclusions"
          label="További szolgáltatási információk"
          placeholder="Kiegészítő, nem árhoz kötött információk"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="paymentProgram"
          label="Fizetési program"
          placeholder="Fizetési feltételek"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="prices"
          label="Árak"
          placeholder="Árazási információk"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="discounts"
          label="Kedvezmények"
          placeholder="Kedvezmények"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="notes"
          label="Jegyzet / egyéb információ"
          placeholder="Jegyzetek"
          minHeight={220}
        />
      </div>
    </section>
  );
}
