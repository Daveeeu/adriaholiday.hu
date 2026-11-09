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
  to: string;
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
    newBookings: number;
    upcomingBookings: number;
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

const MONTH_FORMAT = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short' });

/** A Y-m key from the API as a Hungarian label, e.g. 2026. nov. */
function formatMonth(month: string) {
  return MONTH_FORMAT.format(new Date(`${month}-01T12:00:00`));
}

function toMetricSummary(response: DashboardSummaryResponse): DashboardSummary {
  return {
    metrics: [
      {
        label: t('dashboard.metric.newBookings'),
        value: formatNumber(response.counts.newBookings),
        hint: t('dashboard.metric.newBookingsHint'),
        to: '/bookings/tour-bookings',
      },
      {
        label: t('dashboard.metric.newInquiries'),
        value: formatNumber(response.counts.newInquiries),
        hint: t('dashboard.metric.newInquiriesHint'),
        to: '/bookings/tour-inquiries',
      },
      {
        label: t('dashboard.metric.upcomingBookings'),
        value: formatNumber(response.counts.upcomingBookings),
        hint: t('dashboard.metric.upcomingBookingsHint'),
        to: '/bookings/tour-bookings',
      },
      {
        label: t('dashboard.metric.monthlyRevenue'),
        value: formatHuf(response.counts.monthlyRevenue),
        hint: t('dashboard.metric.monthlyRevenueHint'),
        to: '/bookings',
      },
      {
        label: t('dashboard.metric.messages'),
        value: formatNumber(response.counts.messages),
        hint: t('dashboard.metric.messagesHint'),
        to: '/bookings/messages',
      },
      {
        label: t('dashboard.metric.tours'),
        value: formatNumber(response.counts.tours),
        hint: t('dashboard.metric.toursHint'),
        to: '/tours',
      },
      {
        label: t('dashboard.metric.apartments'),
        value: formatNumber(response.counts.apartments),
        hint: t('dashboard.metric.apartmentsHint'),
        to: '/apartments',
      },
      {
        label: t('dashboard.metric.coupons'),
        value: formatNumber(response.counts.coupons),
        hint: t('dashboard.metric.couponsHint'),
        to: '/bookings/coupons',
      },
      {
        label: t('dashboard.metric.blogArticles'),
        value: formatNumber(response.counts.blogArticles),
        hint: t('dashboard.metric.blogArticlesHint'),
        to: '/blog',
      },
    ],
    monthlyRevenue: response.monthlyRevenue.map(({ month, revenue }) => ({
      month: formatMonth(month),
      revenue,
    })),
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
