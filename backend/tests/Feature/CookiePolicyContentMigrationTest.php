<?php

namespace Tests\Feature;

use App\Support\LegalPageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CookiePolicyContentMigrationTest extends TestCase
{
    use RefreshDatabase;

    private const PREVIOUS_DEFAULT = <<<'HTML'
<p>A honlap sütiket (cookie-kat) és a böngészőben tárolt egyéb azonosítókat használ. Az oldal működéséhez szükséges sütiket mindig alkalmazzuk, a statisztikai és marketing célú sütiket csak a hozzájárulásod után aktiváljuk.</p>
<h2>Feltétlenül szükséges sütik</h2>
<p>Az oldal alapvető működéséhez (például a süti-hozzájárulás megjegyzéséhez, a foglalás és az online fizetés biztonságos lebonyolításához) szükségesek. Ezek nem kapcsolhatók ki.</p>
<h2>Statisztikai sütik</h2>
<p>Segítenek megérteni, hogyan használják látogatóink az oldalt (például mely ajánlatokat tekintik meg), hogy javíthassuk a honlapot. Csak hozzájárulás esetén használjuk őket.</p>
<h2>Marketing sütik</h2>
<p>A számunkra releváns hirdetések megjelenítését és mérését szolgálják (például Meta Pixel). Csak hozzájárulás esetén használjuk őket.</p>
<h2>A hozzájárulás módosítása</h2>
<p>Hozzájárulásodat bármikor módosíthatod vagy visszavonhatod az oldal alján található „Süti beállítások módosítása” gombbal. A sütiket a böngésződ beállításaiban is törölheted vagy letilthatod.</p>
<p>A személyes adatok kezelésének részleteit az <a href="/adatvedelem">Adatkezelési szabályzat</a> tartalmazza.</p>
HTML;

    public function test_the_untouched_previous_policy_is_replaced_with_the_cookie_list(): void
    {
        $this->storePolicy(self::PREVIOUS_DEFAULT);

        $this->migration()->up();

        $policy = $this->storedPolicy();
        $this->assertSame(LegalPageContent::defaults()['cookie_content'], $policy);
        $this->assertStringContainsString('_ga_JYZ3KL4M0B', $policy);
        $this->assertStringContainsString('_fbp', $policy);
    }

    public function test_a_policy_edited_in_the_admin_is_kept(): void
    {
        $this->storePolicy('<p>Az iroda saját süti tájékoztatója.</p>');

        $this->migration()->up();

        $this->assertSame('<p>Az iroda saját süti tájékoztatója.</p>', $this->storedPolicy());
    }

    private function storePolicy(string $html): void
    {
        DB::table('site_settings')->updateOrInsert(
            ['group' => LegalPageContent::GROUP, 'key' => 'cookie_content'],
            ['type' => LegalPageContent::TYPE, 'is_public' => true, 'value' => $html],
        );
    }

    private function storedPolicy(): ?string
    {
        return DB::table('site_settings')->where('group', LegalPageContent::GROUP)->where('key', 'cookie_content')->value('value');
    }

    private function migration(): object
    {
        return require database_path('migrations/2026_11_04_160000_update_cookie_policy_for_tag_manager.php');
    }
}
