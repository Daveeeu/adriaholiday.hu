import type { ComponentProps } from 'react';

import { FieldHelp } from '@/components/common/field-help';
import { FormLabel, useFormField } from '@/components/ui/form';

import { getTourFieldHelp } from '../lib/tour-field-help';

/** The help icon of a tour form field (by its form path); nothing when the guide has no entry for it. */
export function TourFieldHelp({ name }: { name: string }) {
  const help = getTourFieldHelp(name);

  return help ? <FieldHelp help={help} /> : null;
}

/** A tour form field's label with its help icon, for use inside a FormField. */
export function TourFormLabel(props: ComponentProps<typeof FormLabel>) {
  const { name } = useFormField();

  return (
    <div className="flex items-center gap-1.5">
      <FormLabel {...props} />
      <TourFieldHelp name={name} />
    </div>
  );
}
