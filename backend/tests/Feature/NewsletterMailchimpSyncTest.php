<?php

namespace Tests\Feature;

use App\Jobs\SyncNewsletterSubscriberToMailchimpJob;
use App\Models\NewsletterSubscriber;
use App\Services\Newsletter\MailchimpAudienceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NewsletterMailchimpSyncTest extends TestCase
{
    use RefreshDatabase;

    private const MEMBER_URL = 'https://us21.api.mailchimp.com/3.0/lists/audience123/members/*';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.mailchimp.api_key' => 'secret-key-us21',
            'services.mailchimp.audience_id' => 'audience123',
            'services.mailchimp.travel_club_audience_id' => 'club456',
            'services.mailchimp.double_opt_in' => false,
        ]);
    }

    public function test_subscribing_queues_the_mailchimp_sync(): void
    {
        Mail::fake();
        Queue::fake();

        $this->postJson('/api/newsletter/subscribe', ['email' => 'New@Example.com'])->assertCreated();

        $subscriber = NewsletterSubscriber::query()->where('email', 'new@example.com')->firstOrFail();

        Queue::assertPushed(
            SyncNewsletterSubscriberToMailchimpJob::class,
            fn (SyncNewsletterSubscriberToMailchimpJob $job) => $job->newsletterSubscriberId === $subscriber->id,
        );
    }

    public function test_subscribing_does_not_queue_the_sync_when_mailchimp_is_not_configured(): void
    {
        Mail::fake();
        Queue::fake();
        config(['services.mailchimp.api_key' => null]);

        $this->postJson('/api/newsletter/subscribe', ['email' => 'new@example.com'])->assertCreated();

        Queue::assertNotPushed(SyncNewsletterSubscriberToMailchimpJob::class);
    }

    public function test_the_job_adds_the_subscriber_to_the_audience_and_marks_it_synced(): void
    {
        Http::fake([self::MEMBER_URL => Http::response(['status' => 'subscribed'])]);
        $subscriber = NewsletterSubscriber::create(['email' => 'new@example.com']);

        SyncNewsletterSubscriberToMailchimpJob::dispatchSync($subscriber->id);

        Http::assertSent(function (Request $request): bool {
            return $request->method() === 'PUT'
                && $request->url() === 'https://us21.api.mailchimp.com/3.0/lists/audience123/members/'.md5('new@example.com')
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('adriaholiday:secret-key-us21'))
                && $request['email_address'] === 'new@example.com'
                && $request['status_if_new'] === 'subscribed';
        });
        $this->assertNotNull($subscriber->fresh()->mailchimp_synced_at);
    }

    public function test_the_job_adds_a_travel_club_member_to_the_club_audience(): void
    {
        Http::fake(['https://us21.api.mailchimp.com/3.0/lists/club456/members/*' => Http::response(['status' => 'subscribed'])]);
        $subscriber = NewsletterSubscriber::create([
            'email' => 'club@example.com',
            'audience' => NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB,
        ]);

        SyncNewsletterSubscriberToMailchimpJob::dispatchSync($subscriber->id);

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://us21.api.mailchimp.com/3.0/lists/club456/members/'.md5('club@example.com'));
        $this->assertNotNull($subscriber->fresh()->mailchimp_synced_at);
    }

    public function test_the_job_asks_for_confirmation_when_double_opt_in_is_enabled(): void
    {
        config(['services.mailchimp.double_opt_in' => true]);
        Http::fake([self::MEMBER_URL => Http::response(['status' => 'pending'])]);
        $subscriber = NewsletterSubscriber::create(['email' => 'new@example.com']);

        SyncNewsletterSubscriberToMailchimpJob::dispatchSync($subscriber->id);

        Http::assertSent(fn (Request $request): bool => $request['status_if_new'] === 'pending');
    }

    public function test_the_job_skips_subscribers_already_synced(): void
    {
        Http::fake();
        $subscriber = NewsletterSubscriber::create(['email' => 'new@example.com', 'mailchimp_synced_at' => now()]);

        SyncNewsletterSubscriberToMailchimpJob::dispatchSync($subscriber->id);

        Http::assertNothingSent();
    }

    public function test_the_job_gives_up_on_an_address_mailchimp_rejects(): void
    {
        Http::fake([self::MEMBER_URL => Http::response(['title' => 'Invalid Resource', 'detail' => 'fake address'], 400)]);
        $subscriber = NewsletterSubscriber::create(['email' => 'new@example.com']);

        SyncNewsletterSubscriberToMailchimpJob::dispatchSync($subscriber->id);

        $this->assertNull($subscriber->fresh()->mailchimp_synced_at);
    }

    public function test_the_job_fails_for_a_retry_when_mailchimp_is_unavailable(): void
    {
        Http::fake([self::MEMBER_URL => Http::response([], 503)]);
        $subscriber = NewsletterSubscriber::create(['email' => 'new@example.com']);

        $this->expectException(RequestException::class);

        (new SyncNewsletterSubscriberToMailchimpJob($subscriber->id))->handle(app(MailchimpAudienceService::class));
    }

    public function test_the_command_queues_only_subscribers_not_yet_synced(): void
    {
        Queue::fake();
        $pending = NewsletterSubscriber::create(['email' => 'pending@example.com']);
        NewsletterSubscriber::create(['email' => 'synced@example.com', 'mailchimp_synced_at' => now()]);

        $this->artisan('newsletter:sync-mailchimp')
            ->expectsOutput('1 subscriber(s) queued for the Mailchimp sync.')
            ->assertSuccessful();

        Queue::assertPushed(SyncNewsletterSubscriberToMailchimpJob::class, 1);
        Queue::assertPushed(
            SyncNewsletterSubscriberToMailchimpJob::class,
            fn (SyncNewsletterSubscriberToMailchimpJob $job) => $job->newsletterSubscriberId === $pending->id,
        );
    }

    public function test_the_command_fails_when_mailchimp_is_not_configured(): void
    {
        Queue::fake();
        config(['services.mailchimp.audience_id' => '']);

        $this->artisan('newsletter:sync-mailchimp')->assertFailed();

        Queue::assertNothingPushed();
    }

    public function test_the_sync_is_off_without_the_travel_club_audience(): void
    {
        Queue::fake();
        NewsletterSubscriber::create(['email' => 'pending@example.com']);
        config(['services.mailchimp.travel_club_audience_id' => '']);

        $this->artisan('newsletter:sync-mailchimp')->assertFailed();

        Queue::assertNothingPushed();
    }

    public function test_a_signup_on_the_club_page_joins_the_travel_club(): void
    {
        Mail::fake();
        Queue::fake();

        $this->postJson('/api/newsletter/subscribe', ['email' => 'club@example.com', 'audience' => 'travel_club'])
            ->assertCreated()
            ->assertJson(['status' => 'subscribed']);

        $this->assertSame(
            NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB,
            NewsletterSubscriber::query()->where('email', 'club@example.com')->value('audience'),
        );
    }

    public function test_an_unknown_audience_is_rejected(): void
    {
        Mail::fake();

        $this->postJson('/api/newsletter/subscribe', ['email' => 'new@example.com', 'audience' => 'vip'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('audience');
    }

    public function test_a_newsletter_subscriber_joining_the_club_moves_and_syncs_again_without_a_new_coupon(): void
    {
        Mail::fake();
        Queue::fake();
        $subscriber = NewsletterSubscriber::create(['email' => 'old@example.com', 'mailchimp_synced_at' => now()]);

        $this->postJson('/api/newsletter/subscribe', ['email' => 'old@example.com', 'audience' => 'travel_club'])
            ->assertCreated()
            ->assertJson(['status' => 'already_subscribed']);

        $subscriber->refresh();
        $this->assertSame(NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB, $subscriber->audience);
        $this->assertNull($subscriber->mailchimp_synced_at);
        Queue::assertPushed(SyncNewsletterSubscriberToMailchimpJob::class, 1);
        Mail::assertNothingOutgoing();
    }

    public function test_a_club_member_stays_in_the_club_when_signing_up_for_the_newsletter(): void
    {
        Mail::fake();
        Queue::fake();
        $subscriber = NewsletterSubscriber::create([
            'email' => 'club@example.com',
            'audience' => NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB,
            'mailchimp_synced_at' => now(),
        ]);

        $this->postJson('/api/newsletter/subscribe', ['email' => 'club@example.com'])->assertCreated();

        $this->assertSame(NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB, $subscriber->fresh()->audience);
        Queue::assertNothingPushed();
    }
}
