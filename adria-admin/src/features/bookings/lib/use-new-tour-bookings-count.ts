import { useQuery } from '@tanstack/react-query';

import { getTourBookings } from './bookings.api';
import { useAuthStore } from '@/store/auth-store';

export function useNewTourBookingsCount() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canView = hasPermission('bookings.viewAny');

  const { data } = useQuery({
    queryKey: ['bookings', 'tour-bookings', 'new-count'],
    queryFn: () =>
      getTourBookings({
        page: 1,
        perPage: 1,
        search: '',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        status: 'new',
      }),
    enabled: canView,
    refetchInterval: 60_000,
  });

  return data?.totalCount ?? 0;
}
