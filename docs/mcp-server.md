# AI asszisztens (MCP szerver)

A munkatársak a saját Claude-, ChatGPT- vagy Gemini-fiókjukból kérdezhetnek az admin adatairól. Ilyen kérdések például:

- „Hány szabad hely van a júliusi montenegrói úton?”
- „Mutasd Kovács Anna foglalását”
- „Mennyi volt a bevétel októberben?”
- „Hogyan veszek fel új időpontot felárral?”

Az asszisztens a mindig aktuális adatokból válaszol. Képet is mutat: az utak és apartmanok fotóit, illetve „hogyan csináljam” kérdéseknél az admin kézikönyv képernyőképeit.

**Csak olvasni tud.** Semmit nem hoz létre, nem módosít, nem töröl, és e-mailt sem küld. Ha ilyet kérnek tőle, a kézikönyv alapján elmagyarázza, hogyan kell megcsinálni az adminban.

## Csatlakozás

Szerver címe: **`https://adriaholiday.hu/mcp`**

Ehhez az „AI asszisztens (Claude, ChatGPT) › Csatlakozás” jogosultság kell (`mcp.access`). Alapból a Super Admin és az Admin szerepkör kapja meg. Más felhasználónak a Rendszergazda › Szerepkörök vagy Felhasználók oldalon lehet megadni.

### Claude (claude.ai vagy asztali app)

1. Beállítások › Connectors (Csatlakozók) › „Add custom connector”.
2. Név: `Adria Holiday`. URL: `https://adriaholiday.hu/mcp`.
3. „Connect”: megnyílik az Adria Holiday belépőoldala. Itt az admin e-mail címmel és jelszóval kell belépni, majd az „Engedélyezem” gombra kattintani.
4. Egy új beszélgetésben a csatlakozók között kapcsold be az Adria Holiday-t.

### ChatGPT

1. Settings › Apps & Connectors › Advanced settings: kapcsold be a Developer mode-ot (a csapat- vagy céges fiókban ezt az adminnak kell engedélyeznie).
2. „Create” (új connector): név `Adria Holiday`, MCP server URL `https://adriaholiday.hu/mcp`, Authentication: OAuth.
3. Belépés és „Engedélyezem”, ugyanúgy, mint a Claude-nál.

### Gemini

1. Beállítások › Connectors (`gemini.google.com/customize/connectors`) › „+ Custom”. Név: `Adria Holiday`, URL: `https://adriaholiday.hu/mcp`.
2. Ha a Gemini magától regisztrál (dynamic client registration), csak belépni és engedélyezni kell, ugyanúgy, mint a Claude-nál.
3. Ha Client ID-t és Client secretet kér: az „Additional settings › Show more › Copy redirect URI” gombbal másold ki a visszairányítási címet (`https://oauth-redirect.googleusercontent.com/r/…`). Ezzel a szerveren létre kell hozni egy klienst, és a kapott azonosítót és titkos kulcsot be kell írni a Geminibe:

   ```bash
   php artisan passport:client --name="Gemini – <munkatárs>" --redirect_uri="<kimásolt redirect URI>" --no-interaction
   ```

   (Élesben a `docker compose … exec -T app php artisan …` paranccsal, lásd docs/production-server.md.)
4. Gemini Enterprise (céges): a „Custom MCP Server” adattárnál a visszairányítási cím `https://vertexaisearch.cloud.google.com/oauth-redirect`. A klienst ugyanezzel a paranccsal kell létrehozni.

A Gemini app egyéni csatlakozói a Google tájékoztatása szerint nem minden országban és fióktípusnál érhetők el. Ha a „+ Custom” nem jelenik meg, a Claude vagy a ChatGPT használható.

## Mit tud

| Eszköz | Mire jó | Jogosultság |
| --- | --- | --- |
| `search_tours` | Utak keresése név, úti cél, kulcsszó vagy indulási időszak alapján | Körutazások › Lista |
| `get_tour` | Egy út minden indulása árral, helyzettel és foglalt utasokkal, felárak, felszállási helyek, program, mit tartalmaz az ár, **fotók** | Körutazások › Megtekintés (a foglalt utasokhoz: Foglalások › Lista) |
| `search_bookings` | Foglalások, ajánlatkérések és apartmanfoglalások szűrése, ugyanúgy, mint az admin listában | Foglalások › Lista |
| `get_booking` | Egy foglalás teljes adatlapja: utasok, árbontás, részletek, fizetések, kiküldött e-mailek, előzmények | Foglalások › Megtekintés |
| `search_customers` | Ügyfelek keresése | Ügyfelek › Lista |
| `search_apartments`, `get_apartment` | Apartmanok, éjszakánkénti árak (EUR), szolgáltatások, **fotók** | Apartmanok |
| `get_business_overview` | Időszak foglalásai, utasai és bevétele pénznemenként, legkelendőbb utak, havi bontás | Vezérlőpult |
| `search_admin_guide` | Az admin kézikönyve lépésenként, **képernyőképekkel** | mindenkinek, aki csatlakozhat |

