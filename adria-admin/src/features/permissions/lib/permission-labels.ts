const GROUP_LABELS: Record<string, string> = {
  activity: 'Napló',
  analytics: 'Analitika',
  'apartment-types': 'Apartman típusok',
  apartments: 'Apartmanok',
  'blog-articles': 'Blog cikkek',
  'blog-categories': 'Blog kategóriák',
  'blog-tags': 'Blog címkék',
  'booking-form-templates': 'Foglalási űrlap sablonok',
  bookings: 'Foglalások',
  buses: 'Buszok',
  coupons: 'Kuponok',
  customers: 'Ügyfelek',
  dashboard: 'Vezérlőpult',
  'email-csv-export': 'E-mail export',
  galleries: 'Galériák',
  'homepage-offers': 'Főoldali ajánlatok',
  locations: 'Helyek',
  media: 'Képek és média',
  messages: 'Üzenetek',
  pages: 'Oldalak',
  'partner-banners': 'Partner bannerek',
  'partner-finances': 'Partner pénzügyek',
  permissions: 'Jogosultságok',
  'portfolio-content': 'Főoldal tartalma',
  'portfolio-filter-chips': 'Szűrőgombok',
  promotions: 'Promóciók',
  regions: 'Régiók',
  roles: 'Szerepkörök',
  'select-options': 'Választólisták',
  'seo-redirects': 'Átirányítások',
  'site-settings': 'Weboldal beállításai',
  testimonials: 'Rólunk írták',
  'tour-departure-places': 'Felszállási helyek',
  'tour-partner-offers': 'Partner ajánlatok',
  'tour-reference-options': 'Körutazás törzsadatok',
  'tour-region-groups': 'Régiók és csoportok',
  'tour-seasonal-groups': 'Szezonális csoportok',
  tours: 'Körutazások',
  users: 'Felhasználók',
};

const ACTION_LABELS: Record<string, string> = {
  viewAny: 'Lista megtekintése',
  view: 'Megtekintés',
  create: 'Létrehozás',
  update: 'Módosítás',
  delete: 'Törlés',
  status: 'Állapot módosítása',
  export: 'Exportálás',
  publish: 'Közzététel',
  duplicate: 'Másolás',
  reorder: 'Sorrend módosítása',
};

export function getPermissionGroupLabel(group: string): string {
  return GROUP_LABELS[group] ?? group;
}

export function getPermissionActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}
