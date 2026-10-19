<?php

namespace App\Jobs;

use App\Models\NewsletterSubscriber;
use App\Services\Newsletter\MailchimpAudienceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;

class SyncNewsletterSubscriberToMailchimpJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(
        public readonly int $newsletterSubscriberId,
    ) {}

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [60, 300, 900, 3600];
    }

    public function handle(MailchimpAudienceService $mailchimp): void
    {
        $subscriber = NewsletterSubscriber::query()->find($this->newsletterSubscriberId);

        if (! $subscriber || $subscriber->mailchimp_synced_at !== null || ! $mailchimp->isConfigured()) {
            return;
        }

        try {
            $mailchimp->subscribe($subscriber->email);
        } catch (RequestException $exception) {
            if (! $this->isPermanentFailure($exception)) {
                throw $exception;
            }

            // Retrying cannot help (e.g. an address Mailchimp considers fake or
            // one that was permanently deleted there), so record it and stop.
            Log::warning('Mailchimp rejected a newsletter subscriber.', [
                'newsletter_subscriber_id' => $subscriber->id,
                'status' => $exception->response->status(),
                'title' => $exception->response->json('title'),
                'detail' => $exception->response->json('detail'),
            ]);

            return;
        }

        $subscriber->forceFill(['mailchimp_synced_at' => now()])->save();
    }

    private function isPermanentFailure(RequestException $exception): bool
    {
        $status = $exception->response->status();

        return $status >= 400 && $status < 500 && $status !== 429;
    }
}
