# Legacy admin export import

The old adriaholiday.hu admin (Futureweb CMS) has no database access, so its data was exported from the browser while logged in. The export is a single JSON file (`adriaholiday_export_*.json`):

- `meta`: when and where the export was made, plus record counts.
- `entities`: one entry per admin list, e.g. `management.reservation`, `roundtrip.offer`, `users.user`. Each record holds:
  - `list`: the list view columns;
  - `fields`: the edit form (`seo[title]` nested to `seo.title`);
  - `selected`: select values the legacy admin sets with JavaScript (relations such as `offer_id` or `place_id`);
  - `view`: the labelled values of read-only forms, e.g. a contact message's text;
  - `gallery_images`: on galleries only.
- `relations`: the lists the legacy forms load separately, keyed by owner id:
  - tour dates, with their form, selections and extras;
  - partner bonuses;
  - blog galleries;
  - departure places → tours;
  - promotions → apartments.

## Running it

```bash
php artisan adria:legacy:import storage/app/private/legacy-import/adriaholiday_export_v2.json --dry-run
php artisan adria:legacy:import storage/app/private/legacy-import/adriaholiday_export_v2.json --force
php artisan adria:legacy:import <file> --only=customers --only=coupons   # single steps
php artisan adria:legacy:import <file> --list                            # step order
```

Back up the database first. The run is idempotent:

- Every imported record is kept in `legacy_import_records` with its legacy JSON.
- A re-run skips unchanged records and updates changed ones.
- One failing record never stops the others.

`--media=listed|all|none` controls copying images from the legacy site. They are downloaded from `LEGACY_ADRIA_FETCH_ORIGIN` when it is set (e.g. `http://admin.adriaholiday.hu`, once `adriaholiday.hu` serves the new site):

- `listed` (the default) copies all images except apartment galleries, which are copied only for the apartments the legacy admin keeps active.
- `all` copies every image, apartment galleries included.
- `none` copies nothing.

## Steps

The steps run in this order.

| Step | Legacy list | Target | Notes |
|---|---|---|---|
| departure-places | roundtrip.felszallas | TourDeparturePlace | Matched by `legacy_id`. |
| tour-region-groups | roundtrip.region | TourRegionGroup | Adopts the group of the same `seo_name`. New groups are imported off. |
| tour-seasonal-groups | roundtrip.offer_group | TourSeasonalGroup | Same as above. |
| tours | roundtrip.offer, roundtrip.teahcer_offer | Tour, TourDate, … | Goes through the catalog import. Starts from the catalog record imported before, so the fields the admin form lacks (program footer, coupon acceptance, partner bonuses) are kept. Never retires tours. |
| apartments | apartment.apartment*, place, region, gallery | Apartment, Location, … | Goes through the apartment import. Apartments active in the legacy admin are published. |
| buses | bus.bus | Bus | The vehicle code is the number plate from the description. New buses are imported off. |
| homepage-offers | mainbox.mainbox | HomepageOffer | Imported off, so the live home page only changes when the office decides. |
| pages | text.flatpage | Page | Imported off, for the office to review. |
| text-blocks | text.textbox | Page (text block) | |
| blog | blog.blog | BlogArticle | Goes through the legacy blog importer. |
| testimonials | aboutus.rolunkirtak | Testimonial | Goes through the legacy testimonial importer. |
| customers | users.user | Customer | The admin accounts (group 3) are left out. No passwords are imported. |
| coupons | management.coupon | Coupon | Also matched by code. |
| contact-messages | management.message | ContactMessage | Imported as `read`. |
| tour-bookings | management.reservation | Booking (tour_booking) | Goes through the legacy booking importer. No e-mails are sent. |
| tour-inquiries | management.inquiry | Booking (tour_inquiry) | Imported as `contacted`. |
| apartment-bookings | management.apartment_reservation | Booking (apartment_booking) | Imported as `contacted`. |
| partner-finances | management.reservation_finances | PartnerFinanceRecord | |
| partner-bonus-places | management.reservation_bonus_place | PartnerFinanceRecord | |
| seo-redirects | redirect.redirect | SeoRedirect | Duplicates are collapsed. Redirects the office made by hand are never overwritten. |

Records the office already made (adopted by their natural key) only get their blank fields filled. Records the import made are fully updated on a re-run.

## Not migrated

- Game players and entries (`picgame2018`, `game_olasz`): finished campaigns. They stay in the export file.
- Gallery folders: the new galleries are flat. The images arrive with the tours and apartments that use them.
- Email templates, SEO entries, blog categories and labels: these legacy lists were not part of the export.
