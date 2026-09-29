<?php

namespace App\Services\Payment\Barion;

use App\Support\Payment\BookingPaymentStatus;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Thin client for the Barion Smart Gateway REST API: starts immediate
 * payments (v2 Payment/Start) and reads their state (v4 PaymentState).
 * The POSKey travels in the x-pos-key header and is never logged.
 */
class BarionClient
{
    public const SUPPORTED_CURRENCIES = ['HUF', 'EUR', 'USD', 'CZK'];

    private const API_URLS = [
        'prod' => 'https://api.barion.com',
        'test' => 'https://api.test.barion.com',
    ];

    private const GATEWAY_URLS = [
        'prod' => 'https://secure.barion.com/Pay',
        'test' => 'https://secure.test.barion.com/Pay',
    ];

    /** Barion states in which the customer may still complete the payment. */
    private const OPEN_STATES = ['Prepared', 'Started', 'InProgress', 'Waiting', 'Reserved', 'Authorized'];

    public function isConfigured(): bool
    {
        return filled(config('services.barion.pos_key')) && filled(config('services.barion.payee'));
    }

    public function supportsCurrency(string $currency): bool
    {
        return in_array($currency, self::SUPPORTED_CURRENCIES, true);
    }

    /**
     * @return array{paymentId: string, gatewayUrl: string, status: string}
     *
     * @throws BarionException
     */
    public function startPayment(BarionPaymentRequest $payment): array
    {
        $response = $this->send(fn (PendingRequest $http): Response => $http->post('/v2/Payment/Start', [
            'POSKey' => config('services.barion.pos_key'),
            'PaymentType' => 'Immediate',
            'GuestCheckOut' => true,
            'FundingSources' => ['All'],
            'PaymentWindow' => '00:30:00',
            'PaymentRequestId' => $payment->paymentRequestId,
            'OrderNumber' => $payment->orderNumber,
            'PayerHint' => $payment->payerEmail,
            'Locale' => 'hu-HU',
            'Currency' => $payment->currency,
            'RedirectUrl' => $payment->redirectUrl,
            'CallbackUrl' => $payment->callbackUrl,
            'Transactions' => [[
                'POSTransactionId' => $payment->paymentRequestId,
                'Payee' => config('services.barion.payee'),
                'Total' => $payment->amount,
                'Items' => [[
                    'Name' => Str::limit($payment->itemName, 250, ''),
                    'Description' => Str::limit($payment->itemDescription, 500, ''),
                    'Quantity' => 1,
                    'Unit' => 'db',
                    'UnitPrice' => $payment->amount,
                    'ItemTotal' => $payment->amount,
                    'SKU' => $payment->orderNumber,
                ]],
            ]],
        ]));

        $paymentId = $response->json('PaymentId');

        if (! is_string($paymentId) || $paymentId === '') {
            throw new BarionException('Barion did not return a payment id.');
        }

        $gatewayUrl = $response->json('GatewayUrl');

        return [
            'paymentId' => $paymentId,
            'gatewayUrl' => is_string($gatewayUrl) && $gatewayUrl !== ''
                ? $gatewayUrl
                : $this->gatewayUrlBase().'?'.http_build_query(['id' => $paymentId]),
            'status' => (string) $response->json('Status', 'Prepared'),
        ];
    }

    /**
     * @return array{status: string, providerStatus: string, completedAt: string|null}
     *
     * @throws BarionException
     */
    public function paymentState(string $paymentId): array
    {
        $response = $this->send(fn (PendingRequest $http): Response => $http->get('/v4/Payment/'.rawurlencode($paymentId).'/PaymentState'));
        $providerStatus = (string) $response->json('Status', '');
        $completedAt = $response->json('CompletedAt');

        return [
            'status' => self::toPaymentStatus($providerStatus),
            'providerStatus' => $providerStatus,
            'completedAt' => is_string($completedAt) && $completedAt !== '' ? $completedAt : null,
        ];
    }

    public static function toPaymentStatus(string $providerStatus): string
    {
        return match (true) {
            $providerStatus === 'Succeeded' => BookingPaymentStatus::SUCCEEDED,
            in_array($providerStatus, self::OPEN_STATES, true) => BookingPaymentStatus::STARTED,
            default => BookingPaymentStatus::FAILED,
        };
    }

    /**
     * @param  callable(PendingRequest): Response  $request
     *
     * @throws BarionException
     */
    private function send(callable $request): Response
    {
        if (! $this->isConfigured()) {
            throw new BarionException('Barion is not configured.');
        }

        $http = Http::baseUrl($this->apiUrl())
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.barion.timeout', 15))
            ->withHeaders(['x-pos-key' => (string) config('services.barion.pos_key')]);

        try {
            $response = $request($http);
        } catch (ConnectionException $exception) {
            throw new BarionException('Barion is unreachable: '.$exception->getMessage(), previous: $exception);
        }

        $errors = collect($response->json('Errors') ?? [])
            ->map(fn (mixed $error): string => is_array($error)
                ? trim(($error['ErrorCode'] ?? '').': '.($error['Title'] ?? '').' '.($error['Description'] ?? ''))
                : (string) $error)
            ->filter()
            ->implode('; ');

        if ($response->failed() || $errors !== '') {
            throw new BarionException(sprintf('Barion request failed (HTTP %d): %s', $response->status(), $errors ?: 'no details'));
        }

        return $response;
    }

    private function environment(): string
    {
        return config('services.barion.environment') === 'prod' ? 'prod' : 'test';
    }

    private function apiUrl(): string
    {
        return self::API_URLS[$this->environment()];
    }

    private function gatewayUrlBase(): string
    {
        return self::GATEWAY_URLS[$this->environment()];
    }
}
