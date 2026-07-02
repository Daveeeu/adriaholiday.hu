<?php

namespace Tests\Feature;

use App\Jobs\SendMetaConversionEventJob;
use App\Models\AnalyticsEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AnalyticsEventIngestionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_analytics_events_and_does_not_dispatch_meta_job_when_meta_is_disabled(): void
    {
        Queue::fake();
        config()->set('analytics.meta.capi_enabled', false);
        config()->set('analytics.meta.pixel_id', '');
        config()->set('analytics.meta.access_token', '');

        $response = $this->postJson('/api/analytics/events', [
            'event_id' => '9ffcc72c-c70e-421a-ab53-c76b76371877',
            'session_id' => 'session_123',
            'visitor_id' => 'visitor_123',
            'event_name' => 'offer_view',
            'entity' => [
                'type' => 'tour',
                'id' => '42',
                'slug' => 'albania-makedoniaval-fuszerezve',
            ],
            'page' => [
                'url' => 'https://adriaholiday.hu/ajanlat/albania-makedoniaval-fuszerezve',
                'path' => '/ajanlat/albania-makedoniaval-fuszerezve',
                'referrer' => 'https://google.com',
            ],
            'attribution' => [
                'utm_source' => 'google',
                'utm_medium' => 'cpc',
                'utm_campaign' => 'summer',
            ],
            'meta' => [
                'fbp' => 'fb.1.123',
                'fbc' => 'fb.1.456',
            ],
            'consent' => [
                'necessary' => true,
                'analytics' => true,
                'marketing' => true,
            ],
            'metadata' => [
                'position' => 'hero',
            ],
        ]);

        $response->assertAccepted();
        $response->assertJsonPath('stored', true);
        $response->assertJsonPath('queued', false);

        $this->assertDatabaseHas('analytics_events', [
            'event_id' => '9ffcc72c-c70e-421a-ab53-c76b76371877',
            'event_name' => 'offer_view',
            'entity_type' => 'tour',
            'entity_id' => '42',
            'entity_slug' => 'albania-makedoniaval-fuszerezve',
            'utm_source' => 'google',
            'consent_analytics' => true,
            'consent_marketing' => true,
        ]);

        Queue::assertNotPushed(SendMetaConversionEventJob::class);
    }

    public function test_it_skips_persistence_without_analytics_consent(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/analytics/events', [
            'event_id' => 'f4f9acb1-f5d4-42ee-9a90-57ddcc74f278',
            'session_id' => 'session_456',
            'visitor_id' => 'visitor_456',
            'event_name' => 'page_view',
            'page' => [
                'url' => 'https://adriaholiday.hu/',
                'path' => '/',
            ],
            'consent' => [
                'necessary' => true,
                'analytics' => false,
                'marketing' => false,
            ],
        ]);

        $response->assertAccepted();
        $response->assertJsonPath('stored', false);
        $response->assertJsonPath('reason', 'analytics_consent_denied');

        $this->assertSame(0, AnalyticsEvent::query()->count());
        Queue::assertNothingPushed();
    }

    public function test_it_does_not_dispatch_meta_job_when_marketing_consent_is_false(): void
    {
        Queue::fake();
        config()->set('analytics.meta.capi_enabled', true);
        config()->set('analytics.meta.pixel_id', '123456789');
        config()->set('analytics.meta.access_token', 'test-token');

        $response = $this->postJson('/api/analytics/events', [
            'event_id' => '11111111-1111-4111-8111-111111111111',
            'session_id' => 'session_789',
            'visitor_id' => 'visitor_789',
            'event_name' => 'offer_view',
            'entity' => [
                'type' => 'tour',
                'id' => '77',
                'slug' => 'offer-disabled-consent',
            ],
            'page' => [
                'url' => 'https://adriaholiday.hu/ajanlat/offer-disabled-consent',
                'path' => '/ajanlat/offer-disabled-consent',
            ],
            'consent' => [
                'necessary' => true,
                'analytics' => true,
                'marketing' => false,
            ],
        ]);

        $response->assertAccepted();
        $response->assertJsonPath('stored', true);
        $response->assertJsonPath('queued', false);

        Queue::assertNotPushed(SendMetaConversionEventJob::class);
    }

    public function test_it_dispatches_meta_job_when_meta_is_enabled_and_marketing_consent_is_true(): void
    {
        Queue::fake();
        config()->set('analytics.meta.capi_enabled', true);
        config()->set('analytics.meta.pixel_id', '123456789');
        config()->set('analytics.meta.access_token', 'test-token');

        $response = $this->postJson('/api/analytics/events', [
            'event_id' => '22222222-2222-4222-8222-222222222222',
            'session_id' => 'session_987',
            'visitor_id' => 'visitor_987',
            'event_name' => 'offer_view',
            'entity' => [
                'type' => 'tour',
                'id' => '88',
                'slug' => 'offer-meta-enabled',
            ],
            'page' => [
                'url' => 'https://adriaholiday.hu/ajanlat/offer-meta-enabled',
                'path' => '/ajanlat/offer-meta-enabled',
            ],
            'consent' => [
                'necessary' => true,
                'analytics' => true,
                'marketing' => true,
            ],
        ]);

        $response->assertAccepted();
        $response->assertJsonPath('stored', true);
        $response->assertJsonPath('queued', true);

        Queue::assertPushed(SendMetaConversionEventJob::class);
    }
}
