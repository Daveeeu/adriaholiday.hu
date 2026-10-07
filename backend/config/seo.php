<?php

return [
    /*
     * The public site's canonical origin. Canonical links, Open Graph URLs, the
     * sitemap and robots.txt point here; the site served on any other host
     * (e.g. a staging domain) is marked noindex so it never competes with it.
     */
    'site_url' => rtrim((string) env('PUBLIC_SITE_URL', 'https://adriaholiday.hu'), '/'),
];
