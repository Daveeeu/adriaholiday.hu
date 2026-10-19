<?php

namespace App\Console\Commands;

use App\Jobs\SyncNewsletterSubscriberToMailchimpJob;
use App\Models\NewsletterSubscriber;
use App\Services\Newsletter\MailchimpAudienceService;
use Illuminate\Console\Command;

class SyncNewsletterSubscribersToMailchimpCommand extends Command
{
    protected $signature = 'newsletter:sync-mailchimp';

    protected $description = 'Queue every newsletter subscriber not yet in the Mailchimp audience for syncing.';

    public function handle(MailchimpAudienceService $mailchimp): int
    {
        if (! $mailchimp->isConfigured()) {
            $this->error('Mailchimp is not configured: set MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID.');

            return self::FAILURE;
        }

        $queued = 0;

        NewsletterSubscriber::query()
            ->notSyncedToMailchimp()
            ->select('id')
            ->chunkById(500, function ($subscribers) use (&$queued): void {
                foreach ($subscribers as $subscriber) {
                    SyncNewsletterSubscriberToMailchimpJob::dispatch($subscriber->id);
                    $queued++;
                }
            });

        $this->info(sprintf('%d subscriber(s) queued for the Mailchimp sync.', $queued));

        return self::SUCCESS;
    }
}