Mindenki csak azokat az eszközöket kapja meg, amelyekhez az adminban is van jogosultsága.

## Biztonság

- **Bejelentkezés:** OAuth 2.1 (Laravel Passport). A token egy óráig érvényes, a frissítő token 30 napig. Utána újra be kell lépni.
- **Kizárás:** minden kérésnél ellenőrizzük, hogy a fiók aktív-e, és megvan-e az `mcp.access` jogosultság. A fiók letiltása vagy a jogosultság elvétele azonnal megszünteti a hozzáférést.
- **Naplózás:** minden kérdés bekerül a naplóba (Rendszergazda › Napló, „AI lekérdezés”): ki kérdezett, melyik asszisztensből, melyik eszközzel és milyen paraméterekkel.
- **Kliensek:** OAuth-klienst csak a Claude (`claude.ai`, `claude.com`), a ChatGPT (`chatgpt.com`, `chat.openai.com`) és a Gemini (`oauth-redirect.googleusercontent.com`, Enterprise: `vertexaisearch.cloud.google.com`) címeire lehet regisztrálni (`MCP_REDIRECT_DOMAINS`). Ha ez a lista változik, az `nginx.conf` `$csp_form_action` listáját is frissíteni kell. Különben a böngésző nem engedi vissza a felhasználót az asszisztenshez.
- A válaszok személyes adatot tartalmazhatnak, és a munkatárs AI-fiókjába kerülnek. Céges vagy csapat-előfizetést érdemes használni, ahol a beszélgetésekből nem tanítanak modellt.

## Üzemeltetés

- **Kulcsok:** az OAuth tokeneket aláíró kulcsokat (`storage/oauth-*.key`) az app konténer első induláskor hozza létre (`backend/docker/entrypoint.sh`). A storage kötet megőrzi őket. Ha újakat generálsz, mindenkinek újra csatlakoznia kell.
- **Beállítások** (`backend/config/mcp.php`): `MCP_REDIRECT_DOMAINS`, `MCP_ACCESS_TOKEN_TTL_MINUTES` (60), `MCP_REFRESH_TOKEN_TTL_DAYS` (30), `MCP_REQUESTS_PER_MINUTE` (120 / fő).
- **Munkatársaknak:** az admin kézikönyvében a Rendszergazda › „AI asszisztens (Claude, ChatGPT, Gemini)” rész írja le a csatlakozást.
- **Kézikönyv:** a forrás az `adria-admin/src/features/user-guide/content`. Szerkesztés után futtasd az `npm run user-guide:export` parancsot (adria-admin), ez frissíti a `backend/resources/user-guide/user-guide.json` fájlt. Ellenőrzés: `npm run user-guide:export -- --check`. A képernyőképeket az admin build másolja a `public/admin/guide-images` mappába.
- **Kipróbálás:** `php artisan mcp:inspector mcp`, vagy a `tests/Feature/McpServerTest.php` (a teljes OAuth-folyamat is tesztelve van).

## Kód

- Szerver és eszközök: `backend/app/Mcp`. Útvonalak: `backend/routes/ai.php`.
- Adatok összefoglalása: `backend/app/Services/Mcp` (`TourBriefing`, `BookingBriefing`, `ApartmentBriefing`, `CustomerBriefing`, `AdminUserGuide`, `McpImages`).
- Közös logika az adminnal: `BookingSearch` (foglalásszűrés), `BookingStatistics`, valamint a `Tour::adminSearch`, `Apartment::adminSearch` és `Customer::search` scope-ok.
- Belépés és jóváhagyás: `McpLoginController`, `resources/views/mcp/*`. Hozzáférés-ellenőrzés és naplózás: `AuthorizeMcpRequest`, `McpActivityLogger`.
