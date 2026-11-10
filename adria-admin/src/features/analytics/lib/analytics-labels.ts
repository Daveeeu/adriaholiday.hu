const EVENT_LABELS: Record<string, string> = {
  page_view: 'Oldalmegtekintés',
  offer_view: 'Ajánlat megtekintése',
  category_view: 'Kategóriaoldal megtekintése',
  cta_click: 'Gombra kattintás',
  pricebox_view: 'Árdoboz megjelenése',
  date_select: 'Időpont kiválasztása',
  filter_click: 'Szűrő használata',
  booking_anchor_click: 'Ugrás a foglaláshoz',
  program_pdf_download: 'Program PDF letöltése',
  program_pdf_print: 'Program PDF nyomtatása',
  share: 'Ajánlat megosztása',
  lead_submit: 'Ajánlatkérés elküldése',
  booking_start: 'Foglalás megkezdése',
  booking_success: 'Sikeres foglalás',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  tour: 'Körutazás',
  category: 'Kategória',
  tour_date: 'Időpont',
  program_day: 'Programnap',
  gallery_item: 'Galéria kép',
};

const CTA_LABELS: Record<string, string> = {
  offer_select: 'Ajánlat kiválasztása',
  back_to_offers: 'Vissza az ajánlatokhoz',
  back_to_home: 'Vissza a főoldalra',
};

export function getAnalyticsEventLabel(name: string): string {
  return EVENT_LABELS[name] ?? name;
}

export function getAnalyticsEntityTypeLabel(type: string): string {
  return ENTITY_TYPE_LABELS[type] ?? type;
}

export function getAnalyticsCtaLabel(name: string): string {
  return CTA_LABELS[name] ?? name;
}
