<?php

namespace Tests\Feature;

use App\Models\Region;
use App\Models\Tour;
use App\Models\TourReferenceOption;
use App\Models\User;
use App\Support\PublicContentCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'it', 'name' => 'Olaszország', 'active' => true, 'sort_order' => 1]);
        TourReferenceOption::query()->create(['type' => 'country', 'code' => 'ro', 'name' => 'Románia', 'active' => true, 'sort_order' => 2]);
    }

    public function test_search_matches_whole_words_only(): void
    {
        $rome = $this->tour('Az örök város', ['it'], ['Róma', 'Vatikán']);
        $transylvania = $this->tour('Erdélyi körutazás', ['ro'], ['Kolozsvár']);
        $this->tour('Romantikus Velence', ['it'], ['Velence']);

        $this->assertSame([$rome->id], $this->searchIds('roma'));
        $this->assertSame([$transylvania->id], $this->searchIds('Románia'));
        $this->assertSame([$rome->id], $this->searchIds('VATIKAN'));
    }

    public function test_search_falls_back_to_word_beginnings_when_no_whole_word_matches(): void
    {
        $rome = $this->tour('Az örök város', ['it'], ['Róma']);
        $transylvania = $this->tour('Erdélyi körutazás', ['ro'], ['Kolozsvár']);
        $venice = $this->tour('Romantikus Velence', ['it'], ['Velence']);

        $this->assertSame([$rome->id, $transylvania->id, $venice->id], $this->searchIds('rom'));
        $this->assertSame([$rome->id, $venice->id], $this->searchIds('olasz'));
    }

    public function test_search_needs_every_word_of_the_query(): void
    {
        $sanMarino = $this->tour('Itália kincsesládája', ['it'], ['San Marino', 'Rimini']);
        $this->tour('Szicília', ['it'], ['San Vito']);

        $this->assertSame([$sanMarino->id], $this->searchIds('San Marino'));
    }

    public function test_search_ignores_descriptions(): void
    {
        $this->tour('Tóparti pihenés', ['it'], ['Garda'], ['short_description' => 'Romantikus esték Rómától távol']);

        $this->assertSame([], $this->searchIds('romantikus'));
    }

    public function test_suggestions_list_keywords_and_countries_with_their_tour_count(): void
    {
        $this->tour('Az örök város', ['it'], ['Róma']);
        $this->tour('Erdélyi körutazás', ['ro'], ['Kolozsvár']);
        $this->tour('Partium', ['ro'], ['Nagyvárad']);

        $this->getJson('/api/portfolio/search-suggestions?q=rom')
            ->assertOk()
            ->assertExactJson(['data' => [
                ['label' => 'Románia', 'count' => 2],
                ['label' => 'Róma', 'count' => 1],
            ]]);

        $this->getJson('/api/portfolio/search-suggestions?q=r')->assertOk()->assertExactJson(['data' => []]);
    }

    public function test_suggestions_skip_inactive_tours(): void
    {
        $this->tour('Az örök város', ['it'], ['Róma'], ['active' => false]);

        $this->getJson('/api/portfolio/search-suggestions?q=roma')->assertOk()->assertExactJson(['data' => []]);
    }

    public function test_renaming_a_region_updates_the_search(): void
    {
        $region = Region::factory()->create(['name' => 'Toszkána']);
        $tour = $this->tour('Napsütötte vidék', ['it'], [], ['region_id' => $region->id]);

        $region->update(['name' => 'Umbria']);
        PublicContentCache::bump(PublicContentCache::OFFERS);

        $this->assertSame([$tour->id], $this->searchIds('Umbria'));
        $this->assertSame([], $this->searchIds('Toszkána'));
    }

    public function test_keywords_are_cleaned_when_saved(): void
    {
        $tour = $this->tour('Az örök város', ['it'], [' Róma ', 'roma', '', 'Vatikán']);

        $this->assertSame(['Róma', 'Vatikán'], $tour->refresh()->search_keywords);
    }

    public function test_short_description_places_are_suggested_as_keywords(): void
    {
        $this->actingAsTourEditor(['tours.update']);

        $this->postJson('/api/admin/tours/search-keyword-suggestions', [
            'shortDescription' => '<p>Trieszt-Velence – Padova, Murano és Burano szigete - 2 nap</p>',
        ])->assertOk()->assertExactJson(['data' => ['Trieszt', 'Velence', 'Padova', 'Murano', 'Burano szigete']]);
    }

    public function test_keyword_suggestions_need_tour_editing_rights(): void
    {
        $this->actingAsTourEditor(['tours.viewAny']);

        $this->postJson('/api/admin/tours/search-keyword-suggestions', ['shortDescription' => 'Róma'])->assertForbidden();
    }

    /**
     * @param  array<int, string>  $countryIds
     * @param  array<int, string>  $keywords
     * @param  array<string, mixed>  $attributes
     */
    private function tour(string $name, array $countryIds, array $keywords, array $attributes = []): Tour
    {
        return Tour::factory()->create([
            'active' => true,
            'name' => $name,
            'country_ids' => $countryIds,
            'region_id' => null,
            'search_keywords' => $keywords,
            ...$attributes,
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function searchIds(string $query): array
    {
        return collect($this->getJson('/api/portfolio/offers?'.http_build_query(['search' => $query, 'perPage' => 50]))->assertOk()->json('items'))
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->sort()
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsTourEditor(array $permissions): void
    {
        foreach (['tours.viewAny', 'tours.create', 'tours.update'] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Tour Search Test Editor', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
