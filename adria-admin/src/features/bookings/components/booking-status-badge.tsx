import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types/domain';

import { formatBookingStatus } from '../lib/booking-utils';

const statusClasses: Record<Booking['status'], string> = {
  pending:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  confirmed:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  cancelled:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
};

type BookingStatusBadgeProps = {
  status: Booking['status'];
  className?: string;
};

export function BookingStatusBadge({
  status,
  className,
}: BookingStatusBadgeProps) {
  return (
    <Badge className={cn(statusClasses[status], className)}>
      {formatBookingStatus(status)}
    </Badge>
  );
}
