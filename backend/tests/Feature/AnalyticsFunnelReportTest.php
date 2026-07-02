<?php

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsFunnelReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();
        Sanctum::actingAs($user);
    }

    public function test_funnel_counts_and_dropoff_are_calculated_for_offer_slug(): void
    {
        $this->seedFunnelFixtures();

        $response = $this->getJson('/api/admin/analytics/funnel?offer_slug=offer-alfa');

        $response->assertOk();
        $response->assertJsonPath('steps.0.key', 'page_view');
        $response->assertJsonPath('steps.0.count', 10);
        $response->assertJsonPath('steps.0.dropoffRate', null);
        $response->assertJsonPath('steps.1.key', 'offer_view');
        $response->assertJsonPath('steps.1.count', 8);
        $response->assertJsonPath('steps.1.dropoffRate', 20);
        $response->assertJsonPath('steps.2.count', 6);
        $response->assertJsonPath('steps.2.dropoffRate', 25);
        $response->assertJsonPath('steps.3.count', 3);
        $response->assertJsonPath('steps.3.dropoffRate', 50);
        $response->assertJsonPath('steps.4.count', 2);
        $response->assertJsonPath('steps.5.count', 1);
        $response->assertJsonPath('steps.6.count', 1);
    }

    public function test_funnel_uses_date_and_campaign_filters(): void
    {
        $this->seedFunnelFixtures();

        $response = $this->getJson('/api/admin/analytics/funnel?offer_slug=offer-alfa&utm_campaign=summer-launch&from=2026-07-01&to=2026-07-01');

        $response->assertOk();
        $response->assertJsonPath('steps.0.count', 6);
        $response->assertJsonPath('steps.1.count', 5);
        $response->assertJsonPath('steps.2.count', 4);
        $response->assertJsonPath('steps.3.count', 2);
        $response->assertJsonPath('steps.4.count', 1);
        $response->assertJsonPath('steps.5.count', 1);
        $response->assertJsonPath('steps.6.count', 0);
    }

    private function seedFunnelFixtures(): void
    {
        $sequence = [
            ['event_name' => 'page_view', 'count' => 6, 'created_at' => '2026-07-01 10:00:00', 'utm_campaign' => 'summer-launch', 'page_path' => '/ajanlat/offer-alfa'],
            ['event_name' => 'offer_view', 'count' => 5, 'created_at' => '2026-07-01 10:10:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'pricebox_view', 'count' => 4, 'created_at' => '2026-07-01 10:20:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'date_select', 'count' => 2, 'created_at' => '2026-07-01 10:30:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'booking_anchor_click', 'count' => 1, 'created_at' => '2026-07-01 10:40:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'lead_start', 'count' => 1, 'created_at' => '2026-07-01 10:50:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'lead_submit', 'count' => 0, 'created_at' => '2026-07-01 11:00:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'page_view', 'count' => 4, 'created_at' => '2026-07-02 10:00:00', 'utm_campaign' => 'retargeting', 'page_path' => '/ajanlat/offer-alfa'],
            ['event_name' => 'offer_view', 'count' => 3, 'created_at' => '2026-07-02 10:10:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'pricebox_view', 'count' => 2, 'created_at' => '2026-07-02 10:20:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'date_select', 'count' => 1, 'created_at' => '2026-07-02 10:30:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'booking_anchor_click', 'count' => 1, 'created_at' => '2026-07-02 10:40:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'booking_start', 'count' => 0, 'created_at' => '2026-07-02 10:50:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'booking_success', 'count' => 1, 'created_at' => '2026-07-02 11:00:00', 'utm_campaign' => 'retargeting', 'entity_slug' => 'offer-alfa'],
            ['event_name' => 'page_view', 'count' => 5, 'created_at' => '2026-07-01 12:00:00', 'utm_campaign' => 'summer-launch', 'page_path' => '/ajanlat/offer-beta'],
            ['event_name' => 'offer_view', 'count' => 5, 'created_at' => '2026-07-01 12:10:00', 'utm_campaign' => 'summer-launch', 'entity_slug' => 'offer-beta'],
        ];

        $index = 1;

        foreach ($sequence as $item) {
            for ($count = 0; $count < $item['count']; $count++) {
                $timestamp = CarbonImmutable::parse($item['created_at'])->addSeconds($count);

                AnalyticsEvent::query()->forceCreate([
                    'event_id' => sprintf('22222222-2222-2222-2222-%012d', $index++),
                    'session_id' => 'session-' . $index,
                    'visitor_id' => 'visitor-' . $index,
                    'user_id' => null,
                    'event_name' => $item['event_name'],
                    'entity_type' => str_contains($item['event_name'], 'page_view') ? null : 'tour',
                    'entity_id' => null,
                    'entity_slug' => $item['entity_slug'] ?? null,
                    'page_url' => 'https://adriaholiday.hu' . ($item['page_path'] ?? '/ajanlat/' . ($item['entity_slug'] ?? 'offer-alfa')),
                    'page_path' => $item['page_path'] ?? '/ajanlat/' . ($item['entity_slug'] ?? 'offer-alfa'),
                    'referrer' => 'https://google.com',
                    'utm_source' => 'google',
                    'utm_medium' => 'cpc',
                    'utm_campaign' => $item['utm_campaign'],
                    'utm_content' => null,
                    'utm_term' => null,
                    'metadata' => [],
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
}
