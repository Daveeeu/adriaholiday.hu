import { useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

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

import { cn } from '@/lib/utils';

import type { TourFormValues } from '../lib/tours.types';
import { TourSearchKeywordsField } from './TourSearchKeywordsField';
import { TourFormLabel } from './TourFieldHelp';

type ContentGroup = 'descriptions' | 'programText' | 'info';

type TourContentSectionsProps = {
  form: UseFormReturn<TourFormValues>;
  group: ContentGroup;
};

type ContentField = {
  name: keyof TourFormValues;
  label: string;
  placeholder: string;
  minHeight: number;
};

const PROGRAM_TEXT_FIELDS: ContentField[] = [
  {
    name: 'programBefore',
    label: 'Program előtti szöveg',
    placeholder: 'Bevezető szöveg',
    minHeight: 200,
  },
  {
    name: 'program',
    label: 'Program (teljes szöveg)',
    placeholder:
      'A program egyben, ahogy a régi oldalon. Ha napokra bontott program is van, az utazás oldalán az jelenik meg.',
    minHeight: 320,
  },
  {
    name: 'programFooter',
    label: 'Programok alatti szöveg',
    placeholder:
      'A program alatt megjelenő tudnivalók, pl. „A programváltozás jogát fenntartjuk.”',
    minHeight: 160,
  },
];

/** The trip page's information blocks, edited one at a time. */
const INFO_FIELDS: ContentField[] = [
  {
    name: 'teaser',
    label: 'Kedvcsináló',
    placeholder: 'Hangulatos bevezető az utazáshoz',
    minHeight: 260,
  },
  {
    name: 'optionalPrograms',
    label: 'Fakultatív programok',
    placeholder: 'Választható, külön fizetendő programok',
    minHeight: 260,
  },
  {
    name: 'tickets',
    label: 'Belépőjegyek',
    placeholder: 'Belépőjegy árak (táblázat is lehet)',
    minHeight: 260,
  },
  {
    name: 'inclusions',
    label: 'További szolgáltatási információk',
    placeholder: 'Kiegészítő, nem árhoz kötött információk',
    minHeight: 260,
  },
  {
    name: 'paymentProgram',
    label: 'Fizetési program',
    placeholder: 'Fizetési feltételek',
    minHeight: 260,
  },
  {
    name: 'prices',
    label: 'Árak',
    placeholder: 'Árazási információk',
    minHeight: 260,
  },
  {
    name: 'discounts',
    label: 'Kedvezmények',
    placeholder: 'Kedvezmények',
    minHeight: 260,
  },
  {
    name: 'notes',
    label: 'Jegyzet / egyéb információ',
    placeholder: 'Jegyzetek',
    minHeight: 260,
  },
];

const hasText = (html: unknown) =>
  typeof html === 'string' && html.replace(/<[^>]*>/g, '').trim() !== '';

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

/** The information blocks: a row of buttons picks the one being edited; a dot marks those filled in. */
function InfoBlocks({ form }: { form: UseFormReturn<TourFormValues> }) {
  const [active, setActive] = useState(INFO_FIELDS[0].name);
  const values = useWatch({
    control: form.control,
    name: INFO_FIELDS.map((field) => field.name),
  });
  const field =
    INFO_FIELDS.find((item) => item.name === active) ?? INFO_FIELDS[0];

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Tudnivalók"
      >
        {INFO_FIELDS.map((item, index) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={item.name === active}
            onClick={() => setActive(item.name)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              item.name === active
                ? 'border-primary bg-primary/10 font-medium text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.label}
            {hasText(values[index]) ? (
              <span
                className="size-1.5 rounded-full bg-emerald-500"
                aria-label="kitöltve"
              />
            ) : null}
          </button>
        ))}
      </div>

      <TextareaField key={field.name} form={form} {...field} />
    </div>
  );
}

/** One of the content sections of the editor's menu. */
export function TourContentSections({ form, group }: TourContentSectionsProps) {
  if (group === 'info') {
    return <InfoBlocks form={form} />;
  }

  if (group === 'programText') {
    return (
      <div className="space-y-6">
        {PROGRAM_TEXT_FIELDS.map((field) => (
          <TextareaField key={field.name} form={form} {...field} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TextareaField
        form={form}
        name="listDescription"
        label="Lista rövid leírása"
        placeholder="Az ajánlatkártyákon megjelenő rövid leírás"
        minHeight={160}
      />
      <TextareaField
        form={form}
        name="shortDescription"
        label="Ismertető szöveg"
        placeholder="Rövid ismertető"
        minHeight={160}
      />
      <TourSearchKeywordsField form={form} />
    </div>
  );
}
