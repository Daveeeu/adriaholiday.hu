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
