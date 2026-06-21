import type { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

import { APARTMENT_SERVICE_GROUPS } from '@/features/apartments/constants/apartment-services';
import type { ApartmentFormValues } from '../lib/apartments.types';

type ApartmentServicesSectionProps = {
  form: UseFormReturn<ApartmentFormValues>;
};

export function ApartmentServicesSection({ form }: ApartmentServicesSectionProps) {
  const selectedServices = useWatch({ control: form.control, name: 'services' });
  const selectedAmenities = useWatch({ control: form.control, name: 'amenities' });

  useEffect(() => {
    const nextServices = selectedServices ?? [];
    const currentAmenities = selectedAmenities ?? [];
    if (
      nextServices.length !== currentAmenities.length ||
      nextServices.some((service, index) => service !== currentAmenities[index])
    ) {
      form.setValue('amenities', nextServices, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, selectedAmenities, selectedServices]);

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <div>
        <h3 className="text-base font-semibold">Szolgáltatások</h3>
        <p className="text-sm text-muted-foreground">Többszörös kiválasztású szolgáltatáslista.</p>
      </div>

      <FormField
        control={form.control}
        name="services"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="space-y-4">
                {APARTMENT_SERVICE_GROUPS.map((group) => (
                  <div key={group.key} className="space-y-3">
                    <FormLabel className="text-sm font-semibold">
                      {group.label}
                    </FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {group.services.map((service) => {
                        const selected = selectedServices.includes(service.value);

                        return (
                          <button
                            key={service.value}
                            type="button"
                            className={cn(
                              'rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                              selected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background hover:border-primary/40',
                            )}
                            onClick={() => {
                              const nextValues = selected
                                ? field.value.filter((item) => item !== service.value)
                                : [...field.value, service.value];

                              field.onChange(nextValues);
                            }}
                          >
                            {service.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
