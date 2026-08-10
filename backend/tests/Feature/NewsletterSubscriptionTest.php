<?php

namespace Tests\Feature;

use App\Mail\NewsletterCouponMail;
use App\Models\Coupon;
use App\Models\NewsletterSubscriber;
use App\Models\SiteSetting;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_subscribing_creates_a_coupon_and_sends_it_by_email(): void
    {
        Mail::fake();

        SiteSetting::query()->updateOrCreate(
            ['group' => 'newsletter', 'key' => 'coupon_value'],
            ['type' => 'number', 'is_public' => true, 'value' => '2500'],
        );

        $response = $this->postJson('/api/newsletter/subscribe', [
            'email' => 'subscriber@example.com',
        ]);

        $response->assertCreated();
        $response->assertJson(['status' => 'subscribed']);

        $subscriber = NewsletterSubscriber::query()->where('email', 'subscriber@example.com')->first();
        $this->assertNotNull($subscriber);
        $this->assertNotNull($subscriber->coupon_id);

        $coupon = Coupon::query()->findOrFail($subscriber->coupon_id);
        $this->assertSame('subscriber@example.com', $coupon->email);
        $this->assertSame(2500.0, (float) $coupon->value);
        $this->assertTrue($coupon->active);
        $this->assertFalse($coupon->used);

        Mail::assertSent(NewsletterCouponMail::class, function (NewsletterCouponMail $mail) use ($coupon) {
            return $mail->coupon->is($coupon)
                && $mail->hasTo('subscriber@example.com');
        });
    }

    public function test_resubscribing_the_same_email_does_not_issue_a_second_coupon(): void
    {
        Mail::fake();

        $this->postJson('/api/newsletter/subscribe', ['email' => 'repeat@example.com'])->assertCreated();

        $response = $this->postJson('/api/newsletter/subscribe', ['email' => 'repeat@example.com']);

        $response->assertCreated();
        $response->assertJson(['status' => 'already_subscribed']);

        $this->assertSame(1, NewsletterSubscriber::query()->where('email', 'repeat@example.com')->count());
        $this->assertSame(1, Coupon::query()->where('email', 'repeat@example.com')->count());
        Mail::assertSent(NewsletterCouponMail::class, 1);
    }

    public function test_subscribing_with_an_invalid_email_returns_a_validation_error(): void
    {
        $response = $this->postJson('/api/newsletter/subscribe', ['email' => 'not-an-email']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }
}
