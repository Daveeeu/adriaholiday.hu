import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { EntitySidePanel } from '@/components/admin/entity-side-panel';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  BOOKING_FORM_FIELD_TYPE_LABELS,
  BOOKING_FORM_INPUT_GROUP_LABELS,
} from '../lib/booking-form.constants';
import type {
  BookingFormField,
  BookingFormFieldType,
  BookingFormFieldUpsertInput,
  BookingFormInputGroup,
} from '../lib/booking-form-templates.types';

const FORM_ID = 'booking-form-field-panel-form';

function parseOptions(optionsText: string): string[] {
  return optionsText
    .split('\n')
    .map((option) => option.trim())
    .filter((option) => option !== '');
}

const fieldFormSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(2, 'A mező nevének megadása kötelező.')
      .max(255),
    fieldType: z.enum([
      'text',
      'textarea',
      'email',
      'tel',
      'date',
      'number',
      'select',
    ]),
    inputGroup: z.enum(['contact', 'passenger']),
    optionsText: z.string(),
  })
  .superRefine((values, context) => {
    if (
      values.fieldType === 'select' &&
      parseOptions(values.optionsText).length === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['optionsText'],
        message: 'Legördülő listához legalább egy lehetőséget meg kell adni.',
      });
    }
  });

type FieldFormValues = z.infer<typeof fieldFormSchema>;

function getFieldFormDefaults(
  field: BookingFormField | undefined,
): FieldFormValues {
  return {
    label: field?.label ?? '',
    fieldType: field?.fieldType ?? 'text',
    inputGroup: field?.inputGroup ?? 'passenger',
    optionsText: (field?.options ?? []).join('\n'),
  };
}

function toUpsertInput(values: FieldFormValues): BookingFormFieldUpsertInput {
  return {
    label: values.label.trim(),
    fieldType: values.fieldType,
    inputGroup: values.inputGroup,
    options:
      values.fieldType === 'select' ? parseOptions(values.optionsText) : [],
  };
}

type BookingFormFieldSidePanelProps = {
  open: boolean;
  field?: BookingFormField;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BookingFormFieldUpsertInput) => void;
  onDelete?: () => void;
};

export function BookingFormFieldSidePanel({
  open,
  field,
  submitting = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: BookingFormFieldSidePanelProps) {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: getFieldFormDefaults(field),
  });

  useEffect(() => {
    if (open) {
      form.reset(getFieldFormDefaults(field));
    }
  }, [field, form, open]);

  const fieldType = useWatch({ control: form.control, name: 'fieldType' });
  const isSystem = field?.isSystem ?? false;

  return (
    <EntitySidePanel
      open={open}
      title={
        field ? 'Foglalási mező szerkesztése' : 'Foglalási mező hozzáadása'
      }
      description="A mezőt a foglalási űrlap sablonokban lehet kötelezőre, opcionálisra vagy rejtettre állítani."
      widthClassName="max-w-[min(100vw,640px)]"
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {field && onDelete && !isSystem ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={submitting}
            >
              <Trash2 className="size-4" />
              Törlés
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Mégse
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitting}>
            Mentés
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit((values) =>
            onSubmit(toUpsertInput(values)),
          )}
        >
          {isSystem ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Rendszermező: a foglalás alapadatai ebből töltődnek, ezért csak a
              neve módosítható, és nem törölhető.
            </p>
          ) : null}

          <FormField
            control={form.control}
            name="label"
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>Mező neve (az ügyfél ezt látja)</FormLabel>
                <FormControl>
                  <Input placeholder="pl. Lakcím" {...inputField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="inputGroup"
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel>Kinek az adata?</FormLabel>
                  <FormControl>
                    <Select
                      value={inputField.value}
                      disabled={isSystem}
                      onChange={(event) =>
                        inputField.onChange(
                          event.target.value as BookingFormInputGroup,
                        )
                      }
                    >
                      {Object.entries(BOOKING_FORM_INPUT_GROUP_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {value === 'passenger'
                              ? `${label} (minden utasnál külön)`
                              : label}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldType"
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel>Típus</FormLabel>
                  <FormControl>
                    <Select
                      value={inputField.value}
                      disabled={isSystem}
                      onChange={(event) =>
                        inputField.onChange(
                          event.target.value as BookingFormFieldType,
                        )
                      }
                    >
                      {Object.entries(BOOKING_FORM_FIELD_TYPE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {fieldType === 'select' ? (
            <FormField
              control={form.control}
              name="optionsText"
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel>Választási lehetőségek (soronként egy)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder={'Személyi igazolvány\nÚtlevél'}
                      {...inputField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {field ? (
            <p className="text-xs text-muted-foreground">
              Technikai azonosító: <code>{field.key}</code>
            </p>
          ) : null}
        </form>
      </Form>
    </EntitySidePanel>
  );
}
