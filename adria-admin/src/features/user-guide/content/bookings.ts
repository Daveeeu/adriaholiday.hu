import { CalendarDays } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  field,
  fields,
  img,
  list,
  p,
  steps,
  tip,
  warning,
} from './blocks';

const ACCESS = 'Foglalások megtekintése';

export const bookingsChapter: GuideChapter = {
  id: 'bookings',
  title: 'Foglalások',
  description:
    'A beérkezett foglalások, ajánlatkérések és üzenetek feldolgozása, a kuponok, promóciók, partner pénzügyek és a foglalási űrlap sablonok.',
  icon: CalendarDays,
  topics: [
    {
      id: 'bookings-overview',
      title: 'Foglalások áttekintés',
      summary:
        'A Foglalások menüpontra kattintva csempékben látod a modul összes oldalát, a darabszámokkal. Bármelyik csempére kattintva az adott listára jutsz.',
      path: '/bookings',
      menu: 'Foglalások',
      access: ACCESS,
      blocks: [
        img(
          'bookings-overview',
          'Foglalások áttekintés',
          'A Foglalások áttekintő oldala: minden csempe egy listát nyit meg, jobb felső sarkában az elemek száma.',
        ),
        p(
          'A menüben a „Körutazás foglalások” mellett megjelenő szám az új, még fel nem dolgozott foglalásokat jelzi – így bármelyik oldalon látod, ha új foglalás érkezett.',
        ),
      ],
    },
    {
      id: 'tour-bookings',
      title: 'Körutazás foglalások',
      summary:
        'A weboldalon leadott körutazás foglalások listája. Itt követed a foglalás állapotát, a befizetéseket, és innen nyomtatod az utazási könyvet.',
      path: '/bookings/tour-bookings',
      menu: 'Foglalások › Körutazás foglalások',
      access: ACCESS,
      blocks: [
        img(
          'tour-bookings',
          'Körutazás foglalások listája',
          'A foglalások listája státusz-, utazás- és dátumszűrővel, valamint exportálással. A képen a személyes adatok mintaadatokra cserélve láthatók.',
        ),
        fields('Lista és szűrők', [
          field('Összes státusz', 'A foglalás állapota szerint szűr.'),
          field('Összes utazás', 'Egy adott út foglalásai.'),
          field('Ettől / Eddig', 'A jelentkezés dátuma szerinti időszak.'),
          field(
            'Exportálás',
            'A szűrt lista letöltése táblázatként (pl. Excelben megnyitható CSV).',
          ),
          field(
            'Foglalás állapota / Lemondott?',
            'A lista oszlopai; a lemondott foglalás törlés helyett jelölhető.',
          ),
        ]),
        steps(
          [
            'Új foglalás érkezésekor az iroda e-mailt kap, az ügyfél pedig automatikus visszaigazolást a foglalás részleteivel és a fizetési tudnivalókkal.',
            'Nyisd meg a foglalást a sor elején lévő gombbal, és ellenőrizd az adatokat.',
            'Vedd fel a kapcsolatot az ügyféllel, majd állítsd a státuszt „Felvéve a kapcsolat” értékre.',
            'A befizetés után állítsd „Megerősítve” státuszra.',
            'Ha az ügyfél lemondja, állítsd „Lemondva” státuszra; ha nem fizetett határidőre, „Lejárt”-ra.',
          ],
          'Egy foglalás feldolgozása',
        ),
        img(
          'tour-booking-detail',
          'Foglalás részletei – felső rész',
          'A foglalás adatlapja: felül az exportgombok (Utazási könyv PDF, JSON, Nyomtatás), alatta a foglalás adatai, a státuszváltás, az admin megjegyzések, az utazás adatai és az eseménynapló.',
        ),
        fields('A foglalás adatlapja', [
          field(
            'Utazási könyv (PDF)',
            'Letölthető PDF a foglalás összes adatával, az utasoknak átadható formában.',
          ),
          field(
            'JSON / Nyomtatás',
            'A foglalás nyers adatainak letöltése (technikai célra), illetve az adatlap kinyomtatása.',
          ),
          field(
            'Foglalás információ',
            'Azonosító, típus, kuponkód, státusz, létrehozás és módosítás ideje, a foglalás forrása (honnan érkezett a látogató). Az azonosító belső adat: az ügyfél sem a visszaigazoló e-mailben, sem az utazási könyvben nem látja.',
            ADMIN_ONLY,
          ),
          field(
            'Státuszváltás',
            'Válaszd ki az új státuszt és kattints az „Alkalmaz” gombra. Csak az engedélyezett lépések választhatók: Új → Felvéve a kapcsolat / Megerősítve / Lemondva / Lejárt; Felvéve a kapcsolat → Megerősítve / Lemondva / Lejárt; Megerősítve → Lemondva. A Lemondva és a Lejárt végleges állapot.',
            ADMIN_ONLY,
          ),
          field(
            'Admin megjegyzések',
            'Belső jegyzet az ügyintézőknek; az ügyfél nem látja. A „Megjegyzés mentése” gombbal rögzül.',
            ADMIN_ONLY,
          ),
          field(
            'Utazás',
            'A lefoglalt út és időpont adatai: név, webcím, kategória, régió, ország, közlekedés, ár, indulás és érkezés.',
            ADMIN_ONLY,
          ),
          field(
            'Activity Timeline',
            'Időrendben minden esemény: létrejövés, státuszváltások, kiküldött e-mailek és admin módosítások.',
            ADMIN_ONLY,
          ),
        ]),
        img(
          'tour-booking-detail-1',
          'Foglalás részletei – árösszesítő és fizetés',
          'Az árösszesítő, a fizetési ütemezés, az online fizetések és az e-mail előzmények.',
        ),
        fields('Pénzügyi blokkok', [
          field(
            'Árösszesítő',
            'A foglalás pillanatában számolt tételes ár: részvételi díj, kedvezmény, felszállási díj, felárak, kupon, biztosítások és végösszeg. Utólagos árváltozás ezt nem módosítja.',
            'Ugyanez szerepel az ügyfél visszaigazoló e-mailjében.',
          ),
          field(
            'Fizetési ütemezés',
            'A részletek az indulásig hátralévő napok szerint (20/20/60%, 40/60% vagy 100%), határidővel és állapottal (Esedékes, Részben befizetve, Befizetve, Lejárt). Pontosan így kapta meg az utas a visszaigazolásban.',
            'A visszaigazoló e-mailben.',
          ),
          field(
            'Online fizetések',
            'Az online fizetési kísérletek: Előkészítve, Fizetésre vár, Sikeres vagy Sikertelen. Sikertelen fizetésnél az ügyfél újra próbálkozhat.',
            ADMIN_ONLY,
          ),
          field(
            'Email előzmények',
            'A foglaláshoz kiküldött e-mailek (pl. visszaigazolás, irodai értesítés) és kézbesítési állapotuk.',
            ADMIN_ONLY,
          ),
          field(
            'Analytics',
            'A foglaláshoz tartozó mérési adatok (UTM kampány, hivatkozó oldal).',
            ADMIN_ONLY,
          ),
        ]),
        img(
          'tour-booking-detail-2',
          'Foglalás részletei – kapcsolattartó és utasok',
          'A kapcsolattartó elérhetőségei, az utasok adatai és a foglalási űrlap sablon szerint bekért további adatok (a képen mintaadatokkal).',
        ),
        fields('Személyes adatok', [
          field(
            'Kapcsolattartó',
            'A foglalást leadó személy neve, e-mail címe, telefonszáma és címe.',
            ADMIN_ONLY,
          ),
          field(
            'Utasok',
            'Minden utas adatai, a foglalási űrlap sablontól függően (pl. születési dátum, állampolgárság, útiokmány).',
            ADMIN_ONLY,
          ),
          field(
            'Foglalási űrlap adatai',
            'A sablon szerint bekért további mezők (pl. fizetési mód, megjegyzés).',
            ADMIN_ONLY,
          ),
          field(
            'Hiányzó adatok',
            'Csak akkor jelenik meg, ha az ügyfél egy „Utólag e-mailben bekérjük” mezőt üresen hagyott: utasonként felsorolja, mi hiányzik. Az ügyfél a foglalás után e-mailben kapott egy linket, ahol pótolhatja; ha megadta, a kártya eltűnik, és az iroda értesítést kap. Az „Adatbekérő e-mail újraküldése” gombbal a link újra kiküldhető (a korábbi link ezzel érvénytelenné válik).',
            ADMIN_ONLY,
          ),
          field(
            'Nyers adatok',
            'A foglalás összes adata technikai formában; hibakereséshez.',
            ADMIN_ONLY,
          ),
        ]),
        warning(
          'A foglalások személyes adatokat tartalmaznak. Ne továbbítsd és ne nyomtasd ki feleslegesen őket, és a kinyomtatott utazási könyvet kezeld bizalmasan.',
        ),
      ],
    },
    {
      id: 'tour-inquiries',
      title: 'Körutazás ajánlatkérések',
      summary:
        'Az utak oldaláról küldött ajánlatkérések (pl. csoportos vagy egyedi időpontra). Itt követed, hol tart a feldolgozásuk.',
      path: '/bookings/tour-inquiries',
      menu: 'Foglalások › Körutazás ajánlatkérések',
      access: 'Üzenetek megtekintése',
      blocks: [
        img(
          'tour-inquiries',
          'Körutazás ajánlatkérések',
          'Az ajánlatkérések listája névvel, e-mail címmel, ajánlattal, kért időszakkal, létszámmal és státusszal.',
        ),
        fields('Mezők', [
          field(
            'Név / Email / Telefon / Cím',
            'Az érdeklődő elérhetőségei.',
            ADMIN_ONLY,
          ),
          field(
            'Ajánlat / Időpont / Kért időszak / Létszám',
            'Melyik útra, mikorra és hány főre kér ajánlatot.',
            ADMIN_ONLY,
          ),
          field('Üzenet', 'Az érdeklődő szöveges kérése.', ADMIN_ONLY),
          field(
            'Státusz',
            'Új → Kapcsolatban → Ajánlat kiküldve → Lezárva.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Új ajánlatkéréskor az iroda e-mail értesítést kap. A Vezérlőpult „Új ajánlatkérések” kártyája az „Új” státuszúakat számolja.',
        ),
      ],
    },
    {
      id: 'apartment-bookings',
      title: 'Apartman foglalások',
      summary:
        'Az apartmanokra érkezett foglalások, az utasokkal, időpontokkal és a jóváírási állapottal.',
      path: '/bookings/apartment-bookings',
      menu: 'Foglalások › Apartman foglalások',
      access: ACCESS,
      blocks: [
        img(
          'apartment-bookings',
          'Apartman foglalások',
          'Az apartman foglalások listája: név, e-mail, apartman, érkezés, foglalás dátuma, ajánlati kód és utasok száma.',
        ),
        fields('Mezők', [
          field('Foglaló adatok', 'Név, e-mail, telefon, cím.', ADMIN_ONLY),
          field(
            'Apartman neve / Érkezés / Távozás / Apartmantípus',
            'A foglalt apartman és időszak.',
            ADMIN_ONLY,
          ),
          field(
            'Utasbiztosítás / Útlemondási biztosítás',
            'Kért-e biztosítást a foglaló.',
            ADMIN_ONLY,
          ),
          field(
            'Utasok',
            'Utasonként név, születési dátum, lakcím, útiokmány száma.',
            ADMIN_ONLY,
          ),
          field('Egyéb kérés, közlendő', 'A foglaló megjegyzése.', ADMIN_ONLY),
          field('Állapot', 'Új → Jóváhagyva → Jóváírva → Lezárva.', ADMIN_ONLY),
          field(
            'Jóváírva?',
            'Könyvelési jelölés: a foglalás összege jóváírásra került.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Apartman foglaláskor az iroda értesítést, az ügyfél automatikus visszaigazolást kap e-mailben.',
        ),
      ],
    },
    {
      id: 'partner-finances',
      title: 'Partner pénzügyek',
      summary:
        'A partnerirodák és viszonteladók jutalékainak nyilvántartása öt fülön: jutalék jóváírás, jutalék kifizetés, hely jóváírás, jutalék lista és leutazható jutalék.',
      path: '/bookings/partner-finances',
      menu: 'Foglalások › Partner pénzügyek',
      access: 'Partner pénzügyek megtekintése',
      blocks: [
        img(
          'partner-finances',
          'Partner pénzügyek',
          'A partner pénzügyek fülei és a rekordok listája partnerrel, dátummal, összeggel, típussal, státusszal és egyenleggel.',
        ),
        fields('Mezők', [
          field('Partner', 'A partner neve.', ADMIN_ONLY),
          field('Dátum / Összeg', 'A tétel dátuma és összege.', ADMIN_ONLY),
          field(
            'Típus',
            'Jutalék jóváírás, jutalék kifizetés, hely jóváírás stb.; a fülek ez alapján csoportosítanak.',
            ADMIN_ONLY,
          ),
          field(
            'Státusz',
            'Függőben → Jóváhagyva → Kifizetve / Elszámolva.',
            ADMIN_ONLY,
          ),
          field(
            'Egyenleg',
            'A partner aktuális egyenlege a tétel után.',
            ADMIN_ONLY,
          ),
          field('Megjegyzés', 'Belső jegyzet.', ADMIN_ONLY),
        ]),
      ],
    },
    {
      id: 'banner-generator',
      title: 'Banner generálás',
      summary:
        'Partnereknek szánt reklámbannerek összeállítása. A kész bannert a partner a beágyazó kóddal teheti ki a saját weboldalára.',
      path: '/bookings/banner-generator',
      menu: 'Foglalások › Banner generálás',
      access: 'Partner bannerek megtekintése',
      blocks: [
        img(
          'banner-generator',
          'Banner generálás',
          'A bannerek listája névvel, cél URL-lel, képpel és mérettel.',
        ),
        fields('Mezők', [
          field('Banner neve', 'Belső megnevezés.', ADMIN_ONLY),
          field(
            'Banner URL',
            'Ahová a bannerre kattintó látogató jut (pl. egy út oldala).',
            'A partner weboldalán elhelyezett banner linkje.',
          ),
          field(
            'Kép',
            'A banner képe feltöltéssel vagy a médiatárból.',
            'A partner weboldalán.',
          ),
          field(
            'Szélesség / Magasság',
            'A banner mérete pixelben.',
            'A partner weboldalán.',
          ),
          field('Státusz', 'Piszkozat, Aktív vagy Archivált.', ADMIN_ONLY),
          field(
            'Beágyazó kód',
            'A partnernek elküldendő HTML kód; ezt kell bemásolnia a saját oldalába.',
          ),
          field('Előnézet', 'A banner élő előnézete mentés előtt.'),
        ]),
      ],
    },
    {
      id: 'messages',
      title: 'Üzenetek',
      summary:
        'A weboldal kapcsolati űrlapján küldött üzenetek. Az üzenet szövege nem módosítható, a státusza igen.',
      path: '/bookings/messages',
      menu: 'Foglalások › Üzenetek',
      access: 'Üzenetek megtekintése',
      blocks: [
        img(
          'messages',
          'Üzenetek',
          'A kapcsolati üzenetek listája névvel, e-mail címmel, telefonszámmal és dátummal (mintaadatokkal).',
        ),
        fields('Mezők', [
          field(
            'Név / Email / Telefonszám',
            'A küldő elérhetőségei.',
            ADMIN_ONLY,
          ),
          field('Üzenet', 'Az üzenet szövege (csak olvasható).', ADMIN_ONLY),
          field(
            'Státusz',
            'Új → Olvasott → Archivált. Jelöld olvasottnak, amit feldolgoztál.',
            ADMIN_ONLY,
          ),
        ]),
        p('Új üzenet érkezésekor az iroda e-mail értesítést kap.'),
      ],
    },
    {
      id: 'customers',
      title: 'Ügyfelek',
      summary:
        'A régi oldalon regisztrált ügyfelek elérhetőségei és ajánlói kódjai. Foglalásaikat az e-mail címük köti össze velük.',
      path: '/bookings/customers',
      menu: 'Foglalások › Ügyfelek',
      access: 'Ügyfelek megtekintése',
      blocks: [
        img(
          'customer-form',
          'Ügyfél szerkesztése',
          'Ügyfél adatlapja: név, e-mail, telefon, ajánlói kód, cím és megjegyzés.',
        ),
        fields('Mezők', [
          field(
            'Név / E-mail / Telefon',
            'Az ügyfél elérhetőségei. Az e-mail cím köti össze a foglalásaival.',
            ADMIN_ONLY,
          ),
          field(
            'Ajánlói kód',
            'Az ügyfél egyedi ajánlói kódja a régi rendszerből.',
            ADMIN_ONLY,
          ),
          field('Irányítószám / Település / Cím', 'Postai cím.', ADMIN_ONLY),
          field('Megjegyzés', 'Belső jegyzet.', ADMIN_ONLY),
        ]),
      ],
    },
    {
      id: 'coupons',
      title: 'Kuponok',
      summary:
        'A kedvezménykuponok listája. A hírlevélre feliratkozók automatikusan kapnak kupont (értéke a Beállításokban adható meg), de kézzel is létrehozható.',
      path: '/bookings/coupons',
      menu: 'Foglalások › Kuponok',
      access: 'Kuponok megtekintése',
      blocks: [
        img(
          'coupons',
          'Kuponok listája',
          'A kuponok listája névvel, e-mail címmel, kóddal, értékkel, lejárattal és felhasználási állapottal.',
        ),
        img('coupon-form', 'Új kupon', 'Új kupon létrehozása.'),
        fields('Mezők', [
          field(
            'Aktív',
            'Csak aktív kupon váltható be.',
            'A foglalási űrlap kupon mezőjénél.',
          ),
          field('Név / Email', 'Kinek szól a kupon.', ADMIN_ONLY),
          field(
            'Kuponkód',
            'Az ügyfél által beírandó kód (pl. CPN-10150).',
            'A foglalási űrlapon kell beírni; a foglalás árösszesítőjében is látszik.',
          ),
          field(
            'Érték',
            'A kedvezmény összege forintban.',
            'A foglalás árösszesítőjében levonásként.',
          ),
          field(
            'Lejárat',
            'Eddig a napig váltható be. Üresen nem jár le.',
            'A foglalási űrlapon (lejárt kupon nem fogadható el).',
          ),
          field(
            'Felhasználva',
            'Jelöld be, ha a kupont már felhasználták; felhasznált kupon nem váltható be újra.',
            ADMIN_ONLY,
          ),
        ]),
        tip(
          'Kupont csak „Kuponozható” körutazásra lehet beváltani (Körutazás szerkesztő › Alapadatok).',
        ),
      ],
    },
    {
      id: 'promotions',
      title: 'Promóció',
      summary:
        'A publikus főoldal bal alsó sarkában felugró promóciós értesítés kezelése. Csak az aktív és a megadott időablakban lévő promóció jelenik meg a látogatóknak.',
      path: '/bookings/promotions',
      menu: 'Foglalások › Promóció',
      access: 'Promóciók megtekintése',
      blocks: [
        img(
          'promotion-form',
          'Új promóció',
          'Promóció létrehozása: aktív jelölő, cím, üzenet, kód és időablak.',
        ),
        fields('Mezők', [
          field(
            'Aktív',
            'Csak aktív promóció jelenik meg.',
            'A publikus főoldalon.',
          ),
          field(
            'Cím',
            'A promóció címe (pl. „Előfoglalási akció”).',
            'A főoldal bal alsó sarkában felugró promóciós értesítésben.',
          ),
          field(
            'Üzenet szövege',
            'A promóció rövid leírása.',
            'A főoldal bal alsó sarkában felugró promóciós értesítésben.',
          ),
          field(
            'Kupon/promó kód (opcionális)',
            'Ha a promócióhoz kód tartozik, itt add meg.',
            'A főoldal bal alsó sarkában felugró promóciós értesítésben.',
          ),
          field(
            'Kezdés / Lejárat (opcionális)',
            'Az időablak. Előtte „Még nem aktív”, utána „Lejárt” állapotú, és nem jelenik meg.',
            'A főoldalon csak az időablakon belül.',
          ),
        ]),
      ],
    },
    {
      id: 'email-csv-export',
      title: 'E-mail CSV exportálás',
      summary:
        'E-mail címek letöltése CSV fájlba (pl. hírlevélkampányhoz) a foglalásokból vagy az ajánlatkérésekből.',
      path: '/bookings/email-csv-export',
      menu: 'Foglalások › E-mail CSV exportálás',
      access: 'E-mail CSV export',
      blocks: [
        img(
          'email-csv-export',
          'E-mail CSV export',
          'Két export: foglalásokból és ajánlatkérésekből.',
        ),
        list([
          'CSV export foglalásokból: a körutazás foglalások e-mail címei és alapadatai.',
          'CSV export ajánlatkérésekből: az ajánlatkérések e-mail címei és státuszai.',
          'Az „Export indítása” gomb letölti a fájlt, amely Excelben vagy Google Táblázatokban megnyitható.',
        ]),
        warning(
          'Hírlevelet csak azoknak küldj, akik ehhez hozzájárultak. Az exportált fájlt ne oszd meg külső féllel.',
        ),
      ],
    },
    {
      id: 'booking-form-templates',
      title: 'Foglalási űrlap sablonok',
      summary:
        'Meghatározza, milyen adatokat kér be a weboldal foglalási űrlapja. Egy sablonban minden mező kötelező, utólag e-mailben bekérendő, opcionális vagy rejtett lehet; az utakhoz a körutazás szerkesztőben rendelhető sablon.',
      path: '/bookings/booking-form-templates',
      menu: 'Foglalások › Foglalási űrlap sablonok',
      access: 'Foglalási űrlap sablonok megtekintése',
      blocks: [
        img(
          'booking-form-templates',
          'Foglalási űrlap sablonok',
          'A „Sablonok” fül: a sablonok listája, az alapértelmezett sablon jelölve.',
        ),
        img(
          'booking-form-template-form',
          'Sablon szerkesztése',
          'Egy sablon szerkesztése: név, slug, leírás, aktív és alapértelmezett jelölő, valamint a mezők beállítása.',
        ),
        fields('Sablon mezői', [
          field(
            'Sablon neve',
            'Pl. „Buszos út”, „Repülős út”.',
            'A körutazás szerkesztő sablonválasztójában.',
          ),
          field(
            'Slug',
            'Technikai azonosító; üresen automatikusan készül.',
            ADMIN_ONLY,
          ),
          field('Leírás', 'Belső leírás, mire való a sablon.', ADMIN_ONLY),
          field(
            'Aktív',
            'Csak aktív sablon választható az utaknál.',
            ADMIN_ONLY,
          ),
          field(
            'Alapértelmezett sablon',
            'Ezt használja minden út, amelyhez nincs sablon rendelve. Egyszerre csak egy lehet.',
            'Minden sablon nélküli út foglalási űrlapján.',
          ),
          field(
            'Mezők (Kötelező / Utólag e-mailben bekérjük / Opcionális / Rejtett)',
            'Mezőnként állítható: kötelező kitölteni, kitölthető, vagy nem jelenik meg. Az „Utólag e-mailben bekérjük” mezőt az utas üresen hagyhatja; ilyenkor a foglalás után e-mailt kap egy linkkel, ahol pótolhatja, és az iroda értesítést kap, amikor megadta. Az e-mail cím nem kérhető be utólag. A nyilakkal a sorrend változtatható.',
            'A weboldal foglalási űrlapján.',
          ),
        ]),
        img(
          'booking-form-fields',
          'Foglaláskor bekérhető adatok',
          'A „Mezők” fül: az összes bekérhető adat. A „Rendszermező” jelölésűek nem törölhetők.',
        ),
        img(
          'booking-form-field-form',
          'Mező szerkesztése',
          'Egy mező szerkesztése: név, kinek az adata, típus, leírás és ár felirat.',
        ),
        fields('Mező beállításai', [
          field(
            'Mező neve (az ügyfél ezt látja)',
            'Pl. „Lakcím”, „Útlevélszám”.',
            'A foglalási űrlapon a mező címkéjeként.',
          ),
          field(
            'Kinek az adata?',
            'Kapcsolattartó: a 2. lépésben, foglalásonként egyszer. Utas: a 3. lépésben, minden utasnál külön. Extra opciók és megjegyzés: a 4. (véglegesítés) lépésben, egyszer.',
            'A foglalási űrlap megfelelő lépésében.',
          ),
          field(
            'Típus',
            'Szöveg, hosszú szöveg, e-mail, telefonszám, dátum, szám, legördülő lista, választógombok vagy jelölőnégyzet.',
            'A foglalási űrlapon.',
          ),
          field(
            'Választási lehetőségek (soronként egy)',
            'Legördülő listánál és választógomboknál a lehetőségek (pl. Személyi igazolvány / Útlevél).',
            'A foglalási űrlapon.',
          ),
          field(
            'Nem választható lehetőségek',
            'Látszó, de ki nem választható lehetőségek (pl. betelt opció).',
            'A foglalási űrlapon, szürkén.',
          ),
          field(
            'Leírás (opcionális)',
            'Rövid magyarázat a mező alatt.',
            'A foglalási űrlapon a mező alatt.',
          ),
          field(
            'Ár felirat (opcionális)',
            'Pl. „+122.000 Ft” – csak tájékoztató felirat, az árat nem módosítja.',
            'A foglalási űrlapon a mező mellett.',
          ),
        ]),
        tip(
          'Új bekérendő adatnál először a „Mezők” fülön hozd létre a mezőt, majd a sablonokban állítsd kötelezőre vagy opcionálisra.',
        ),
      ],
    },
  ],
};
