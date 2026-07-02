import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentContentSectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
};

function ContentBlock({
  form,
  name,
  label,
  placeholder,
}: {
  form: UseFormReturn<ApartmentFormValues>;
  name:
    | 'apartment_type_content'
    | 'all_inclusive_content'
    | 'apartment_type_description'
    | 'apartment_type_text_description'
    | 'apartment_type_text_description_2';
  label: string;
  placeholder: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RichTextEditor
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(next) => field.onChange(next)}
              placeholder={placeholder}
              minHeight={160}
              allowPreview
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ApartmentContentSection({ form }: ApartmentContentSectionProps) {
  const selectedType = useWatch({ control: form.control, name: 'type' });

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">Tartalmi blokkok</h3>
        <p className="text-sm text-muted-foreground">
          A leíró és típusspecifikus tartalmak külön blokkokban szerkeszthetők.
        </p>
      </div>

      <div className="space-y-4">
        <details className="rounded-xl border bg-background p-4" open>
          <summary className="cursor-pointer text-sm font-semibold">
            Apartman típus tartalom
          </summary>
          <div className="mt-4 space-y-4">
            <ContentBlock
              form={form}
              name="apartment_type_content"
              label="Apartment type content"
              placeholder="Típusspecifikus tartalom"
            />
            <ContentBlock
              form={form}
              name="apartment_type_description"
              label="Apartment type description"
              placeholder="Extra típus leírás"
            />
            <ContentBlock
              form={form}
              name="apartment_type_text_description"
              label="Apartment type text description"
              placeholder="Első extra szöveges leírás"
            />
            <ContentBlock
              form={form}
              name="apartment_type_text_description_2"
              label="Apartment type text description 2"
              placeholder="Második extra szöveges leírás"
            />
          </div>
        </details>

        <details className="rounded-xl border bg-background p-4" open>
          <summary className="cursor-pointer text-sm font-semibold">
            All inclusive tartalom
          </summary>
          <div className="mt-4">
            <ContentBlock
              form={form}
              name="all_inclusive_content"
              label="All inclusive content"
              placeholder="All inclusive tartalom"
            />
          </div>
        </details>

        {selectedType === 'montenegro' ? (
          <details className="rounded-xl border bg-background p-4" open>
            <summary className="cursor-pointer text-sm font-semibold">
              Montenegró extra blokkok
            </summary>
            <div className="mt-4 text-sm text-muted-foreground">
              A montenegrói apartmanokhoz kapcsolódó extra leírások itt kezelhetők.
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}
