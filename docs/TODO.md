# TODO

## Elrejtett, nem használt körutazás-mezők végleges törlése

Felvéve: 2026-11-17. A mezők 2026-11-17 óta el vannak rejtve a körutazás-szerkesztőben és a részletek panelen.
A tárolt értékek megmaradnak: a szerkesztő mentéskor változatlanul visszaküldi őket.

Ellenőrizve: sem a publikus oldal, sem a PDF, sem a partner XML feedek, sem az MCP, sem a sales asszisztens nem olvassa őket.
Csak az admin saját listája, szűrői és részletnézete mutatja őket, illetve a régi importerek töltik.

| Mező (admin felirat) | Oszlop / kapcsolat |
|---|---|
| Képes ajánlat? | `tours.image_offer` |
| Slider kép (kapcsoló), Slider szöveg (kapcsoló) | `tours.slider_image_enabled`, `tours.slider_text_enabled` |
| Slider kép (médiaválasztó) | `tours.slider_image` |
| Akció 1, Akció 2 | `tours.action1`, `tours.action2` |
| Program PDF, Program PDF fájlnév | `tours.program_pdf_path`, `tours.program_pdf_file` |
| Elsődleges / Másodlagos gomb felirata | `tours.price_box_cta_primary_label`, `tours.price_box_cta_secondary_label` |
| Csoportok | `tours.group_id`, `TourRegionGroup` |
| Ajánlat csoportok | `tours.seasonal_group_id`, `TourSeasonalGroup` |
| Főoldali ajánlat | `tours.homepage_offer_id`, `HomepageOffer::tours()` |
| FIT | `tours.fit_id` |
| Nehézségi szint | `tours.difficulty_id` |
| Kiemelés csempéző ajánlat | `tours.partner_offer` |
| Partner bónuszok | `tour_partner_bonuses`, `TourPartnerBonus` |
| Minimum fő (árdoboz és időpontok; elrejtve 2026-11-17 délután) | `tours.price_box_min_participants`, `tour_dates.price_box_min_participants` |

Nem törlendő:
- **Kiemelés a pozitív kiemelt ajánlatok között (`recommended`):** a kiemelt ajánlatok sorrendjét adja.

Törlés előtt:
- [ ] Megerősíteni, hogy egyik mezőre sincs többé szükség.
- [ ] Prod adatbázis mentése, és a kitöltött értékek számának ellenőrzése mezőnként.
- [ ] A „slider” média-gyűjtemény (`Tour::mainImage()`) nem azonos a `slider_image` oszloppal. Csak a seederek töltik, az admin nem tudja beállítani; külön dönteni róla.

Törlés lépései:
- [ ] Admin: form-típusok és alapértékek (`tours.types.ts`, `ToursPage.tsx`), lista oszlopai és szűrői (Akció, Képes ajánlat, Csoport, Ajánlat csoport), választólisták API-ja.
- [ ] Backend: `StoreTourRequest` / `UpdateTourRequest`, `TourController`, `TourResource` / `TourDetailResource`, `PriceBoxData`, `TourContentSyncService::syncPartnerBonuses`, `Tour` modell, a lista szűrő és rendező oszlopai.
- [ ] Régiócsoport- és szezonális csoport-kezelő admin oldalak és API-k (ha a csoportok mennek).
- [ ] Legacy importerek mezőleképezése.
- [ ] Migráció az oszlopok és a `tour_partner_bonuses` tábla törlésére.
- [ ] Publikus típus: `partnerBonuses`, `ctaPrimaryLabel`, `ctaSecondaryLabel`, `minParticipants` (`src/app/content/portfolio-offer-detail-api.ts`).
- [ ] Felhasználói útmutató képernyőképei (`tour-form-*`): frissítés.
