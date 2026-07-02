import { apiClient, type PaginatedResponse } from '@/lib/api-client';

export type AnalyticsFilters = {
  from?: string;
  to?: string;
  eventName?: string;
  entityType?: string;
  entitySlug?: string;
  utmCampaign?: string;
  offerSlug?: string;
  categorySlug?: string;
};

export type AnalyticsSummary = {
  counts: {
    pageViews: number;
    offerViews: number;
    categoryViews: number;
    ctaClicks: number;
    priceboxViews: number;
    dateSelects: number;
    filterClicks: number;
  };
  topCtas: Array<{
    ctaName: string;
    eventCount: number;
  }>;
};

export type AnalyticsTopEntity = {
  entityType: string;
  entityId: string | null;
  entitySlug: string;
  eventCount: number;
  uniqueVisitors: number;
  lastSeenAt: string | null;
};

export type AnalyticsEventRow = {
  id: number;
  eventId: string;
  eventName: string;
  entityType: string | null;
  entityId: string | null;
  entitySlug: string | null;
  pagePath: string;
  utmCampaign: string | null;
  utmSource: string | null;
  sessionId: string;
  visitorId: string;
  metadata: Record<string, unknown>;
  consentAnalytics: boolean;
  consentMarketing: boolean;
  createdAt: string | null;
};

export type AnalyticsUtmRow = {
  utmCampaign: string;
  eventCount: number;
  uniqueVisitors: number;
  pageViewCount: number;
  offerViewCount: number;
  leadSubmitCount: number;
  lastSeenAt: string | null;
};

export type AnalyticsFunnelStep = {
  key: string;
  label: string;
  count: number;
  dropoffRate: number | null;
};

function toQuery(filters?: AnalyticsFilters) {
  return {
    from: filters?.from,
    to: filters?.to,
    event_name: filters?.eventName,
    entity_type: filters?.entityType,
    entity_slug: filters?.entitySlug,
    utm_campaign: filters?.utmCampaign,
  };
}

export async function getAnalyticsSummary(filters?: AnalyticsFilters) {
  return apiClient.get<AnalyticsSummary>('/analytics/summary', {
    query: toQuery(filters),
  });
}

export async function getAnalyticsTopOffers(filters?: AnalyticsFilters) {
  return apiClient.get<{ items: AnalyticsTopEntity[] }>('/analytics/top-offers', {
    query: {
      ...toQuery(filters),
      limit: 10,
    },
  });
}

export async function getAnalyticsTopCategories(filters?: AnalyticsFilters) {
  return apiClient.get<{ items: AnalyticsTopEntity[] }>('/analytics/top-categories', {
    query: {
      ...toQuery(filters),
      limit: 10,
    },
  });
}

export async function getAnalyticsEvents(
  filters?: AnalyticsFilters,
  page = 1,
  perPage = 20,
) {
  return apiClient.get<PaginatedResponse<AnalyticsEventRow>>('/analytics/events', {
    query: {
      ...toQuery(filters),
      page,
      perPage,
    },
  });
}

export async function getAnalyticsUtm(filters?: AnalyticsFilters) {
  return apiClient.get<{ items: AnalyticsUtmRow[] }>('/analytics/utm', {
    query: {
      ...toQuery(filters),
      limit: 10,
    },
  });
}

export async function getAnalyticsFunnel(filters?: AnalyticsFilters) {
  return apiClient.get<{ steps: AnalyticsFunnelStep[] }>('/analytics/funnel', {
    query: {
      from: filters?.from,
      to: filters?.to,
      utm_campaign: filters?.utmCampaign,
      offer_slug: filters?.offerSlug,
      category_slug: filters?.categorySlug,
    },
  });
}
