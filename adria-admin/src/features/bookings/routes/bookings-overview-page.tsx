import { useMemo } from 'react';
import { ArrowRight, Building2, CalendarDays, Mail, Megaphone, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  getApartmentBookings,
  getBanners,
  getCoupons,
  getMessages,
  getPartnerFinances,
  getTourBookings,
  getTourInquiries,
} from '../lib/bookings.api';

const countQuery = {
  page: 1,
  perPage: 1,
  search: '',
  sortBy: 'createdAt',
  sortDirection: 'desc' as const,
};

type OverviewCard = {
  title: string;
  description: string;
  to: string;
  count: string;
  icon: typeof CalendarDays;
};

function useTotalCount<T extends { totalCount: number }>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
) {
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
  });

  return {
    count: isLoading || !data ? '—' : data.totalCount.toLocaleString('hu-HU'),
  };
}

export function BookingsOverviewPage() {
  const tourBookings = useTotalCount(['bookings', 'tour-bookings', 'count'], () =>
    getTourBookings(countQuery),
  );
  const tourInquiries = useTotalCount(['bookings', 'tour-inquiries', 'count'], () =>
    getTourInquiries(countQuery),
  );
  const apartmentBookings = useTotalCount(['bookings', 'apartment-bookings', 'count'], () =>
    getApartmentBookings(countQuery),
  );
  const partnerFinances = useTotalCount(['bookings', 'partner-finances', 'count'], () =>
    getPartnerFinances(countQuery),
  );
  const banners = useTotalCount(['bookings', 'banner-generator', 'count'], () =>
    getBanners(countQuery),
  );
  const messages = useTotalCount(['bookings', 'messages', 'count'], () =>
    getMessages(countQuery),
  );
  const coupons = useTotalCount(['bookings', 'coupons', 'count'], () =>
    getCoupons(countQuery),
  );

  const cards = useMemo<OverviewCard[]>(
    () => [
      {
        title: 'Körutazás foglalások',
        description: 'A fő körutazás foglalási lista és a kapcsolódó szerkesztőpanel.',
        to: '/bookings/tour-bookings',
        count: tourBookings.count,
        icon: CalendarDays,
      },
      {
        title: 'Körutazás ajánlatkérések',
        description: 'Ajánlatkérések feldolgozása és státusz-kezelés.',
        to: '/bookings/tour-inquiries',
        count: tourInquiries.count,
        icon: Mail,
      },
      {
        title: 'Apartman foglalások',
        description: 'Apartmanos foglalások jóváírással és utazási dátumokkal.',
        to: '/bookings/apartment-bookings',
        count: apartmentBookings.count,
        icon: Building2,
      },
      {
        title: 'Partner pénzügyek',
        description: 'Jutalék jóváírás, kifizetés és egyenlegkezelés.',
        to: '/bookings/partner-finances',
        count: partnerFinances.count,
        icon: Ticket,
      },
      {
        title: 'Banner generálás',
        description: 'Partner bannerek konfigurálása és előnézete.',
        to: '/bookings/banner-generator',
        count: banners.count,
        icon: Megaphone,
      },
      {
        title: 'Üzenetek',
        description: 'Kapcsolatfelvételi üzenetek readonly tartalommal.',
        to: '/bookings/messages',
        count: messages.count,
        icon: Mail,
      },
      {
        title: 'Kuponok',
        description: 'Kuponkódok, lejáratok és felhasználási állapotok.',
        to: '/bookings/coupons',
        count: coupons.count,
        icon: Ticket,
      },
      {
        title: 'E-mail CSV exportálás',
        description: 'Export foglalásokból és ajánlatkérésekből.',
        to: '/bookings/email-csv-export',
        count: '2 export',
        icon: Mail,
      },
    ],
    [
      apartmentBookings.count,
      banners.count,
      coupons.count,
      messages.count,
      partnerFinances.count,
      tourBookings.count,
      tourInquiries.count,
    ],
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border bg-gradient-to-br from-white via-white to-muted/25 p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,195,137,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(22,184,255,0.1),transparent_32%)]" />
        <div className="relative space-y-2">
          <p className="text-sm font-medium text-primary">Foglalások</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Foglalások áttekintés</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Innen éred el a bookings modul minden alrészét. A kártyák az aktuális
            darabszámokat mutatják.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="group block">
            <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c389]/10 to-[#16b8ff]/10 text-[#00a878]">
                    <card.icon className="size-5" />
                  </div>
                  <div className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {card.count}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription className="min-h-10">{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0 text-sm font-medium text-muted-foreground">
                <span>Megnyitás</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
