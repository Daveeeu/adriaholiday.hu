import { useFormState, useWatch, type UseFormReturn } from 'react-hook-form';

import {
  tourFormSectionsWithErrors,
  type TourFormSectionKey,
} from '../lib/tour-form-sections';
import type { Tour, TourFormValues } from '../lib/tours.types';
import { TourEditorNav } from './TourEditorNav';
import { TourForm } from './TourForm';

type TourEditorBodyProps = {
  form: UseFormReturn<TourFormValues>;
  tour?: Partial<Tour>;
  section: TourFormSectionKey;
  onSectionChange: (section: TourFormSectionKey) => void;
};

/** The section menu beside the open section's form. */
export function TourEditorBody({
  form,
  tour,
  section,
  onSectionChange,
}: TourEditorBodyProps) {
  const { errors } = useFormState({ control: form.control });
  const [gallery, dates, priceItems, programDays, routeStops] = useWatch({
    control: form.control,
    name: ['gallery', 'dates', 'priceItems', 'programDays', 'routeStops'],
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
      <TourEditorNav
        active={section}
        onSelect={onSectionChange}
        invalid={tourFormSectionsWithErrors(errors)}
        counts={{
          gallery: gallery?.length,
          dates: dates?.length,
          priceItems: priceItems?.length,
          programDays: programDays?.length,
          routeMap: routeStops?.length,
        }}
      />
      <TourForm form={form} tour={tour} section={section} />
    </div>
  );
}
