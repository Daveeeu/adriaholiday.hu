export const analyticsEventNames = [
  "page_view",
  "category_view",
  "homepage_offer_view",
  "offer_view",
  "item_list_view",
  "item_select",
  "gallery_open",
  "gallery_next",
  "gallery_previous",
  "program_view",
  "program_day_open",
  "program_pdf_download",
  "program_pdf_print",
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
  "newsletter_signup",
  "payment_result",
  "page_not_found",
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

/** A tour, apartment or other bookable offer in a commerce event. */
export type AnalyticsItem = {
  id: string | number;
  name: string;
  category?: string;
  variant?: string;
  price?: number;
  quantity?: number;
  index?: number;
  listName?: string;
};

/** Commerce data for GA4 ecommerce reports; sent to Google Tag Manager only. */
export type AnalyticsEcommerce = {
  items: AnalyticsItem[];
  value?: number;
  currency?: string;
  transactionId?: string | number;
  listName?: string;
};

export type AnalyticsTrackPayload = {
  entity?: AnalyticsEntity;
  metadata?: Record<string, unknown>;
  ecommerce?: AnalyticsEcommerce;
};
