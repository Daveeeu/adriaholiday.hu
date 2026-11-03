# SEO Redirect Strategy

## Implemented redirects

- `/korutazasok` -> `/utazasok` (`301`)
- `/korutazasok/{slug}` -> `/ajanlat/{slug}` (`301`)

These redirects are handled in Laravel web routes so legacy links do not land on the SPA 404 page.

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
