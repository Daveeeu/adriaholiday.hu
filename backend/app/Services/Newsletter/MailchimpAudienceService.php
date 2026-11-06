<?php

namespace App\Services\Newsletter;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;

/**
 * Adds subscribers to their Mailchimp audience: travel club members to the
 * club's, everyone else to the newsletter's.
 *
 * Uses the idempotent "add or update" member endpoint: a new address is
 * created as subscribed (or pending with double opt-in), while an existing
 * member keeps its status, so someone who unsubscribed in Mailchimp is never
 * resubscribed by the website.
 */
class MailchimpAudienceService
{
    public function __construct(private readonly HttpFactory $http) {}

    public function isConfigured(): bool
    {
        return $this->dataCenter() !== null
            && $this->audienceId(NewsletterSubscriber::AUDIENCE_NEWSLETTER) !== ''
            && $this->audienceId(NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB) !== '';
    }

    /**
     * @throws RequestException when Mailchimp rejects the request
     */
    public function subscribe(string $email, string $audience): void
    {
        $email = Str::lower(trim($email));

        $this->http
            ->withBasicAuth('adriaholiday', $this->apiKey())
            ->asJson()
            ->acceptJson()
            ->timeout((int) config('services.mailchimp.timeout'))
            ->put($this->memberUrl($email, $audience), [
                'email_address' => $email,
                'status_if_new' => config('services.mailchimp.double_opt_in') ? 'pending' : 'subscribed',
            ])
            ->throw();
    }

    private function memberUrl(string $email, string $audience): string
    {
        return sprintf(
            'https://%s.api.mailchimp.com/3.0/lists/%s/members/%s',
            $this->dataCenter(),
            rawurlencode($this->audienceId($audience)),
            md5($email),
        );
    }

    private function apiKey(): string
    {
        return trim((string) config('services.mailchimp.api_key'));
    }

    private function audienceId(string $audience): string
    {
        return trim((string) config(match ($audience) {
            NewsletterSubscriber::AUDIENCE_TRAVEL_CLUB => 'services.mailchimp.travel_club_audience_id',
            default => 'services.mailchimp.audience_id',
        }));
    }

    /**
     * Mailchimp API keys end in their data center, e.g. "abc123-us21".
     */
    private function dataCenter(): ?string
    {
        $dataCenter = Str::afterLast($this->apiKey(), '-');

        return preg_match('/^[a-z]+\d+$/', $dataCenter) === 1 ? $dataCenter : null;
    }
}
