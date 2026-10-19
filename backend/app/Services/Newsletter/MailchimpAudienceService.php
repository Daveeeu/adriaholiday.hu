<?php

namespace App\Services\Newsletter;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;

/**
 * Adds newsletter subscribers to the configured Mailchimp audience.
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
        return $this->dataCenter() !== null && $this->audienceId() !== '';
    }

    /**
     * @throws RequestException when Mailchimp rejects the request
     */
    public function subscribe(string $email): void
    {
        $email = Str::lower(trim($email));

        $this->http
            ->withBasicAuth('adriaholiday', $this->apiKey())
            ->asJson()
            ->acceptJson()
            ->timeout((int) config('services.mailchimp.timeout'))
            ->put($this->memberUrl($email), [
                'email_address' => $email,
                'status_if_new' => config('services.mailchimp.double_opt_in') ? 'pending' : 'subscribed',
            ])
            ->throw();
    }

    private function memberUrl(string $email): string
    {
        return sprintf(
            'https://%s.api.mailchimp.com/3.0/lists/%s/members/%s',
            $this->dataCenter(),
            rawurlencode($this->audienceId()),
            md5($email),
        );
    }

    private function apiKey(): string
    {
        return trim((string) config('services.mailchimp.api_key'));
    }

    private function audienceId(): string
    {
        return trim((string) config('services.mailchimp.audience_id'));
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
