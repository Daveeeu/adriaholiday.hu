import {
  Building2,
  CalendarCheck2,
  FileText,
  LayoutGrid,
  Mail,
  MapPinned,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PageLoader } from '@/components/common/page-loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/features/dashboard/components/dashboard-metrics';
import { RecentActivityFeed } from '@/features/dashboard/components/recent-activity-feed';
import { t } from '@/i18n';
import { getDashboardSummary } from '@/services/dashboard-service';

const metricIcons = [
  Building2,
  MapPinned,
  CalendarCheck2,
  FileText,
  TrendingUp,
  Ticket,
  LayoutGrid,
  Mail,
] as const;

function formatHuf(value: number) {
  return new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: 0,
  }).format(value) + ' Ft';
}

function toNumericValue(value: number | string | readonly (number | string)[] | undefined) {
  if (Array.isArray(value)) {
    return toNumericValue(value[0]);
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return 0;
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t('dashboard.error.load')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-amber-500/10">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div className="space-y-4">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              {t('dashboard.badge')}
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('dashboard.title')}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('dashboard.description')}
              </p>
            </div>
          </div>

          <Card className="border-white/40 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('dashboard.summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.metric.monthlyRevenue')}
                </span>
                <span className="text-lg font-semibold">
                  {data.metrics[4]?.value}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.metric.activeBookings')}
                </span>
                <span className="text-lg font-semibold">
                  {data.metrics[2]?.value}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.metric.newInquiries')}
                </span>
                <span className="text-lg font-semibold">
                  {data.metrics[3]?.value}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <DashboardMetrics
        items={data.metrics.map((metric, index) => ({
          ...metric,
          icon: metricIcons[index] ?? LayoutGrid,
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>{t('dashboard.chart.revenue.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => formatHuf(toNumericValue(value))}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [formatHuf(toNumericValue(value)), t('dashboard.chart.revenue.tooltip')]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0f766e' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <RecentActivityFeed items={data.recentActivity} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        Az Adria Holiday rendszer aktuális állapota.
      </div>
    </div>
  );
}
