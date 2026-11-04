<?php

namespace App\Support\Analytics;

/**
 * The visitor's GA4 identifiers sent along with a booking, so its online
 * payment is reported to Google Analytics for the session (and campaign) the
 * booking came from. Kept only when the visitor allowed statistics cookies.
 */
final class BookingAnalyticsContext
{
    /**
     * @return array<string, array<int, string>>
     */
    public static function rules(): array
    {
        return [
            'analytics' => ['nullable', 'array'],
            'analytics.analytics_consent' => ['boolean'],
            'analytics.ga_client_id' => ['nullable', 'string', 'max:64', 'regex:/^\d+\.\d+$/'],
            'analytics.ga_session_id' => ['nullable', 'string', 'max:20', 'regex:/^\d+$/'],
        ];
    }

    /**
     * The booking payload entry for the validated request data, or null when
     * there is nothing (consented) to keep.
     *
     * @param  array<string, mixed>  $validated
     * @return array{clientId: string, sessionId: ?string}|null
     */
    public static function fromValidated(array $validated): ?array
    {
        $context = $validated['analytics'] ?? null;

        if (! is_array($context) || ! ($context['analytics_consent'] ?? false) || empty($context['ga_client_id'])) {
            return null;
        }

        return [
            'clientId' => (string) $context['ga_client_id'],
            'sessionId' => isset($context['ga_session_id']) ? (string) $context['ga_session_id'] : null,
        ];
    }
}
