import { Building2 } from 'lucide-react';
import { useMemo } from 'react';

import { useApartmentTypes } from '@/features/apartments/lib/use-apartment-types';
import { useAuthStore } from '@/store/auth-store';

import { staticNavigationItems, type NavigationItem } from './navigation';

export function useNavigationItems(): NavigationItem[] {
  // The per-type links need the type list; without the right to read it the
  // request would only fail with 403 on every page.
  const canListApartmentTypes = useAuthStore((state) =>
    state.hasPermission('apartment-types.viewAny'),
  );
  const { data: apartmentTypes } = useApartmentTypes({
    enabled: canListApartmentTypes,
  });

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
