import { Building2 } from 'lucide-react';
import { useMemo } from 'react';

import { useApartmentTypes } from '@/features/apartments/lib/use-apartment-types';

import { staticNavigationItems, type NavigationItem } from './navigation';

export function useNavigationItems(): NavigationItem[] {
  const { data: apartmentTypes } = useApartmentTypes();

  return useMemo(() => {
    const activeTypeChildren = (apartmentTypes ?? [])
      .filter((type) => type.isActive)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((type) => ({
        to: `/apartments/${type.slug}`,
        labelKey: type.name,
        icon: Building2,
        permission: 'apartments.viewAny',
      }));

    return staticNavigationItems.map((item) => {
      if ('children' in item && item.labelKey === 'nav.apartments') {
        const [overview, ...adminRoutes] = item.children;
        return {
          ...item,
          children: [overview, ...activeTypeChildren, ...adminRoutes],
        };
      }

      return item;
    });
  }, [apartmentTypes]);
}
