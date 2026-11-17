import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  FIXED_FORMAT_CONTROLS,
  RichTextEditor,
} from '@/components/editor/rich-text-editor';

import type { TourFormValues } from '../lib/tours.types';
import { TourSearchKeywordsField } from './TourSearchKeywordsField';
import { TourFormLabel } from './TourFieldHelp';

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
          <TourFormLabel>{label}</TourFormLabel>
          <FormControl>
            <RichTextEditor
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(next) => field.onChange(next)}
              placeholder={placeholder}
              minHeight={minHeight}
              allowPreview
              allowedControls={FIXED_FORMAT_CONTROLS}
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

        <TourSearchKeywordsField form={form} />

        <TextareaField
          form={form}
          name="programBefore"
          label="Program előtti szöveg"
          placeholder="Bevezető szöveg"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="program"
          label="Program (teljes szöveg)"
          placeholder="A program egyben, ahogy a régi oldalon. Ha napokra bontott program is van, az utazás oldalán az jelenik meg."
          minHeight={320}
        />
        <TextareaField
          form={form}
          name="programFooter"
          label="Programok alatti szöveg"
          placeholder="A program alatt megjelenő tudnivalók, pl. „A programváltozás jogát fenntartjuk.”"
          minHeight={160}
        />
        <TextareaField
          form={form}
          name="teaser"
          label="Kedvcsináló"
          placeholder="Hangulatos bevezető az utazáshoz"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="optionalPrograms"
          label="Fakultatív programok"
          placeholder="Választható, külön fizetendő programok"
          minHeight={220}
        />
        <TextareaField
          form={form}
          name="tickets"
          label="Belépőjegyek"
          placeholder="Belépőjegy árak (táblázat is lehet)"
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
