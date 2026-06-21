import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { t } from '@/i18n';
import type { Booking } from '@/types/domain';

import { formatCurrency, formatDate } from '../lib/booking-utils';
import { BookingStatusBadge } from './booking-status-badge';

export type BookingRow = Booking & {
  offerTitle: string;
  regionName: string;
  offerDateLabel: string;
  totalGuests: number;
};

type BookingsTableProps = {
  bookings: BookingRow[];
  onSelectBooking: (bookingId: string) => void;
};

export function BookingsTable({
  bookings,
  onSelectBooking,
}: BookingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bookings.table.title')}</CardTitle>
        <CardDescription>{t('bookings.table.description')}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bookings.table.customer')}</TableHead>
              <TableHead>{t('bookings.table.offer')}</TableHead>
              <TableHead>{t('bookings.table.stay')}</TableHead>
              <TableHead>{t('bookings.table.guests')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('bookings.table.total')}</TableHead>
              <TableHead className="w-[120px] text-right">
                {t('bookings.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  {t('bookings.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.reference} • {booking.regionName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {booking.offerTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.offerDateLabel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        {formatDate(booking.checkIn)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        - {formatDate(booking.checkOut)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.totalGuests}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectBooking(booking.id)}
                    >
                      <Eye className="size-4" />
                      {t('common.details')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
