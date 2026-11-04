# Country shapes for the route maps

`countries.json` holds the outline of every country, used by
`App\Services\Tour\RouteMap\RouteMapRenderer` to draw a tour's route map.

Source: [Natural Earth](https://www.naturalearthdata.com/) v5.1.2, public domain —
`ne_50m_admin_0_countries`, with the United Kingdom taken from
`ne_50m_admin_0_map_units` (England, Scotland, Wales and Northern Ireland
separately, so a trip to England shows England only).

Each entry: `code` (ADM0_A3, or GU_A3 for the UK's countries), `name`
(Hungarian name) and `polygons` — the outer rings only, as `[longitude,
latitude]` pairs rounded to 3 decimals and simplified (Douglas–Peucker,
0.01° tolerance).
