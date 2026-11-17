# TODO

## Elrejtett, nem használt körutazás-mezők végleges törlése

Felvéve: 2026-11-17. A kód 2026-11-17-én elkészült (admin, backend, legacy importerek, publikus típus, útmutató),
a `2026_11_17_180000_drop_unused_tour_fields` migráció törli az oszlopokat és a `tour_partner_bonuses` táblát.
Élesítve 2026-11-17-én.

Ellenőrizve törlés előtt: sem a publikus oldal, sem a PDF, sem a partner XML feedek, sem az MCP, sem a sales asszisztens nem olvasta őket.

| Mező (régi admin felirat) | Törölt oszlop / kapcsolat |
|---|---|
| Képes ajánlat? | `tours.image_offer` |
| Slider kép (kapcsoló), Slider szöveg (kapcsoló) | `tours.slider_image_enabled`, `tours.slider_text_enabled` |
| Slider kép (médiaválasztó) | `tours.slider_image` |
| Akció 1, Akció 2 | `tours.action1`, `tours.action2` |
| Program PDF, Program PDF fájlnév | `tours.program_pdf_path`, `tours.program_pdf_file` |
| Elsődleges / Másodlagos gomb felirata | `tours.price_box_cta_primary_label`, `tours.price_box_cta_secondary_label` |
| Csoportok | `tours.group_id` (és `TourRegionGroup::tours()`) |
| Ajánlat csoportok | `tours.seasonal_group_id` (és `TourSeasonalGroup::tours()`) |
| Főoldali ajánlat | `tours.homepage_offer_id` (és `HomepageOffer::tours()`) |
| FIT | `tours.fit_id`, a FIT választólista és létrehozó végpont |
| Nehézségi szint | `tours.difficulty_id`, a nehézségi szint választólista és létrehozó végpont |
| Kiemelés csempéző ajánlat | `tours.partner_offer` |
| Partner bónuszok | `tour_partner_bonuses`, `TourPartnerBonus` |
| Minimum fő (árdoboz és időpontok) | `tours.price_box_min_participants`, `tour_dates.price_box_min_participants` |

Megmaradt: a `recommended` jelölő (a kiemelt ajánlatok sorrendjét adja) és a `slider_text` oszlop.

Élesítés:
- [x] Prod adatbázis mentése: `~/backups/adriaholiday-db-20261117-153619-before-tour-field-drop.sql.gz` a szerveren.
  Kitöltött értékek a törlés előtt (365 út): Képes ajánlat 49, slider kép 153, program PDF útvonal 5, nehézségi szint 1,
  csempéző ajánlat 23, partner bónusz 204 sor, időpont minimum fő 1; a többi mező üres volt.
- [x] Deploy után ellenőrizve: a migráció lefutott (MariaDB), az oszlopok és a tábla eltűntek, az ajánlatoldal, az ajánlat API és a négy partner XML feed 200-at ad, az admin új szerkesztője és a súgóképek kint vannak.

Nyitott:
- [ ] A „Régiók és csoportok” és a „Szezonális ajánlat csoportok” admin oldalak (táblák, API-k, jogosultságok) már egyetlen úthoz sem kötődnek; dönteni kell, törölhetők-e.
- [ ] A „slider” média-gyűjtemény (`Tour::mainImage()`) nem azonos a törölt `slider_image` oszloppal. Csak a seederek töltik, az admin nem tudja beállítani; külön dönteni róla.
- [ ] A `tour_reference_options` táblában maradt `fit` és `difficulty` típusú sorok már semmihez nem tartoznak; törölhetők.
- [ ] Felhasználói útmutató képernyőképei (`tours-list`, `tour-detail`, `tour-form-*`): még a régi oldalpaneles szerkesztőt és a törölt mezőket mutatják, újra kell készíteni őket a teljes oldalas szerkesztőről.
