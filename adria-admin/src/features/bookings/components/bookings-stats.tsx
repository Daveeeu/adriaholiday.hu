import { Activity, BadgeEuro, CircleAlert, UsersRound } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { formatCurrency } from '../lib/booking-utils';

export type BookingStatistics = {
  totalBookings: number;
  pendingBookings: number;
  totalGuests: number;
  confirmedRevenue: number;
  outstandingBalance: number;
  completedBookings: number;
  cancelledBookings: number;
};

type BookingsStatsProps = {
  stats: BookingStatistics;
};

export function BookingsStats({ stats }: BookingsStatsProps) {
  const cards = [
    {
      title: 'Total bookings',
      value: stats.totalBookings.toString(),
      description: `${stats.completedBookings} completed, ${stats.cancelledBookings} cancelled`,
      icon: Activity,
    },
    {
      title: 'Pending follow-up',
      value: stats.pendingBookings.toString(),
      description: `${formatCurrency(stats.outstandingBalance)} still open`,
      icon: CircleAlert,
    },
    {
      title: 'Total guests',
      value: stats.totalGuests.toString(),
      description: 'Adults and children across all reservations',
      icon: UsersRound,
    },
    {
      title: 'Confirmed revenue',
      value: formatCurrency(stats.confirmedRevenue),
      description: 'Confirmed and completed reservation value',
      icon: BadgeEuro,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/40 p-2 text-muted-foreground">
              <card.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
