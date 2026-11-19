# SEO Redirect Strategy

## Implemented redirects

- `/korutazasok` -> `/utazasok` (`301`)
- `/korutazasok/{slug}` -> `/ajanlat/{slug}` (`301`)

These redirects are handled in Laravel web routes so legacy links do not land on the SPA 404 page.

## Legacy catalogue listings

`LegacyCatalogRedirectController` answers the legacy site's listing addresses with one `301` each:

| Address | Target |
| --- | --- |
| `/korutazasok/regio/{country}` | the country's region page (`/regiok/{slug}`), otherwise `/utazasok`; the theme listings `havas-kalandok` and `repulos-utak` lead to their category |
| `/korutazasok/csoport/korutazas/{country}`, `/korutazasok/csoport/tengerparti-udulesek/{country}` | the country's region page, otherwise the group's category |
| `/korutazasok/csoport/advent/{country}` | the advent category (it matches what the listing was searched for) |
| `/korutazasok/csoport/{group}` | the group's category, otherwise `/utazasok` |
| `/egyeni-szallasfoglalas/{country}/{place?}` (Pula, Rovinj, …) | the place's apartments page (`/apartmanok/{area}/{place}`) while it has public apartments, otherwise the country's region page, otherwise `/utazasok` |

The legacy site named countries in Hungarian ("horvatorszag", "Szlovákia"), while regions have a Hungarian or an English slug ("lengyelorszag", "croatia"). `LegacyCatalogPages` matches an active region by slug first, then by its ISO country code (`regions.country_code`). These routes come before the redirect table, so the table's older rows for the same addresses (`egyeni-szallasfoglalas/horvatorszag` → `/korutazasok/regio/horvatorszag`) no longer cause a second hop.

## Recommended server-level rules

For production, keep the same mapping at the reverse proxy level as well, so crawlers and users are redirected before the app boots:

```nginx
rewrite ^/korutazasok/?$ /utazasok permanent;
rewrite ^/korutazasok/(.*)$ /ajanlat/$1 permanent;
```

## Follow-up mapping

If any legacy slug does not match the new offer slug one-to-one, maintain an explicit lookup table and add dedicated `301` rules for those exceptions.

## Redirect table

Old addresses without a page are looked up in the `seo_redirects` table before the 404 page is served (`SeoRedirectResolver`, used by `PortfolioSeoResolver`). A match is answered with a 301 to its target, and the hit is counted.

- **Paths:** source paths are stored decoded, without slashes at either end and without a query string.
- **Legacy redirects:** the legacy site's redirect list is imported by `adria:legacy:import --only=seo-redirects` (see `legacy-admin-export-import.md`). Targets on the legacy domain become site paths, which the route rules above then lead to their new address.
- **Admin editing:** the office manages redirects in the admin (Átirányítások). An edited redirect becomes `manual`, and later imports leave it alone.

## Retired trips, apartments and posts

When the redirect table has no row for the path, `RetiredContentRedirects` leads the address of a trip, apartment or blog post whose page is gone to the closest live listing:

| Address | Target |
| --- | --- |
| `/ajanlat/{slug}` of a trip that is off or deleted | its first active category (`/kategoriak/{seo_name}`, in the order of `category_ids`), otherwise `/utazasok` |
| `/apartman/{slug}` of an apartment that is not visible or is deleted | its location's apartments (`/apartmanok/{area}/{location}`), otherwise `/` |
| `/blog/{slug}` of a post that is off or deleted | `/blog` |
| `/blog/{slug}-{id}` (legacy post URL) | `/blog/{slug}` when that post is live, otherwise `/blog` |
| `/blog/cimke/{tag}`, `/blog/kategoria/{category}` (legacy listings) | `/blog` |

Content that is only switched off may come back at the same address, so it gets a `302`; deleted content and legacy-only addresses get a `301`. With the `/korutazasok/{slug}` rule above, every legacy trip URL ends on a live page.

Paths are percent-decoded before they are resolved, so `/apartman/villa-%28136%29-pu%C4%8Di%C5%A1%C4%87a` finds the same page as its decoded form.
