# Structuring legacy tour programs

Tours imported from the legacy admin keep their whole program in one HTML block, `tours.program`: the daily program, often followed by the price ("Részvételi díj"), what it includes and excludes, departure towns and notes. The admin's program days and price items stay empty, and so does the trip page's "Részvételi díj" section.

`adria:tours:structure-program` splits these blocks up for every active tour:

- **Program days** (`tour_program_days`): a bold or heading line "1. NAP …", "1.nap:", "1 nap", "1–2. nap", "Első nap", "Indulás napja" or "Utolsó nap" starts a day. The title is the rest of the heading ("1. NAP DURRES - TIRANA: …" → "Durres – Tirana: …"), or the day's first sentence when the heading has none. The description is the day's text as cleaned HTML (bold, italic and links kept; colours and fonts dropped).
- **Price items** (`tour_price_items`): one `included` item per line under "Az ár tartalmazza" / "Részvételi díj tartalmazza", one `excluded` item per line under "Az ár nem tartalmazza" / "Milyen (további) költségek merülhetnek fel?" / "Felár", in their original order.
- **The rest of the text** goes to the matching tour field:
  - before the first day: `program_before`;
  - "Részvételi díj …": `prices`;
  - "(További) fakultatív …:": `optional_programs`;
  - "… hosszabbítás …:": `payment_program`;
  - everything else after the days (departure towns, travel documents, "A program tartalmaz…" notes): `program_footer`, before what the field already held.
  The h2 that only repeats the tour's name is left out.

The program itself is emptied. Its original HTML stays in the tour's activity log (the `updated` entry's old values) and in the run's JSON report (`originals`). Each tour also gets a `program_structured` activity log entry.

## Safety rules

- **Dry run by default.** Without `--apply` nothing is written.
- **Repeatable.** A tour that already has program days or price items is skipped. With `--force` it is split again, and its days and price items are replaced. A tour whose program has already been split has no program left and is skipped.
- **Manual review instead of guessing.** A program is left unchanged and reported for manual review when:
  - it has no recognisable day heading;
  - its day numbers are out of order;
  - a day heading is not in bold;
  - a day heading comes after the price block;
  - a day is empty;
  - the price block is prose rather than a list;
  - a price list has no items;
  - any word of the program would not end up somewhere.
- **One transaction per tour.**

## Running it

Back up the database first. On the dedicated VPS:

```bash
sudo /usr/local/sbin/adriaholiday-db-dump
cd /srv/apps/adriaholiday
COMPOSE="docker compose --project-name adriaholiday --env-file .env.production -f docker-compose.prod.yml -f deploy/production/compose.server.yml -f deploy/production/compose.mariadb.yml"
$COMPOSE exec -T app php artisan adria:tours:structure-program            # dry run, all active tours
$COMPOSE exec -T app php artisan adria:tours:structure-program --apply --tour=97 --tour=99
$COMPOSE exec -T app php artisan adria:tours:structure-program --apply    # all active tours
```

Every run writes a report to `storage/app/private/tour-program-structure/`:

- CSV, one line per tour: id, name, status, days, included/excluded items, where the rest went, manual review, reasons;
- JSON, with the summary and the original field values of the tours it changed.

Statuses:

- `would_structure`: dry run, can be split;
- `structured`: split;
- `manual_review`: left as it is, see the reasons;
- `skipped`: already structured, or no program.

## After the move to the dedicated VPS

The VPS database is overwritten with a fresh dump of the old host at the cutover. That drops every change made on the VPS before it. **Run the command again on the live data after the cutover:** first the dry run, then `--apply`. Check the manual review list in the report and finish those tours in the admin by hand.
