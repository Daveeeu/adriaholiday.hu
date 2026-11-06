<?php

namespace App\Services\Newsletter;

use App\Jobs\SyncNewsletterSubscriberToMailchimpJob;
use App\Mail\NewsletterCouponMail;
use App\Models\Coupon;
use App\Models\NewsletterSubscriber;
use App\Models\SiteSetting;
use App\Services\Mail\LoggedMailer;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Subscribes an email to the newsletter and issues a one-time signup
 * coupon (value configurable via the "newsletter.coupon_value" site
 * setting). Idempotent: resubscribing an already-subscribed email does
 * not issue a second coupon or resend the email, but a subscriber who
 * joins the travel club moves to its audience. New subscribers are queued
 * for the Mailchimp audience sync when Mailchimp is configured.
 */
class NewsletterSubscriptionService
{
    public function __construct(
        private readonly LoggedMailer $mailer,
        private readonly MailchimpAudienceService $mailchimp,
    ) {}

    public function subscribe(string $email, string $audience = NewsletterSubscriber::AUDIENCE_NEWSLETTER): bool
    {
        $email = Str::lower(trim($email));

        $existing = NewsletterSubscriber::query()->where('email', $email)->first();

        if ($existing) {
            $this->moveToTravelClub($existing, $audience);

            return false;
        }

        try {
            $subscriber = DB::transaction(function () use ($email, $audience): NewsletterSubscriber {
                $coupon = Coupon::create([
                    'active' => true,
                    'name' => 'Hírlevél feliratkozás',
                    'email' => $email,
                    'code' => $this->generateCouponCode(),
                    'value' => $this->couponValue(),
                    'used' => false,
                ]);

                return NewsletterSubscriber::create([
                    'email' => $email,
                    'coupon_id' => $coupon->id,
                    'audience' => $audience,
                ])->setRelation('coupon', $coupon);
            });
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                return false;
            }

            throw $exception;
        }

        $this->queueMailchimpSync($subscriber);

        $this->mailer->send(new NewsletterCouponMail($subscriber->coupon), $email);

        return true;
    }

    /**
     * The club is the narrower list, so a club member never moves back.
     */
    private function moveToTravelClub(NewsletterSubscriber $subscriber, string $audience): void
    {
        if ($audience !== NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB || $subscriber->audience === $audience) {
            return;
        }

        $subscriber->update(['audience' => $audience, 'mailchimp_synced_at' => null]);

        $this->queueMailchimpSync($subscriber);
    }

    private function queueMailchimpSync(NewsletterSubscriber $subscriber): void
    {
        if ($this->mailchimp->isConfigured()) {
            SyncNewsletterSubscriberToMailchimpJob::dispatch($subscriber->id);
        }
    }

    private function couponValue(): float
    {
        $value = SiteSetting::query()
            ->where('group', 'newsletter')
            ->where('key', 'coupon_value')
            ->first()
            ?->decodedValue();

        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function generateCouponCode(): string
    {
        do {
            $code = 'HIR-'.strtoupper(Str::random(6));
        } while (Coupon::query()->where('code', $code)->exists());

        return $code;
    }
}
