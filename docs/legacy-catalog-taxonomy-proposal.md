# Régi kategóriák és régiók – megfeleltetési javaslat

Állapot: **jóváhagyva (2026-10-15)**: a javaslatok és az ellenőrzési lista értékei a `config/legacy_catalog.php`-ban vannak (876: Törökország és Bulgária; 1087: Tengerpartok), a partnerváltozatok aktívak maradnak. A jóváhagyott sorok a
`backend/config/legacy_catalog.php` megfelelő listájába kerülnek; az importáló ezután rendeli őket
az ajánlatokhoz. Az adatok a 360 ajánlatos exportból származnak (2026-10-15). A jelölések: *aktív* =
a régi adminban aktív, *jövőbeli* = van jövőbeli indulása.

## Az új oldal túrakategóriái ma

Az élő oldalon a túrák ezt az öt kategóriát használják (a többi kategória a blogé):

| Kategória | Túrák |
|---|---|
| Körutazások | 92 |
| Osztálykirándulások | 34 |
| Adventi barangolások | 13 |
| Repülős körutazások | 10 |
| Tengerpartok | 7 |

A publikus szűrők között már van **utazási mód** („Autóbuszos utak”, „Repülős utak”), **téma**
és **ár**, a lekérdezés pedig **időtartamra** is szűr. Ezek egy részét a régi csoportok
kategória nélkül is lefedik.

Már automatikusan összekötve (egyértelmű): Körutazás → Körutazások, Tengerparti üdülések →
Tengerpartok, Adventi ajánlatok / Advent / Belföldi advent → Adventi barangolások,
Osztálykirándulás → Osztálykirándulások, a régiók országnév szerint.

## A kiemelt csoportok

### Repülős utak – **javaslat: „Repülős körutazások” (meglévő)**
- 17 ajánlat, 9 aktív, 5 jövőbelivel. Mind a 19 időpontjuk repülős, és mind a 17 a „Körutazás” csoportban is van.
- A „Repülős körutazások” kategóriát az élő oldalon már 10 túra használja; a korábbi importnál is ide kerültek.
- Új kategória nem szükséges. Ha jóváhagyod: `'Repülős utak' => 'Repülős körutazások'`.

### Különlegességek – **javaslat: nincs kategória**
- 35 ajánlat, 11 aktív, 9 jövőbelivel. Vegyes, különleges úti célok (Kaukázus, Marokkó, Isztambul, Portugália, Wrocław, Tátra), 33 busszal és 9 repülővel is.
- Mind a 35 a „Körutazás” csoportban is van, így a „Körutazások” alatt megjelenik.
- Ez a régi kezdőlap válogatott listája volt, nem úti célt vagy utazási formát jelöl. Az új oldalon erre a kiemelés („Kiemelt ajánlat”, kiemelt sorrend) szolgál.
- Alternatíva: új „Különleges úti célok” kategória, ha az irodának saját aloldal kell ehhez a válogatáshoz.

### Pár napos szomszédolások – **javaslat: nincs kategória**
- 30 ajánlat, 11 aktív, 9 jövőbelivel. 1–5 napos buszos utak a szomszédos országokba.
- Mind a 30 a „Körutazás” csoportban is van. A rövid utak az időtartam-szűrővel (1–5 nap) és az ország szerinti szűréssel adatból kereshetők, külön kategória nélkül is.
- Alternatíva: új „Rövid utak (1–5 nap)” kategória, ha saját aloldal kell.

### AKCIÓS Utazások – **javaslat: nincs kategória**
- 5 ajánlat, mind inaktív, egyiknek sincs jövőbeli indulása.
- Az akciót az új oldal időpontonként mutatja (áthúzott eredeti ár, kedvezménycímke). Egy „akciós” kategória gyorsan elavulna.

### Kora nyári ajánlatok – **javaslat: nincs kategória**
- 2 ajánlat, 1 aktív: a 686-os „Napfényes Itália 4 nap”, 13 jövőbeli indulással. Szezonális kampánycsoport.
- Az ajánlat a „Körutazások” és a „Tengerpartok” alatt is megjelenik.
- Alternatíva: a meglévő „Szezonális ajánlatok” kategória. Ezt ma egyetlen túra sem használja; ha a szezonális csoportok mind ide kerülnének, folyamatos karbantartást igényelne.

### Foglalj 0 % előleggel – **javaslat: nincs kategória**
- Ajánlatcsoportként 2, régiócsoportként 3 ajánlat, mind inaktív (2017–2020-as szilveszteri utak).
- Fizetési feltételt jelöl, nem úti célt. Az új oldalon a fizetési ütemezés időpontonként automatikus.

## A többi besorolatlan régi név

