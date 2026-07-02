<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsAdminReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();
        Sanctum::actingAs($user);
    }

    public function test_summary_counts_are_correct(): void
    {
        $this->seedAnalyticsFixtures();

        $this->getJson('/api/admin/analytics/summary')
            ->assertOk()
            ->assertJsonPath('counts.pageViews', 2)
            ->assertJsonPath('counts.offerViews', 3)
            ->assertJsonPath('counts.categoryViews', 2)
            ->assertJsonPath('counts.ctaClicks', 2)
            ->assertJsonPath('counts.priceboxViews', 2)
            ->assertJsonPath('counts.dateSelects', 1)
            ->assertJsonPath('counts.filterClicks', 2)
            ->assertJsonPath('topCtas.0.ctaName', 'Foglalás')
            ->assertJsonPath('topCtas.0.eventCount', 2);
    }

    public function test_top_offers_group_by_works(): void
    {
        $this->seedAnalyticsFixtures();

        $this->getJson('/api/admin/analytics/top-offers')
            ->assertOk()
            ->assertJsonPath('items.0.entitySlug', 'offer-alfa')
            ->assertJsonPath('items.0.eventCount', 2)
            ->assertJsonPath('items.1.entitySlug', 'offer-beta')
            ->assertJsonPath('items.1.eventCount', 1);
    }

    public function test_events_pagination_works(): void
    {
        $this->seedAnalyticsFixtures();

        $response = $this->getJson('/api/admin/analytics/events?perPage=5&page=2');

        $response->assertOk();
        $response->assertJsonPath('page', 2);
        $response->assertJsonPath('perPage', 5);
        $response->assertJsonPath('totalCount', 14);
        $this->assertCount(5, $response->json('items'));
    }

    public function test_date_filter_works(): void
    {
        $this->seedAnalyticsFixtures();

        $this->getJson('/api/admin/analytics/summary?from=2026-07-02&to=2026-07-02')
            ->assertOk()
            ->assertJsonPath('counts.pageViews', 1)
            ->assertJsonPath('counts.offerViews', 1)
            ->assertJsonPath('counts.categoryViews', 1)
            ->assertJsonPath('counts.ctaClicks', 1)
            ->assertJsonPath('counts.priceboxViews', 1)
            ->assertJsonPath('counts.filterClicks', 1);
    }

    private function seedAnalyticsFixtures(): void
    {
        $rows = [
            ['event_name' => 'page_view', 'entity_type' => null, 'entity_slug' => null, 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-01 10:00:00'],
            ['event_name' => 'page_view', 'entity_type' => null, 'entity_slug' => null, 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-02 10:00:00'],
            ['event_name' => 'offer_view', 'entity_type' => 'tour', 'entity_id' => '1', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-01 11:00:00'],
            ['event_name' => 'offer_view', 'entity_type' => 'tour', 'entity_id' => '1', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-02 11:00:00'],
            ['event_name' => 'offer_view', 'entity_type' => 'tour', 'entity_id' => '2', 'entity_slug' => 'offer-beta', 'utm_campaign' => 'retargeting', 'metadata' => [], 'created_at' => '2026-07-03 11:00:00'],
            ['event_name' => 'category_view', 'entity_type' => 'category', 'entity_id' => '10', 'entity_slug' => 'korutazasok', 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-01 12:00:00'],
            ['event_name' => 'category_view', 'entity_type' => 'category', 'entity_id' => '11', 'entity_slug' => 'tengerpart', 'utm_campaign' => 'retargeting', 'metadata' => [], 'created_at' => '2026-07-02 12:00:00'],
            ['event_name' => 'cta_click', 'entity_type' => 'tour', 'entity_id' => '1', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'summer-launch', 'metadata' => ['cta_name' => 'Foglalás'], 'created_at' => '2026-07-01 13:00:00'],
            ['event_name' => 'cta_click', 'entity_type' => 'tour', 'entity_id' => '1', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'summer-launch', 'metadata' => ['cta_name' => 'Foglalás'], 'created_at' => '2026-07-02 13:00:00'],
            ['event_name' => 'pricebox_view', 'entity_type' => 'tour', 'entity_id' => '1', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'summer-launch', 'metadata' => [], 'created_at' => '2026-07-01 14:00:00'],
            ['event_name' => 'pricebox_view', 'entity_type' => 'tour', 'entity_id' => '2', 'entity_slug' => 'offer-beta', 'utm_campaign' => 'retargeting', 'metadata' => [], 'created_at' => '2026-07-02 14:00:00'],
            ['event_name' => 'date_select', 'entity_type' => 'tour_date', 'entity_id' => '21', 'entity_slug' => 'offer-alfa', 'utm_campaign' => 'retargeting', 'metadata' => [], 'created_at' => '2026-07-01 15:00:00'],
            ['event_name' => 'filter_click', 'entity_type' => 'category', 'entity_id' => '10', 'entity_slug' => 'korutazasok', 'utm_campaign' => 'summer-launch', 'metadata' => ['filter_value' => 'buszos'], 'created_at' => '2026-07-01 16:00:00'],
            ['event_name' => 'filter_click', 'entity_type' => 'category', 'entity_id' => '11', 'entity_slug' => 'tengerpart', 'utm_campaign' => 'retargeting', 'metadata' => ['filter_value' => 'last-minute'], 'created_at' => '2026-07-02 16:00:00'],
        ];

        foreach ($rows as $index => $row) {
            $timestamp = CarbonImmutable::parse($row['created_at']);

            AnalyticsEvent::query()->forceCreate([
                'event_id' => sprintf('11111111-1111-1111-1111-%012d', $index + 1),
                'session_id' => 'session-' . ($index % 3),
                'visitor_id' => 'visitor-' . ($index % 4),
                'user_id' => null,
                'event_name' => $row['event_name'],
                'entity_type' => $row['entity_type'],
                'entity_id' => $row['entity_id'] ?? null,
                'entity_slug' => $row['entity_slug'],
                'page_url' => 'https://adriaholiday.hu/test',
                'page_path' => '/test',
                'referrer' => 'https://google.com',
                'utm_source' => 'google',
                'utm_medium' => 'cpc',
                'utm_campaign' => $row['utm_campaign'],
                'utm_content' => null,
                'utm_term' => null,
                'metadata' => $row['metadata'],
                'fbp' => 'fb.1.test',
                'fbc' => 'fb.1.test',
                'ip_hash' => 'hashed-ip',
                'user_agent' => 'phpunit',
                'consent_analytics' => true,
                'consent_marketing' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ]);
        }
    }
}
