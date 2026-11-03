import { ShieldCheck } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  field,
  fields,
  img,
  list,
  p,
  steps,
  warning,
} from './blocks';

export const administrationChapter: GuideChapter = {
  id: 'administration',
  title: 'Rendszergazda',
  description:
    'Felhasználók, szerepkörök (role-ok) és jogosultságok kezelése: ki mit láthat és módosíthat az adminban.',
  icon: ShieldCheck,
  topics: [
    {
      id: 'users',
      title: 'Felhasználók',
      summary:
        'Az admin felhasználói fiókjai. Itt hozol létre új munkatársat, adsz neki szerepkört, és itt tiltod le a fiókját.',
      path: '/users',
      menu: 'Rendszergazda › Felhasználók',
      access: 'Felhasználók megtekintése',
      blocks: [
        img(
          'users',
          'Felhasználók',
          'A felhasználók listája a szerepkörökkel és az állapottal.',
        ),
        img(
          'user-form',
          'Felhasználó szerkesztése',
          'Egy felhasználó szerkesztése: alapadatok, szerepkörök, valamint egyedi hozzáadott és tiltott jogosultságok.',
        ),
        fields('Mezők', [
          field(
            'Név / Email',
            'A munkatárs neve és belépési e-mail címe.',
            ADMIN_ONLY,
          ),
          field(
            'Új jelszó / Jelszó megerősítése',
            'Új felhasználónál kötelező, meglévőnél csak akkor töltsd ki, ha jelszót cserélsz.',
            ADMIN_ONLY,
          ),
          field(
            'Aktív felhasználó',
            'Kikapcsolva a felhasználó nem tud belépni. A saját fiókodat nem deaktiválhatod.',
            ADMIN_ONLY,
          ),
          field(
            'Szerepkörök',
            'Egy vagy több szerepkör; a felhasználó ezek összes jogosultságát megkapja.',
            ADMIN_ONLY,
          ),
          field(
            'Direkt jogosultság hozzáadása',
            'A szerepkörön felül, kifejezetten ennek a felhasználónak adott jogok.',
            ADMIN_ONLY,
          ),
          field(
            'Direkt jogosultság tiltása',
            'Ezek a jogok akkor is tiltottak, ha egy szerepkör megadná őket.',
            ADMIN_ONLY,
          ),
        ]),
        steps(
          [
            'Kattints az „Új felhasználó” gombra.',
            'Add meg a nevet, az e-mail címet és egy ideiglenes jelszót.',
            'Jelöld be a munkakörnek megfelelő szerepkört (pl. Sales, Marketing).',
            'Ments, majd juttasd el a belépési adatokat biztonságos módon a munkatársnak, és kérd meg, hogy változtassa meg a jelszavát.',
          ],
          'Új munkatárs felvétele',
        ),
        warning(
          'Munkatárs távozásakor azonnal kapcsold ki az „Aktív felhasználó” jelölőt.',
        ),
      ],
    },
    {
      id: 'roles',
      title: 'Role-ok (szerepkörök)',
      summary:
        'A szerepkör jogosultságok csoportja egy munkakörhöz. A felhasználókat szerepkörhöz rendeled, nem egyenként jogokhoz.',
      path: '/roles',
      menu: 'Rendszergazda › Role-ok',
      access: 'Role-ok megtekintése',
      blocks: [
        img(
          'roles',
          'Role-ok',
          'A szerepkörök listája a jogosultságok és felhasználók számával.',
        ),
        img(
          'role-form',
          'Role szerkesztése',
          'Egy szerepkör szerkesztése: megnevezés és a modulonként csoportosított jogosultságok.',
        ),
        fields('Mezők', [
          field(
            'Megnevezés',
            'A szerepkör neve. A rendszer szerepkörök (pl. Super Admin) neve nem módosítható.',
            ADMIN_ONLY,
          ),
          field(
            'Jogosultságok',
            'Modulonként bejelölhető műveletek; a keresővel szűrhetsz.',
            ADMIN_ONLY,
          ),
        ]),
        list(
          [
            'Super Admin: minden jog.',
            'Admin: minden, kivéve a szerepkörök és jogosultságok kezelését.',
            'Marketing: analitika, blog, főoldali ajánlatok, portfólió, Rólunk írták, médiatár, oldalak, átirányítások.',
            'Content Editor: blog, körutazások és kapcsolódó listák, médiatár, foglalási űrlap sablonok, Rólunk írták, oldalak, portfólió.',
            'Sales: foglalások, üzenetek, ügyfelek, kuponok megtekintése és kezelése, körutazások megtekintése.',
            'Operator, Partner Manager, Support, Viewer: szűkebb, munkakörre szabott jogok; a Viewer csak megtekinthet.',
          ],
          'Alap szerepkörök',
        ),
        p(
          'A pontos jogokat mindig a szerepkör szerkesztőjében ellenőrizd, mert azokat a rendszergazda módosíthatja.',
        ),
      ],
    },
    {
      id: 'permissions',
      title: 'Permissionök (jogosultságok)',
      summary:
        'Az összes létező jogosultság modulonként, csak olvasható listában.',
      path: '/permissions',
      menu: 'Rendszergazda › Permissionök',
      access: 'Jogosultságok megtekintése',
      blocks: [
        img(
          'permissions',
          'Permissionök',
          'A jogosultságok modulonként csoportosítva.',
        ),
        fields('A műveletek jelentése', [
          field(
            'viewAny',
            'A lista megtekintése (a menüpont is ettől látszik).',
          ),
          field('view', 'Egy elem részleteinek megtekintése.'),
          field('create', 'Új elem létrehozása.'),
          field('update', 'Meglévő elem módosítása.'),
          field('delete', 'Törlés.'),
          field('status', 'Aktiválás / deaktiválás.'),
          field('export', 'Adatok exportálása.'),
        ]),
      ],
    },
  ],
};
