import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarRange, Filter, Funnel, MousePointerClick, MousePointerSquareDashed, Tags, TicketPercent } from 'lucide-react';

import { PageLoader } from '@/components/common/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getAnalyticsEvents,
  getAnalyticsFunnel,
  getAnalyticsSummary,
  getAnalyticsTopCategories,
  getAnalyticsTopOffers,
  getAnalyticsUtm,
  type AnalyticsFilters,
} from '@/services/analytics-service';

const metricIcons = [
  BarChart3,
  Tags,
  TicketPercent,
  MousePointerClick,
  MousePointerSquareDashed,
  CalendarRange,
  Filter,
] as const;

const EVENT_OPTIONS = [
  '',
  'page_view',
  'offer_view',
  'category_view',
  'cta_click',
  'pricebox_view',
  'date_select',
  'filter_click',
  'booking_anchor_click',
  'lead_submit',
  'booking_start',
  'booking_success',
] as const;

const ENTITY_TYPE_OPTIONS = ['', 'tour', 'category', 'tour_date', 'program_day', 'gallery_item'] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Nincs adat';
  }

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function AnalyticsMetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: (typeof metricIcons)[number];
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/40">
      <CardContent className="relative p-6">
        <div className="absolute right-4 top-4 rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-4 text-3xl font-semibold tracking-tight">{formatNumber(value)}</p>
        <p className="mt-4 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  );
}

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    from: '',
    to: '',
    eventName: '',
    entityType: '',
    entitySlug: '',
    utmCampaign: '',
    offerSlug: '',
    categorySlug: '',
  });
  const [page, setPage] = useState(1);
  const perPage = 20;

  const normalizedFilters = useMemo<AnalyticsFilters>(
    () => ({
      from: filters.from || undefined,
      to: filters.to || undefined,
      eventName: filters.eventName || undefined,
      entityType: filters.entityType || undefined,
      entitySlug: filters.entitySlug?.trim() || undefined,
      utmCampaign: filters.utmCampaign?.trim() || undefined,
      offerSlug: filters.offerSlug?.trim() || undefined,
      categorySlug: filters.categorySlug?.trim() || undefined,
    }),
    [filters],
  );

  const summaryQuery = useQuery({
    queryKey: ['analytics-summary', normalizedFilters],
    queryFn: () => getAnalyticsSummary(normalizedFilters),
  });

  const topOffersQuery = useQuery({
    queryKey: ['analytics-top-offers', normalizedFilters],
    queryFn: () => getAnalyticsTopOffers(normalizedFilters),
  });

  const topCategoriesQuery = useQuery({
    queryKey: ['analytics-top-categories', normalizedFilters],
    queryFn: () => getAnalyticsTopCategories(normalizedFilters),
  });

  const utmQuery = useQuery({
    queryKey: ['analytics-utm', normalizedFilters],
    queryFn: () => getAnalyticsUtm(normalizedFilters),
  });

  const eventsQuery = useQuery({
    queryKey: ['analytics-events', normalizedFilters, page, perPage],
    queryFn: () => getAnalyticsEvents(normalizedFilters, page, perPage),
  });

  const funnelQuery = useQuery({
    queryKey: ['analytics-funnel', normalizedFilters.from, normalizedFilters.to, normalizedFilters.utmCampaign, normalizedFilters.offerSlug, normalizedFilters.categorySlug],
    queryFn: () => getAnalyticsFunnel(normalizedFilters),
  });

  const isLoading = summaryQuery.isLoading && topOffersQuery.isLoading && topCategoriesQuery.isLoading && utmQuery.isLoading && eventsQuery.isLoading && funnelQuery.isLoading;
  const isError = summaryQuery.isError || topOffersQuery.isError || topCategoriesQuery.isError || utmQuery.isError || eventsQuery.isError || funnelQuery.isError;

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !summaryQuery.data || !topOffersQuery.data || !topCategoriesQuery.data || !utmQuery.data || !eventsQuery.data || !funnelQuery.data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Az analitika riport adatai nem tölthetők be.
      </div>
    );
  }

  const summary = summaryQuery.data;
  const events = eventsQuery.data;
  const totalPages = Math.max(1, Math.ceil(events.totalCount / events.perPage));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-sky-500/10">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr] lg:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BarChart3 className="size-4" />
              Analitika
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Analytics dashboard V1
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                First-party analytics riport az `analytics_events` táblából. A kártyák,
                toplisták és eseménytábla ugyanazokat a dátum- és entitásszűrőket használják.
              </p>
            </div>
          </div>

          <Card className="border-white/40 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Gyakori CTA-k</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.topCtas.length > 0 ? (
                summary.topCtas.slice(0, 4).map((cta) => (
                  <div key={cta.ctaName} className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{cta.ctaName}</span>
                    <span className="text-lg font-semibold">{formatNumber(cta.eventCount)}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                  A kiválasztott szűrőkkel nincs CTA adat.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Szűrők</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kezdő dátum</label>
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, from: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Záró dátum</label>
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, to: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Esemény</label>
            <Select
              value={filters.eventName}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, eventName: event.target.value }));
              }}
            >
              <option value="">Összes</option>
              {EVENT_OPTIONS.filter(Boolean).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Entitás típus</label>
            <Select
              value={filters.entityType}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, entityType: event.target.value }));
              }}
            >
              <option value="">Összes</option>
              {ENTITY_TYPE_OPTIONS.filter(Boolean).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Entity slug</label>
            <Input
              placeholder="offer-alfa"
              value={filters.entitySlug}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, entitySlug: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">UTM kampány</label>
            <Input
              placeholder="summer-launch"
              value={filters.utmCampaign}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, utmCampaign: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Offer slug (funnel)</label>
            <Input
              placeholder="offer-alfa"
              value={filters.offerSlug}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, offerSlug: event.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category slug (funnel)</label>
            <Input
              placeholder="korutazasok"
              value={filters.categorySlug}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, categorySlug: event.target.value }));
              }}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-2 flex justify-end items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPage(1);
                setFilters({
                  from: '',
                  to: '',
                  eventName: '',
                  entityType: '',
                  entitySlug: '',
                  utmCampaign: '',
                  offerSlug: '',
                  categorySlug: '',
                });
              }}
            >
              Szűrők törlése
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard label="Összes page_view" value={summary.counts.pageViews} hint="Oldalmegtekintés események" icon={metricIcons[0]} />
        <AnalyticsMetricCard label="Összes offer_view" value={summary.counts.offerViews} hint="Ajánlat részletmegtekintések" icon={metricIcons[1]} />
        <AnalyticsMetricCard label="Összes category_view" value={summary.counts.categoryViews} hint="Kategóriaoldal megtekintések" icon={metricIcons[2]} />
        <AnalyticsMetricCard label="CTA kattintások" value={summary.counts.ctaClicks} hint="Közös CTA helperből mért kattintások" icon={metricIcons[3]} />
        <AnalyticsMetricCard label="PriceBox megjelenések" value={summary.counts.priceboxViews} hint="Offer oldali PriceBox view események" icon={metricIcons[4]} />
        <AnalyticsMetricCard label="Date select" value={summary.counts.dateSelects} hint="Utazási dátum választások" icon={metricIcons[5]} />
        <AnalyticsMetricCard label="Filter click" value={summary.counts.filterClicks} hint="Kategória szűrő használatok" icon={metricIcons[6]} />
      </div>

      <Card className="border-border/60 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Funnel className="size-5" />
            Konverziós tölcsér
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnelQuery.data.steps.some((step) => step.count > 0) ? (
            funnelQuery.data.steps.map((step, index, steps) => {
              const maxCount = steps[0]?.count ?? 0;
              const width = maxCount > 0 ? Math.max(4, Math.round((step.count / maxCount) * 100)) : 0;

              return (
                <div key={step.key} className="space-y-2 rounded-2xl border border-border/60 bg-muted/10 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{index + 1}. {step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.key}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold">{formatNumber(step.count)}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.dropoffRate === null ? 'Nincs lemorzsolódás adat' : `${step.dropoffRate.toFixed(1)}% lemorzsolódás`}
                      </div>
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-sm text-muted-foreground">
              A kiválasztott szűrőkkel nincs funnel adat.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Top ajánlatok</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Megtekintés</TableHead>
                  <TableHead>Egyedi visitor</TableHead>
                  <TableHead>Utolsó esemény</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOffersQuery.data.items.length > 0 ? (
                  topOffersQuery.data.items.map((item) => (
                    <TableRow key={`${item.entitySlug}-${item.entityId ?? 'na'}`}>
                      <TableCell className="font-medium">{item.entitySlug}</TableCell>
                      <TableCell>{formatNumber(item.eventCount)}</TableCell>
                      <TableCell>{formatNumber(item.uniqueVisitors)}</TableCell>
                      <TableCell>{formatDateTime(item.lastSeenAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableRow colSpan={4} label="Nincs ajánlat adat a kiválasztott szűrőkkel." />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Top kategóriák</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Megtekintés</TableHead>
                  <TableHead>Egyedi visitor</TableHead>
                  <TableHead>Utolsó esemény</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCategoriesQuery.data.items.length > 0 ? (
                  topCategoriesQuery.data.items.map((item) => (
                    <TableRow key={`${item.entitySlug}-${item.entityId ?? 'na'}`}>
                      <TableCell className="font-medium">{item.entitySlug}</TableCell>
                      <TableCell>{formatNumber(item.eventCount)}</TableCell>
                      <TableCell>{formatNumber(item.uniqueVisitors)}</TableCell>
                      <TableCell>{formatDateTime(item.lastSeenAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableRow colSpan={4} label="Nincs kategória adat a kiválasztott szűrőkkel." />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Legutóbbi események</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Esemény</TableHead>
                  <TableHead>Entitás</TableHead>
                  <TableHead>UTM kampány</TableHead>
                  <TableHead>Oldal</TableHead>
                  <TableHead>Időpont</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.items.length > 0 ? (
                  events.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.eventName}</TableCell>
                      <TableCell>{item.entitySlug ?? item.entityType ?? 'Nincs'}</TableCell>
                      <TableCell>{item.utmCampaign ?? 'Nincs'}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{item.pagePath}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableRow colSpan={5} label="Nincs esemény a kiválasztott szűrőkkel." />
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {formatNumber(events.totalCount)} esemény • {events.page}. oldal / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={events.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  Előző
                </Button>
                <Button variant="outline" disabled={events.page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                  Következő
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Top UTM kampányok</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampány</TableHead>
                  <TableHead>Összes event</TableHead>
                  <TableHead>Offer view</TableHead>
                  <TableHead>Visitor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utmQuery.data.items.length > 0 ? (
                  utmQuery.data.items.map((item) => (
                    <TableRow key={item.utmCampaign}>
                      <TableCell className="font-medium">{item.utmCampaign}</TableCell>
                      <TableCell>{formatNumber(item.eventCount)}</TableCell>
                      <TableCell>{formatNumber(item.offerViewCount)}</TableCell>
                      <TableCell>{formatNumber(item.uniqueVisitors)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableRow colSpan={4} label="Nincs UTM kampány adat a kiválasztott szűrőkkel." />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
