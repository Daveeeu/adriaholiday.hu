import { useEffect, useMemo, useState } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

import type { SelectOption } from '../lib/tours.types';
import { normalizeSelectOption } from '../lib/tour-select-options.api';
import {
  TourQuickCreateDialog,
  type TourQuickCreateKind,
  type TourQuickCreateValues,
} from './TourQuickCreateDialog';

type ReactSelectOption = {
  value: string;
  label: string;
};

function toReactSelectOption(option: SelectOption): ReactSelectOption {
  return {
    value: option.value,
    label: option.label,
  };
}

function upsertOption(options: SelectOption[], nextOption: SelectOption): SelectOption[] {
  return [
    ...options.filter((option) => option.value !== nextOption.value),
    nextOption,
  ];
}

function mergeOptions(current: SelectOption[], next: SelectOption[]): SelectOption[] {
  return next.reduce((accumulator, option) => upsertOption(accumulator, option), current);
}

type TourCreatableSelectFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  isMulti?: boolean;
  queryKey: readonly unknown[];
  queryFn: (search?: string) => Promise<SelectOption[]>;
  quickCreateKind?: TourQuickCreateKind;
  quickCreateTitle?: string;
  createFn?: (values: TourQuickCreateValues) => Promise<SelectOption>;
  description?: string;
  fallbackOptions?: SelectOption[];
};

export function TourCreatableSelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Keresés...',
  isMulti = false,
  queryKey,
  queryFn,
  quickCreateKind,
  quickCreateTitle,
  createFn,
  description,
  fallbackOptions = [],
}: TourCreatableSelectFieldProps<TFieldValues>) {
  const queryClient = useQueryClient();
  const [localOptions, setLocalOptions] = useState<SelectOption[]>([]);
  const [createInputValue, setCreateInputValue] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey,
    queryFn: () => queryFn(),
  });

  useEffect(() => {
    setLocalOptions((current) => mergeOptions(current, data));
  }, [data]);

  useEffect(() => {
    if (fallbackOptions.length === 0) {
      return;
    }

    setLocalOptions((current) => mergeOptions(current, fallbackOptions.map(normalizeSelectOption)));
  }, [fallbackOptions]);

  const options = useMemo(() => localOptions.map(toReactSelectOption), [localOptions]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValue = isMulti
          ? (Array.isArray(field.value) ? field.value : []).map((value: string | number) =>
              options.find((option) => option.value === String(value)) ?? {
                value: String(value),
                label: fallbackOptions.find((option) => option.value === String(value))?.label ?? String(value),
              },
            )
          : options.find((option) => option.value === String(field.value)) ?? (
            field.value
              ? {
                  value: String(field.value),
                  label: fallbackOptions.find((option) => option.value === String(field.value))?.label ?? String(field.value),
                }
              : null
          );

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <AsyncCreatableSelect
                isMulti={isMulti}
                isClearable
                isSearchable
                cacheOptions
                defaultOptions={options.length > 0 ? options : true}
                openMenuOnClick
                openMenuOnFocus
                menuPlacement="auto"
                menuShouldScrollIntoView={false}
                loadOptions={async (inputValue) => {
                  try {
                    const result = await queryFn(inputValue);
                    return result.map(toReactSelectOption);
                  } catch {
                    return [];
                  }
                }}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 999999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 999999,
                  }),
                }}
                placeholder={placeholder}
                options={options}
                value={selectedValue as any}
                onChange={(nextValue) => {
                  if (isMulti) {
                    const nextOptions = Array.isArray(nextValue)
                      ? (nextValue as ReactSelectOption[])
                      : [];

                    setLocalOptions((current) =>
                      nextOptions.reduce(
                        (accumulator, option) =>
                          upsertOption(accumulator, normalizeSelectOption({ id: option.value, value: option.value, label: option.label })),
                        current,
                      ),
                    );

                    field.onChange(nextOptions.map((item) => item.value));
                    return;
                  }

                  const nextOption = nextValue ? (nextValue as ReactSelectOption) : null;

                  if (nextOption) {
                    setLocalOptions((current) =>
                      upsertOption(current, normalizeSelectOption({
                        id: nextOption.value,
                        value: nextOption.value,
                        label: nextOption.label,
                      })),
                    );
                  }

                  field.onChange(nextOption ? nextOption.value : '');
                }}
                onCreateOption={
                  quickCreateKind && createFn
                    ? (inputValue) => {
                        setCreateInputValue(inputValue);
                        setCreateOpen(true);
                      }
                    : undefined
                }
                formatCreateLabel={(inputValue) => `+ Új "${inputValue}" létrehozása`}
                noOptionsMessage={() => 'Nincs találat'}
                loadingMessage={() => 'Betöltés...'}
                classNames={{
                  control: () =>
                    'min-h-10 rounded-xl border border-input bg-background text-sm shadow-sm',
                  valueContainer: () => 'gap-1 px-3 py-1.5',
                  input: () => 'text-sm text-foreground',
                  placeholder: () => 'text-muted-foreground',
                  singleValue: () => 'text-foreground',
                  multiValue: () =>
                    'rounded-md border border-border bg-muted px-1.5 py-0.5',
                  multiValueLabel: () => 'text-xs text-foreground',
                  multiValueRemove: () => 'text-muted-foreground hover:bg-transparent hover:text-foreground',
                  menu: () => 'overflow-hidden rounded-xl border bg-popover shadow-lg',
                  menuPortal: () => '',
                  menuList: () => 'max-h-64 py-1',
                  option: ({ isFocused, isSelected }) =>
                    cn(
                      'cursor-pointer px-3 py-2 text-sm',
                      isFocused && 'bg-accent text-accent-foreground',
                      isSelected && 'bg-primary text-primary-foreground',
                    ),
                  indicatorsContainer: () => 'px-1',
                  dropdownIndicator: () => 'text-muted-foreground',
                  clearIndicator: () => 'text-muted-foreground',
                }}
              />
            </FormControl>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
            <FormMessage />

            {quickCreateKind && createFn ? (
              <TourQuickCreateDialog
                open={createOpen}
                kind={quickCreateKind}
                inputValue={createInputValue}
                title={quickCreateTitle || `Új ${label} létrehozása`}
                onOpenChange={(open) => {
                  setCreateOpen(open);
                  if (!open) {
                    setCreateInputValue('');
                  }
                }}
                onSubmit={async (values) => {
                  const created = await createFn(values);
                  setLocalOptions((current) => upsertOption(current, created));
                  await queryClient.invalidateQueries({ queryKey });

                  if (isMulti) {
                    const currentValues = Array.isArray(field.value)
                      ? field.value
                      : [];
                    field.onChange(Array.from(new Set([...currentValues, created.value])));
                  } else {
                    field.onChange(created.value);
                  }

                  setCreateOpen(false);
                  setCreateInputValue('');
                  return created;
                }}
              />
            ) : null}
          </FormItem>
        );
      }}
    />
  );
}