| Régi név | Típus | Ajánlat (aktív) | Javaslat |
|---|---|---|---|
| lélegzetelállító tájakon | régiócsoport | 32 (12) | nincs – marketingcsoport; a „Természet” téma lefedheti |
| őszi szünet | régiócsoport | 15 (5) | nincs – szezonális |
| Tavaszi ajánlataink | régiócsoport | 23 (6) | nincs – szezonális |
| őszi ajánlataink | régiócsoport | 11 (6) | nincs – szezonális |
| Nyárindító ajánlatok | régiócsoport | 11 (7) | nincs – szezonális |
| Balkán vidékek | régiócsoport | 15 (6) | nincs – az országok lefedik |
| augusztus 20. hosszú hétvége | régiócsoport | 4 (3) | nincs – szezonális |
| Pünkösdi hosszú hétvége | régiócsoport | 3 (1) | nincs – szezonális |
| TOP 5 program | régiócsoport | 3 (2) | nincs – kiemeléssel oldható meg |
| Havas kalandok | régiócsoport | 3 (1) | nincs |
| tavaszi 10 napos akció | régiócsoport | 1 (0) | nincs |
| Velencei karnevál | régiócsoport | 1 (0) | nincs |
| Foci EB 2024 | régió | 22 (0) | nincs – lezárult esemény |
| Határtalanul | régió | 10 (4) | nincs – mind a 10 már „Osztálykirándulások”; az ország külön kell (lásd lent) |
| Baltikum | régió | 1 (0) | nincs – az ajánlatnak Lengyelország is régiója |

A régi nevek minden ajánlatnál megmaradnak a `legacy_attributes.unmapped` alatt, így később is
utólag besorolhatók.

## Ellenőrzési lista: aktív ajánlatok ország vagy kategória nélkül

Automatikusan csak az került kitöltésre, ami az adatból egyértelmű: ha a régi régió nem ország,
de a régi XML-célállomás (`xml[city]`) pontosan egy ország neve (2× „Erdély” → Románia,
1× „Horvátország”). A lenti javaslatok az ajánlat nevéből származnak, ezért kézi jóváhagyást igényelnek.

| Régi id | Ajánlat | Hiányzik | Javasolt ország | Javasolt kategória |
|---|---|---|---|---|
| 796 | Máramarostól az Erdélyi-medencéig I | ország | Románia | – (Osztálykirándulások megvan) |
| 799 | Délvidéki látogatás | ország | Szerbia | – (Osztálykirándulások megvan) |
| 800 | Kárpátalja csodái | ország | Ukrajna | – (Osztálykirándulások megvan) |
| 854 | Advent a Júlia-Alpokban, Szlovéniában | ország | Szlovénia | – (Adventi barangolások megvan) |
| 876 | Szulejmán nyomában – Bizánc öröksége | ország | Törökország? (ellenőrizendő) | – (Körutazások megvan) |
| 890 | Felvidéki séta | mindkettő | Szlovákia | Körutazások |
| 945 | Magyar emlékek nyomában – Dalmáciában | ország | Horvátország | – (Osztálykirándulások megvan) |
| 950 | Pécs, a kultúra városa és a Zsolnay Negyed | mindkettő | Magyarország | Körutazások |
| 954 | Tihany, a levendulák hazája | ország | Magyarország | – (Körutazások megvan) |
| 970 | Balatonfelvidéki kalandok 1 nap | ország | Magyarország | – (Körutazások megvan) |
| 1012 | Felvidéki kastélyok és városok | mindkettő | Szlovákia | Körutazások |
| 1087 | Albánia, Európa Maldív szigete | mindkettő | Albánia | Tengerpartok vagy Körutazások (ellenőrizendő) |
| 1139 | Grúzia – a Kaukázus kincse | ország | Grúzia | – (Körutazások megvan) |
| 1184 | London | mindkettő | Egyesült Királyság | Körutazások |
| 1198 | Adventi varázslat Graz, Leoben és Eisenstadt | mindkettő | Ausztria | Adventi barangolások |
| 818 | Üdülés az olasz Adrián (11931962) | kategória | – (Olaszország megvan) | partnerajánlat: lásd lent |
| 819 | Üdülés a Toszkán tengerparton (11942896) | kategória | – (Olaszország megvan) | partnerajánlat: lásd lent |
| 835 | Párizs – Versailles – Disneyland 2018 (12448713) | kategória | – (Franciaország megvan) | partnerajánlat: lásd lent |
| 836 | Felvidéki barangolás (1097582) | kategória | – (Szlovákia megvan) | partnerajánlat: lásd lent |

A 818, 819, 835 és 836-os ajánlat a nevében zárójeles számmal (partnerazonosító) jelölt
partnerváltozat. Ezek a régi adminban aktívak, de egyik listában sem szerepelnek, és nincs jövőbeli
indulásuk. **Javaslat:** kategória nélkül maradjanak. Kérdés, hogy aktívként vagy inaktívként
kerüljenek-e át.

A `1155` („a:b”) tesztajánlat archivált és inaktív lesz, ahogy kérted.

Az 54 inaktív, ország vagy kategória nélküli ajánlat nem jelenik meg a publikus oldalon; ezek
nem igényelnek most döntést.

## Egyéb adatminőségi észrevétel

- Egy ajánlatnál a régi SEO-mezőkben a régi admin mintaszövege szerepelt („út címe”,
  „120-160 karakeres mondat…”). Az importáló ezt nem használja SEO-címként vagy -leírásként, és a
  riportban jelzi. Az eredeti érték az ajánlat eredeti JSON-jában megmarad.
