import { useQuery } from '@tanstack/react-query';

import { getApartmentTypes } from '@/services/apartment-type-service';

export const apartmentTypesQueryKey = ['apartment-types'];

export function useApartmentTypes() {
  return useQuery({
    queryKey: apartmentTypesQueryKey,
    queryFn: () => getApartmentTypes(),
    staleTime: 60_000,
  });
}
