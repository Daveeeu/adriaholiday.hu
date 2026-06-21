import { apiClient } from '@/lib/api-client';
import { t } from '@/i18n';

type DashboardActivityKind =
  | 'booking'
  | 'message'
  | 'coupon'
  | 'tour'
  | 'apartment'
  | 'blog'
  | 'offer'
  | 'bus'
  | 'system';

export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
  trend: string;
};

export type DashboardMonthlyPoint = {
  month: string;
  revenue: number;
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  targetUrl: string;
  kind: DashboardActivityKind;
};

export type DashboardSummary = {
  metrics: DashboardMetric[];
  monthlyRevenue: DashboardMonthlyPoint[];
  recentActivity: DashboardActivity[];
};

type DashboardSummaryResponse = {
  counts: {
    apartments: number;
    tours: number;
    bookings: number;
    messages: number;
    coupons: number;
    homepageOffers: number;
    blogArticles: number;
    buses: number;
    activeBookings: number;
    newInquiries: number;
    monthlyRevenue: number;
  };
  monthlyRevenue: DashboardMonthlyPoint[];
  recentActivity: DashboardActivity[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value);
}

function formatHuf(value: number) {
  return new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: 0,
  }).format(value) + ' Ft';
}

function toMetricSummary(response: DashboardSummaryResponse): DashboardSummary {
  return {
    metrics: [
      {
        label: t('dashboard.metric.apartments'),
        value: formatNumber(response.counts.apartments),
        hint: t('dashboard.metric.apartmentsHint'),
        trend: t('dashboard.metric.apartmentsTrend'),
      },
      {
        label: t('dashboard.metric.tours'),
        value: formatNumber(response.counts.tours),
        hint: t('dashboard.metric.toursHint'),
        trend: t('dashboard.metric.toursTrend'),
      },
      {
        label: t('dashboard.metric.activeBookings'),
        value: formatNumber(response.counts.activeBookings),
        hint: t('dashboard.metric.activeBookingsHint'),
        trend: t('dashboard.metric.activeBookingsTrend'),
      },
      {
        label: t('dashboard.metric.newInquiries'),
        value: formatNumber(response.counts.newInquiries),
        hint: t('dashboard.metric.newInquiriesHint'),
        trend: t('dashboard.metric.newInquiriesTrend'),
      },
      {
        label: t('dashboard.metric.monthlyRevenue'),
        value: formatHuf(response.counts.monthlyRevenue),
        hint: t('dashboard.metric.monthlyRevenueHint'),
        trend: t('dashboard.metric.monthlyRevenueTrend'),
      },
      {
        label: t('dashboard.metric.coupons'),
        value: formatNumber(response.counts.coupons),
        hint: t('dashboard.metric.couponsHint'),
        trend: t('dashboard.metric.couponsTrend'),
      },
      {
        label: t('dashboard.metric.blogArticles'),
        value: formatNumber(response.counts.blogArticles),
        hint: t('dashboard.metric.blogArticlesHint'),
        trend: t('dashboard.metric.blogArticlesTrend'),
      },
      {
        label: t('dashboard.metric.messages'),
        value: formatNumber(response.counts.messages),
        hint: t('dashboard.metric.messagesHint'),
        trend: t('dashboard.metric.messagesTrend'),
      },
    ],
    monthlyRevenue: response.monthlyRevenue,
    recentActivity: response.recentActivity,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummaryResponse>(
    '/api/admin/dashboard/summary',
  );

  return toMetricSummary(response);
}

export async function saveSettings<T>(values: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return values;
}
