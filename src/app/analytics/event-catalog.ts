export const analyticsEventNames = [
  "page_view",
  "category_view",
  "homepage_offer_view",
  "offer_view",
  "gallery_open",
  "gallery_next",
  "gallery_previous",
  "program_view",
  "program_day_open",
  "pricebox_view",
  "date_select",
  "participants_change",
  "cta_click",
  "booking_anchor_click",
  "filter_click",
  "filter_remove",
  "search",
  "phone_click",
  "email_click",
  "whatsapp_click",
  "lead_start",
  "lead_submit",
  "booking_start",
  "booking_success",
  "booking_error",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type AnalyticsEntity = {
  type?: string;
  id?: string | number | null;
  slug?: string | null;
};

export type AnalyticsTrackPayload = {
  entity?: AnalyticsEntity;
  metadata?: Record<string, unknown>;
};
