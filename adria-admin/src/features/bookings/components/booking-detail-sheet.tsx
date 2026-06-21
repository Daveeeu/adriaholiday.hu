import { Mail, MapPin, Phone, ReceiptText, UsersRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Booking, BookingDetail } from '@/types/domain';

import {
  bookingStatusOptions,
  formatCurrency,
  formatDate,
} from '../lib/booking-utils';
import { BookingStatusBadge } from './booking-status-badge';
import { t } from '@/i18n';

type BookingDetailSheetProps = {
  booking: BookingDetail | null | undefined;
  open: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: Booking['status']) => void;
};

export function BookingDetailSheet({
  booking,
  open,
  isLoading,
  isUpdating,
  onOpenChange,
  onStatusChange,
}: BookingDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Foglalás részletei</SheetTitle>
          <SheetDescription>Foglalás, partner és fizetési adatok.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : !booking ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            {t('bookings.detail.unavailable')}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-primary">
                  {t('bookings.detail.title')}
                </p>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {booking.reference}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {booking.offer.title} •{' '}
                  {formatDate(booking.offerDate.startDate)} -{' '}
                  {formatDate(booking.offerDate.endDate)}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('bookings.detail.statusWorkflow')}</CardTitle>
                <CardDescription>{t('bookings.detail.statusDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {bookingStatusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      booking.status === status.value ? 'default' : 'outline'
                    }
                    disabled={isUpdating}
                    onClick={() => onStatusChange(status.value)}
                    className="justify-start"
                  >
                    {status.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('bookings.detail.customer')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {booking.guestName}
                    </p>
                    <p className="text-muted-foreground">{booking.country}</p>
                  </div>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <span>{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <span>{booking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersRound className="size-4" />
                      <span>
                        {t('bookings.detail.adultsChildren', {
                          adults: booking.adults,
                          children: booking.children,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('bookings.detail.summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>
                      {booking.region.name} • {booking.location.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReceiptText className="size-4" />
                    <span>{booking.apartment.name}</span>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {t('bookings.detail.payment')}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </p>
                    <p className="text-sm">
                      {t('bookings.detail.paid')}:{' '}
                      {formatCurrency(booking.paidAmount, booking.currency)}
                    </p>
                    <p className="text-sm">
                      {t('bookings.detail.outstanding')}:{' '}
                      {formatCurrency(
                        booking.totalAmount - booking.paidAmount,
                        booking.currency,
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('bookings.detail.metadata')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">{t('bookings.detail.checkIn')}</p>
                  <p className="font-medium text-foreground">
                    {formatDate(booking.checkIn)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('bookings.detail.checkOut')}</p>
                  <p className="font-medium text-foreground">
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('bookings.detail.created')}</p>
                  <p className="font-medium text-foreground">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('bookings.detail.offerDatePrice')}</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(
                      booking.offerDate.price,
                      booking.offerDate.currency,
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">{t('bookings.detail.notes')}</p>
                  <p className="font-medium text-foreground">
                    {booking.notes ?? t('bookings.detail.noNotes')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
